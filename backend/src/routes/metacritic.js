import express from 'express';
import { MetacriticCrawler } from '../services/metacritic-crawler.js';

const router = express.Router();

/**
 * GET /api/metacritic/status
 * Verifica quantos jogos precisam de notas do Metacritic
 */
router.get('/status', async (req, res) => {
  try {
    const crawler = new MetacriticCrawler();
    const gamesWithoutScores = await crawler.findGamesWithoutMetacriticScore();
    
    res.json({
      success: true,
      data: {
        gamesWithoutScores: gamesWithoutScores.length,
        games: gamesWithoutScores.map(game => ({
          id: game.id,
          name: game.name
        }))
      }
    });
  } catch (error) {
    console.error('Erro ao verificar status do Metacritic:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar status do Metacritic'
    });
  }
});

/**
 * POST /api/metacritic/crawl
 * Executa o crawler do Metacritic
 */
router.post('/crawl', async (req, res) => {
  try {
    const { maxGames = 5, dryRun = false } = req.body;
    
    // Validação dos parâmetros
    if (maxGames < 1 || maxGames > 50) {
      return res.status(400).json({
        success: false,
        error: 'maxGames deve estar entre 1 e 50'
      });
    }

    console.log(`🕷️ Iniciando crawler via API: maxGames=${maxGames}, dryRun=${dryRun}`);
    
    const crawler = new MetacriticCrawler();
    const result = await crawler.crawlAndUpdateScores({
      maxGames,
      dryRun
    });

    res.json({
      success: true,
      data: {
        processed: result.processed,
        updated: result.updated,
        failed: result.failed,
        errors: result.errors,
        successRate: result.processed > 0 ? 
          ((result.updated / result.processed) * 100).toFixed(1) : 0
      }
    });

  } catch (error) {
    console.error('Erro ao executar crawler do Metacritic:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao executar crawler do Metacritic',
      details: error.message
    });
  }
});

/**
 * POST /api/metacritic/search/:gameName
 * Busca nota específica de um jogo no Metacritic
 */
router.post('/search/:gameName', async (req, res) => {
  try {
    const { gameName } = req.params;
    const { updateDatabase = false } = req.body;
    
    if (!gameName || gameName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nome do jogo é obrigatório'
      });
    }

    console.log(`🔍 Buscando nota para "${gameName}" via API`);
    
    // Capturar logs para debug
    const originalLog = console.log;
    const logs = [];
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };
    
    const crawler = new MetacriticCrawler();
    const score = await crawler.searchMetacriticScore(gameName);
    
    // Restaurar console.log
    console.log = originalLog;
    
    const result = {
      success: true,
      data: {
        gameName,
        metacriticScore: score,
        found: score !== null,
        debugLogs: logs // Incluir logs para debug
      }
    };

    // Se foi solicitado para atualizar o banco e existe um score
    if (updateDatabase && score !== null) {
      // Buscar o jogo no banco pelo nome
      const gamesWithoutScores = await crawler.findGamesWithoutMetacriticScore();
      const game = gamesWithoutScores.find(g => 
        g.name.toLowerCase() === gameName.toLowerCase()
      );
      
      if (game) {
        const updated = await crawler.updateGameMetacriticScore(game.id, score);
        result.data.updated = updated;
        result.data.gameId = game.id;
      } else {
        result.data.updated = false;
        result.data.error = 'Jogo não encontrado no banco ou já possui nota';
      }
    }

    res.json(result);

  } catch (error) {
    console.error(`Erro ao buscar nota para "${req.params.gameName}":`, error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar nota no Metacritic',
      details: error.message
    });
  }
});

// Debug endpoint para capturar logs
router.post('/debug/:gameName', async (req, res) => {
  try {
    const { gameName } = req.params;
    
    // Capturar logs
    const originalLog = console.log;
    const logs = [];
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };
    
    const crawler = new MetacriticCrawler();
    const score = await crawler.searchMetacriticScore(gameName);
    
    // Restaurar console.log
    console.log = originalLog;
    
    res.json({
      success: true,
      data: {
        gameName,
        metacriticScore: score,
        found: score !== null,
        logs: logs
      }
    });
    
  } catch (error) {
    console.error('Erro no debug do crawler:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router; 