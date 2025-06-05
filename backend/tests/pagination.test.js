import request from 'supertest';
import express from 'express';
import cors from 'cors';
import gamesRouter from '../src/routes/games.js';

// Setup do app de teste
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/games', gamesRouter);

describe('🚀 API Paginação - TDD Baby Steps', () => {
  
  describe('🔴 RED: GET /api/games com parâmetros de paginação', () => {
    
    test('should accept page and limit parameters', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=20')
        .expect('Content-Type', /json/);

      // Primeiro teste: API deve aceitar parâmetros de paginação
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('games');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 20);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    test('should return first 20 games when page=1&limit=20', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=20')
        .expect(200);

      expect(Array.isArray(response.body.games)).toBe(true);
      expect(response.body.games.length).toBeLessThanOrEqual(20);
      
      // Verificar estrutura de paginação
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(20);
      expect(typeof response.body.pagination.total).toBe('number');
      expect(typeof response.body.pagination.totalPages).toBe('number');
    });

    test('should return different games for page=2', async () => {
      const page1Response = await request(app)
        .get('/api/games?page=1&limit=10')
        .expect(200);

      const page2Response = await request(app)
        .get('/api/games?page=2&limit=10')
        .expect(200);

      // Se há mais de 10 jogos, as páginas devem ser diferentes
      if (page1Response.body.pagination.total > 10) {
        expect(page1Response.body.games).not.toEqual(page2Response.body.games);
      }
    });

    test('should use default values when no parameters provided', async () => {
      const response = await request(app)
        .get('/api/games')
        .expect(200);

      // API deve retornar formato antigo (array direto) para compatibilidade
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('should handle search parameter with pagination', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=5&search=batman')
        .expect(200);

      expect(response.body).toHaveProperty('games');
      expect(response.body).toHaveProperty('pagination');
      
      // Se houver jogos do Batman, verificar que estão filtrados
      if (response.body.games.length > 0) {
        response.body.games.forEach(game => {
          expect(game.name.toLowerCase()).toContain('batman');
        });
      }
    });

    test('should handle platform filter with pagination', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=5&platform=PlayStation%204')
        .expect(200);

      expect(response.body).toHaveProperty('games');
      expect(response.body).toHaveProperty('pagination');
      
      // Se houver jogos de PS4, verificar que estão filtrados
      if (response.body.games.length > 0) {
        response.body.games.forEach(game => {
          expect(game.platforms).toContain('PlayStation 4');
        });
      }
    });

  });

}); 