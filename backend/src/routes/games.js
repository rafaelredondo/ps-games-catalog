import express from 'express';
import { gamesDb } from '../db/database.js';
import Game from '../models/Game.js';

const router = express.Router();

// Função auxiliar para verificar duplicatas
async function checkDuplicate(gameName, platforms, mediaTypes) {
  const games = await gamesDb.getAll();
  return games.some(game => 
    game.name.toLowerCase() === gameName.toLowerCase()
  );
}

// Limpar todo o banco de dados
router.delete('/clear', async (req, res) => {
  try {
    const result = await gamesDb.clearAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao limpar banco de dados' });
  }
});

// Listar todos os jogos com paginação
router.get('/', async (req, res) => {
  try {
    // Parâmetros de paginação
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const platform = req.query.platform || '';
    
    // Buscar todos os jogos
    let allGames = await gamesDb.getAll();
    
    // Aplicar filtros
    if (search) {
      allGames = allGames.filter(game => 
        game.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (platform) {
      allGames = allGames.filter(game => 
        game.platforms && game.platforms.includes(platform)
      );
    }
    
    // Calcular paginação
    const total = allGames.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // Aplicar paginação
    const games = allGames.slice(startIndex, endIndex);
    
    // Se não há parâmetros de paginação, retorna formato antigo para compatibilidade
    if (!req.query.page && !req.query.limit) {
      return res.json(allGames);
    }
    
    // Retornar com estrutura de paginação
    res.json({
      games,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar jogos' });
  }
});

// Buscar jogos por plataforma
router.get('/platform/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const games = await gamesDb.getAll();
    const gamesByPlatform = games.filter(game => 
      game.platforms && game.platforms.includes(platform)
    );
    res.json(gamesByPlatform);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar jogos por plataforma' });
  }
});

// Buscar um jogo específico
router.get('/:id', async (req, res) => {
  try {
    const game = await gamesDb.getById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar jogo' });
  }
});

// Criar um novo jogo
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      platforms, 
      mediaTypes, 
      coverUrl, 
      released, 
      metacritic,
      genres,
      publishers,
      description,
      completed,
      playTime,
      status
    } = req.body;
    
    if (!name || !platforms || !mediaTypes) {
      return res.status(400).json({ error: 'Nome, plataformas e tipos de mídia são obrigatórios' });
    }

    // Verificar duplicata
    const isDuplicate = await checkDuplicate(name, platforms, mediaTypes);
    if (isDuplicate) {
      return res.status(400).json({ 
        error: `Jogo com o nome "${name}" já existe no catálogo` 
      });
    }

    // Definir completed com base no status
    let gameCompleted = completed;
    if (status === 'Concluído') {
      gameCompleted = true;
    } else {
      gameCompleted = false;
    }

    const newGame = new Game(
      Date.now().toString(),
      name,
      platforms,
      mediaTypes,
      coverUrl || '',
      released || '',
      metacritic || null,
      genres || [],
      publishers || [],
      description || '',
      gameCompleted,
      playTime || null,
      status || 'Não iniciado'
    );

    const createdGame = await gamesDb.create(newGame);
    res.status(201).json(createdGame);
  } catch (error) {
    console.error('Erro ao criar jogo:', error);
    res.status(500).json({ error: 'Erro ao criar jogo' });
  }
});

// Atualizar um jogo
router.put('/:id', async (req, res) => {
  try {
    const { 
      name, 
      platforms, 
      mediaTypes, 
      coverUrl, 
      released, 
      metacritic,
      genres,
      publishers,
      description,
      completed,
      playTime,
      status
    } = req.body;
    
    if (!name || !platforms || !mediaTypes) {
      return res.status(400).json({ error: 'Nome, plataformas e tipos de mídia são obrigatórios' });
    }

    // Verificar duplicata, excluindo o jogo atual
    const games = await gamesDb.getAll();
    const isDuplicate = games.some(game => 
      game.id !== req.params.id && 
      game.name.toLowerCase() === name.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({ 
        error: `Jogo com o nome "${name}" já existe no catálogo` 
      });
    }

    // Definir completed com base no status
    let gameCompleted = completed;
    if (status === 'Concluído') {
      gameCompleted = true;
    } else {
      gameCompleted = false;
    }

    const updatedGame = new Game(
      req.params.id,
      name,
      platforms,
      mediaTypes,
      coverUrl || '',
      released || '',
      metacritic || null,
      genres || [],
      publishers || [],
      description || '',
      gameCompleted,
      playTime || null,
      status || 'Não iniciado'
    );

    const game = await gamesDb.update(req.params.id, updatedGame);
    if (!game) {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar jogo' });
  }
});

// Remover um jogo
router.delete('/:id', async (req, res) => {
  try {
    const deletedGame = await gamesDb.delete(req.params.id);
    if (!deletedGame) {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }
    res.json({ message: 'Jogo removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover jogo' });
  }
});

export default router; 