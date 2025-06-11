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

  describe('🔴 RED: GET /api/games com filtros avançados', () => {
    
    test('should filter games by minimum metacritic score', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10&minMetacritic=90')
        .expect(200);

      expect(response.body).toHaveProperty('games');
      expect(response.body).toHaveProperty('pagination');
      
      // Todos os jogos retornados devem ter metacritic >= 90
      response.body.games.forEach(game => {
        if (game.metacritic) {
          expect(game.metacritic).toBeGreaterThanOrEqual(90);
        }
      });
    });

    test('should filter games by genre', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10&genre=Action')
        .expect(200);

      expect(response.body).toHaveProperty('games');
      expect(response.body).toHaveProperty('pagination');
      
      // Todos os jogos retornados devem conter o gênero "Action"
      response.body.games.forEach(game => {
        if (game.genres && Array.isArray(game.genres)) {
          expect(game.genres).toContain('Action');
        }
      });
    });

    test('should filter games by publisher', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10&publisher=Sony')
        .expect(200);

      expect(response.body).toHaveProperty('games');
      expect(response.body).toHaveProperty('pagination');
      
      // Todos os jogos retornados devem conter "Sony" nos publishers
      response.body.games.forEach(game => {
        if (game.publishers && Array.isArray(game.publishers)) {
          expect(game.publishers.some(pub => pub.includes('Sony'))).toBe(true);
        }
      });
    });

    test('should filter games by completion status - completed', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10&status=completed')
        .expect(200);

      expect(response.body).toHaveProperty('games');
      expect(response.body).toHaveProperty('pagination');
      
      // Todos os jogos retornados devem estar completados
      response.body.games.forEach(game => {
        expect(game.completed).toBe(true);
      });
    });

    test('should filter games by completion status - not completed', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10&status=not_completed')
        .expect(200);

      expect(response.body.games).toBeDefined();
      expect(Array.isArray(response.body.games)).toBe(true);
      
      // Verificar se todos os jogos retornados não estão completos
      response.body.games.forEach(game => {
        expect(game.completed).toBe(false);
      });
    });

    test('should filter games by completion status - frontend not_completed value', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10&status=not_completed')
        .expect(200);

      expect(response.body.games).toBeDefined();
      expect(Array.isArray(response.body.games)).toBe(true);
      
      // Verificar se todos os jogos retornados não estão completos
      response.body.games.forEach(game => {
        expect(game.completed).toBe(false);
      });
    });

    test('should combine multiple advanced filters', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=5&minMetacritic=85&genre=Action&status=completed')
        .expect(200);

      expect(response.body).toHaveProperty('games');
      expect(response.body).toHaveProperty('pagination');
      
      // Verificar que todos os filtros são aplicados
      response.body.games.forEach(game => {
        if (game.metacritic) {
          expect(game.metacritic).toBeGreaterThanOrEqual(85);
        }
        if (game.genres && Array.isArray(game.genres)) {
          expect(game.genres).toContain('Action');
        }
        expect(game.completed).toBe(true);
      });
    });

    test('should combine advanced filters with search and sorting', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=5&search=a&minMetacritic=80&orderBy=metacritic&order=desc')
        .expect(200);

      expect(response.body).toHaveProperty('games');
      expect(response.body).toHaveProperty('pagination');
      
      const games = response.body.games;
      
      // Verificar filtro de busca
      games.forEach(game => {
        expect(game.name.toLowerCase()).toContain('a');
      });
      
      // Verificar filtro de metacritic
      games.forEach(game => {
        if (game.metacritic) {
          expect(game.metacritic).toBeGreaterThanOrEqual(80);
        }
      });
      
      // Verificar ordenação por metacritic desc
      const gamesWithMetacritic = games.filter(game => game.metacritic != null);
      if (gamesWithMetacritic.length > 1) {
        for (let i = 1; i < gamesWithMetacritic.length; i++) {
          expect(gamesWithMetacritic[i].metacritic).toBeLessThanOrEqual(gamesWithMetacritic[i-1].metacritic);
        }
      }
    });

  });

  describe('🔴 RED: GET /api/games com parâmetros de ordenação', () => {
    
    test('should accept orderBy and order parameters', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10&orderBy=name&order=asc')
        .expect(200);

      expect(response.body).toHaveProperty('games');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.games)).toBe(true);
    });

    test('should sort games by name in ascending order', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10&orderBy=name&order=asc')
        .expect(200);

      const games = response.body.games;
      if (games.length > 1) {
        // Verificar se está ordenado por nome (A-Z)
        for (let i = 1; i < games.length; i++) {
          expect(games[i].name.localeCompare(games[i-1].name)).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('should sort games by name in descending order', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10&orderBy=name&order=desc')
        .expect(200);

      const games = response.body.games;
      if (games.length > 1) {
        // Verificar se está ordenado por nome (Z-A)
        for (let i = 1; i < games.length; i++) {
          expect(games[i].name.localeCompare(games[i-1].name)).toBeLessThanOrEqual(0);
        }
      }
    });

    test('should sort games by metacritic score in descending order', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10&orderBy=metacritic&order=desc')
        .expect(200);

      const games = response.body.games;
      const gamesWithMetacritic = games.filter(game => game.metacritic != null);
      
      if (gamesWithMetacritic.length > 1) {
        // Verificar se está ordenado por metacritic (maior para menor)
        for (let i = 1; i < gamesWithMetacritic.length; i++) {
          expect(gamesWithMetacritic[i].metacritic).toBeLessThanOrEqual(gamesWithMetacritic[i-1].metacritic);
        }
      }
    });

    test('should sort games by year in descending order', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10&orderBy=year&order=desc')
        .expect(200);

      const games = response.body.games;
      const gamesWithYear = games.filter(game => game.released);
      
      if (gamesWithYear.length > 1) {
        // Verificar se está ordenado por ano (mais recente para mais antigo)
        for (let i = 1; i < gamesWithYear.length; i++) {
          const currentYear = new Date(gamesWithYear[i].released).getFullYear();
          const previousYear = new Date(gamesWithYear[i-1].released).getFullYear();
          expect(currentYear).toBeLessThanOrEqual(previousYear);
        }
      }
    });

    test('should use default order when orderBy provided without order', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10&orderBy=name')
        .expect(200);

      const games = response.body.games;
      if (games.length > 1) {
        // Deve usar ordem ascendente como padrão
        for (let i = 1; i < games.length; i++) {
          expect(games[i].name.localeCompare(games[i-1].name)).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('should sort games by playTime in ascending order', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10&orderBy=playTime&order=asc')
        .expect(200);

      const games = response.body.games;
      const gamesWithPlayTime = games.filter(game => game.playTime != null && game.playTime > 0);
      
      if (gamesWithPlayTime.length > 1) {
        // Verificar se está ordenado por playTime (menor para maior)
        for (let i = 1; i < gamesWithPlayTime.length; i++) {
          expect(gamesWithPlayTime[i].playTime).toBeGreaterThanOrEqual(gamesWithPlayTime[i-1].playTime);
        }
      }
    });

    test('should sort games by playTime in descending order', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10&orderBy=playTime&order=desc')
        .expect(200);

      const games = response.body.games;
      const gamesWithPlayTime = games.filter(game => game.playTime != null && game.playTime > 0);
      
      if (gamesWithPlayTime.length > 1) {
        // Verificar se está ordenado por playTime (maior para menor)
        for (let i = 1; i < gamesWithPlayTime.length; i++) {
          expect(gamesWithPlayTime[i].playTime).toBeLessThanOrEqual(gamesWithPlayTime[i-1].playTime);
        }
      }
    });

    test('should combine sorting with filtering and pagination', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=5&search=a&orderBy=metacritic&order=desc')
        .expect(200);

      expect(response.body).toHaveProperty('games');
      expect(response.body).toHaveProperty('pagination');
      
      const games = response.body.games;
      
      // Verificar que busca foi aplicada
      if (games.length > 0) {
        games.forEach(game => {
          expect(game.name.toLowerCase()).toContain('a');
        });
      }
      
      // Verificar que ordenação foi aplicada
      const gamesWithMetacritic = games.filter(game => game.metacritic != null);
      if (gamesWithMetacritic.length > 1) {
        for (let i = 1; i < gamesWithMetacritic.length; i++) {
          expect(gamesWithMetacritic[i].metacritic).toBeLessThanOrEqual(gamesWithMetacritic[i-1].metacritic);
        }
      }
    });

  });

}); 