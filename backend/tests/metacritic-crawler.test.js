import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MetacriticCrawler } from '../src/services/metacritic-crawler.js';
import { gamesDb } from '../src/db/database.js';

// Mock do axios para testes
vi.mock('axios');
import axios from 'axios';
const mockedAxios = axios;

// Mock do banco de dados
vi.mock('../src/db/database.js');

describe('🕷️ Metacritic Crawler - TDD', () => {
  let crawler;
  
  beforeEach(() => {
    vi.clearAllMocks();
    crawler = new MetacriticCrawler();
  });

  describe('🔴 RED: Buscar jogos sem nota no Metacritic', () => {
    test('should find games without metacritic scores', async () => {
      // Arrange
      const mockGames = [
        { id: 1, name: 'God of War', metacritic: 94 },
        { id: 2, name: 'The Last of Us', metacritic: null },
        { id: 3, name: 'Uncharted 4', metacritic: 93 },
        { id: 4, name: 'Bloodborne', metacritic: null }
      ];
      
      gamesDb.getAll.mockResolvedValue(mockGames);
      
      // Act
      const gamesWithoutScores = await crawler.findGamesWithoutMetacriticScore();
      
      // Assert
      expect(gamesWithoutScores).toHaveLength(2);
      expect(gamesWithoutScores.map(g => g.name)).toEqual(['The Last of Us', 'Bloodborne']);
    });

    test('should return empty array when all games have scores', async () => {
      // Arrange
      const mockGames = [
        { id: 1, name: 'God of War', metacritic: 94 },
        { id: 2, name: 'The Last of Us', metacritic: 95 }
      ];
      
      gamesDb.getAll.mockResolvedValue(mockGames);
      
      // Act
      const gamesWithoutScores = await crawler.findGamesWithoutMetacriticScore();
      
      // Assert
      expect(gamesWithoutScores).toHaveLength(0);
    });
  });

  describe('🔴 RED: Buscar nota no Metacritic', () => {
    test('should search metacritic score for a game', async () => {
      // Arrange
      const mockHtml = `
        <div class="metascore_summary">
          <div class="metascore_anchor">
            <div class="metascore_w large game positive">
              <span class="metascore">94</span>
            </div>
          </div>
        </div>
      `;
      
      mockedAxios.get.mockResolvedValue({ data: mockHtml });
      
      // Act
      const score = await crawler.searchMetacriticScore('God of War');
      
      // Assert
      expect(score).toBe(94);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('metacritic.com/game/'),
        expect.any(Object)
      );
    });

    test('should return null when game not found on metacritic', async () => {
      // Arrange
      const mockHtml = '<html><body>No results found</body></html>';
      mockedAxios.get.mockResolvedValue({ data: mockHtml });
      
      // Act
      const score = await crawler.searchMetacriticScore('Unknown Game');
      
      // Assert
      expect(score).toBeNull();
    });

    test('should handle network errors gracefully', async () => {
      // Arrange
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      
      // Act
      const score = await crawler.searchMetacriticScore('God of War');
      
      // Assert
      expect(score).toBeNull();
    });
  });

  describe('🔴 RED: Atualizar nota no banco', () => {
    test('should update game metacritic score in database', async () => {
      // Arrange
      const gameId = 1;
      const newScore = 94;
      gamesDb.update.mockResolvedValue(true);
      
      // Act
      const result = await crawler.updateGameMetacriticScore(gameId, newScore);
      
      // Assert
      expect(result).toBe(true);
      expect(gamesDb.update).toHaveBeenCalledWith(gameId, { metacritic: newScore });
    });

    test('should handle database update errors', async () => {
      // Arrange
      const gameId = 1;
      const newScore = 94;
      gamesDb.update.mockRejectedValue(new Error('Database error'));
      
      // Act
      const result = await crawler.updateGameMetacriticScore(gameId, newScore);
      
      // Assert
      expect(result).toBe(false);
    });
  });

  describe('🔴 RED: Processo completo de crawler', () => {
    test('should crawl and update games without metacritic scores', async () => {
      // Arrange
      const mockGames = [
        { id: 1, name: 'The Last of Us', metacritic: null },
        { id: 2, name: 'Bloodborne', metacritic: null }
      ];
      
      gamesDb.getAll.mockResolvedValue(mockGames);
      gamesDb.update.mockResolvedValue(true);
      
      // Mock das requisições HTTP
      mockedAxios.get
        .mockResolvedValueOnce({ 
          data: '<span class="metascore">95</span>' 
        })
        .mockResolvedValueOnce({ 
          data: '<span class="metascore">92</span>' 
        });
      
      // Spy nas funções do crawler
      vi.spyOn(crawler, 'searchMetacriticScore')
        .mockResolvedValueOnce(95)
        .mockResolvedValueOnce(92);
      
      // Act
      const result = await crawler.crawlAndUpdateScores();
      
      // Assert
      expect(result.processed).toBe(2);
      expect(result.updated).toBe(2);
      expect(result.failed).toBe(0);
    });

    test('should handle mixed success and failure scenarios', async () => {
      // Arrange
      const mockGames = [
        { id: 1, name: 'The Last of Us', metacritic: null },
        { id: 2, name: 'Unknown Game', metacritic: null }
      ];
      
      gamesDb.getAll.mockResolvedValue(mockGames);
      gamesDb.update.mockResolvedValue(true);
      
      // Spy nas funções do crawler
      vi.spyOn(crawler, 'searchMetacriticScore')
        .mockResolvedValueOnce(95)   // Sucesso para o primeiro
        .mockResolvedValueOnce(null); // Falha para o segundo
      
      // Act
      const result = await crawler.crawlAndUpdateScores();
      
      // Assert
      expect(result.processed).toBe(2);
      expect(result.updated).toBe(1);
      expect(result.failed).toBe(1);
    });
  });
}); 