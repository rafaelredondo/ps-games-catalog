import express from 'express';
import { gamesDb } from '../db/database.js';

const router = express.Router();

// Função auxiliar para verificar duplicatas
async function checkDuplicate(gameName, platform, mediaType) {
  const games = await gamesDb.getAll();
  return games.some(game => 
    game.name === gameName && 
    game.platforms.some(p => 
      p.platform === platform && 
      p.mediaType === mediaType
    )
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
    
    // Filtra os jogos que têm a plataforma especificada
    const gamesByPlatform = games.filter(game => 
      game.platforms.some(p => p.platform === platform)
    );

    // Para cada jogo, inclui apenas a plataforma específica
    const formattedGames = gamesByPlatform.map(game => ({
      ...game,
      platforms: game.platforms.filter(p => p.platform === platform)
    }));

    res.json(formattedGames);
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
    const { name, platforms } = req.body;
    
    if (!name || !platforms || !Array.isArray(platforms)) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    // Validar cada plataforma
    for (const platform of platforms) {
      if (!platform.platform || !platform.mediaType) {
        return res.status(400).json({ 
          error: 'Cada plataforma deve ter platform e mediaType definidos' 
        });
      }

      // Verificar duplicata para cada plataforma
      const isDuplicate = await checkDuplicate(
        name, 
        platform.platform, 
        platform.mediaType
      );

      if (isDuplicate) {
        return res.status(400).json({ 
          error: `Jogo "${name}" já existe para ${platform.platform} (${platform.mediaType})` 
        });
      }
    }

    const newGame = {
      id: Date.now().toString(),
      name,
      platforms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const createdGame = await gamesDb.create(newGame);
    res.status(201).json(createdGame);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar jogo' });
  }
});

// Atualizar um jogo
router.put('/:id', async (req, res) => {
  try {
    const { name, platforms } = req.body;
    
    if (!name || !platforms || !Array.isArray(platforms)) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    // Validar cada plataforma
    for (const platform of platforms) {
      if (!platform.platform || !platform.mediaType) {
        return res.status(400).json({ 
          error: 'Cada plataforma deve ter platform e mediaType definidos' 
        });
      }

      // Verificar duplicata para cada plataforma, excluindo o jogo atual
      const games = await gamesDb.getAll();
      const currentGame = games.find(g => g.id === req.params.id);
      
      if (currentGame) {
        const isDuplicate = games.some(game => 
          game.id !== req.params.id && 
          game.name === name && 
          game.platforms.some(p => 
            p.platform === platform.platform && 
            p.mediaType === platform.mediaType
          )
        );

        if (isDuplicate) {
          return res.status(400).json({ 
            error: `Jogo "${name}" já existe para ${platform.platform} (${platform.mediaType})` 
          });
        }
      }
    }

    const updatedGame = {
      name,
      platforms,
      updatedAt: new Date().toISOString()
    };

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