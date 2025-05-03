import express from 'express';
import { gamesDb } from '../db/database.js';
import Game from '../models/Game.js';

const router = express.Router();

// Função auxiliar para verificar duplicatas
async function checkDuplicate(gameName, platform, mediaType) {
  const games = await gamesDb.getAll();
  return games.some(game => 
    game.name === gameName && 
    game.platform === platform && 
    game.mediaType === mediaType
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

// Listar todos os jogos
router.get('/', async (req, res) => {
  try {
    const games = await gamesDb.getAll();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar jogos' });
  }
});

// Buscar jogos por plataforma
router.get('/platform/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const games = await gamesDb.getAll();
    const gamesByPlatform = games.filter(game => game.platform === platform);
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
    const { name, platform, mediaType, coverUrl, rating, playtime, priority } = req.body;
    
    if (!name || !platform || !mediaType) {
      return res.status(400).json({ error: 'Nome, plataforma e tipo de mídia são obrigatórios' });
    }

    // Verificar duplicata
    const isDuplicate = await checkDuplicate(name, platform, mediaType);
    if (isDuplicate) {
      return res.status(400).json({ 
        error: `Jogo "${name}" já existe para ${platform} (${mediaType})` 
      });
    }

    const newGame = new Game(
      Date.now().toString(),
      name,
      platform,
      mediaType,
      coverUrl || '',
      rating || '',
      playtime || '',
      priority || ''
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
    const { name, platform, mediaType, coverUrl, rating, playtime, priority } = req.body;
    
    if (!name || !platform || !mediaType) {
      return res.status(400).json({ error: 'Nome, plataforma e tipo de mídia são obrigatórios' });
    }

    // Verificar duplicata, excluindo o jogo atual
    const games = await gamesDb.getAll();
    const isDuplicate = games.some(game => 
      game.id !== req.params.id && 
      game.name === name && 
      game.platform === platform && 
      game.mediaType === mediaType
    );

    if (isDuplicate) {
      return res.status(400).json({ 
        error: `Jogo "${name}" já existe para ${platform} (${mediaType})` 
      });
    }

    const updatedGame = new Game(
      req.params.id,
      name,
      platform,
      mediaType,
      coverUrl || '',
      rating || '',
      playtime || '',
      priority || ''
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