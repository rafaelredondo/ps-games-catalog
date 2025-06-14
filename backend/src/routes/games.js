import express from 'express';
import { gamesDb } from '../db/database.js';
import Game from '../models/Game.js';
import { HowLongToBeatCrawler } from '../services/howlongtobeat-crawler.js';

const router = express.Router();

// Função auxiliar para ordenação de jogos
function sortGames(games, orderBy, order) {
  const sortedGames = [...games].sort((a, b) => {
    let valueA, valueB;
    
    switch (orderBy) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
        
      case 'metacritic':
        // Jogos sem score ficam no final (valor 0)
        valueA = a.metacritic || 0;
        valueB = b.metacritic || 0;
        break;
        
      case 'year':
        // Jogos sem data ficam no final (valor 0)
        valueA = a.released ? new Date(a.released).getFullYear() : 0;
        valueB = b.released ? new Date(b.released).getFullYear() : 0;
        break;
        
      case 'platforms':
        // Ordenação alfabética das plataformas concatenadas
        valueA = a.platforms ? a.platforms.join(', ').toLowerCase() : '';
        valueB = b.platforms ? b.platforms.join(', ').toLowerCase() : '';
        break;
        
      case 'genres':
        // Ordenação alfabética dos gêneros concatenados
        valueA = a.genres ? a.genres.join(', ').toLowerCase() : '';
        valueB = b.genres ? b.genres.join(', ').toLowerCase() : '';
        break;
        
      case 'playTime':
        // Jogos sem tempo de jogo ficam no final (valor 0)
        valueA = a.playTime || 0;
        valueB = b.playTime || 0;
        break;
        
      default:
        // Ordenação padrão por nome para campos inválidos
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
    }
    
    // Comparação baseada no tipo de valor
    let comparison = 0;
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      comparison = valueA.localeCompare(valueB);
    } else {
      comparison = valueA - valueB;
    }
    
    // Aplicar ordem (asc/desc)
    return order === 'desc' ? -comparison : comparison;
  });
  
  return sortedGames;
}

// Função auxiliar para verificar duplicatas
async function checkDuplicate(gameName, platforms, mediaTypes) {
  const games = await gamesDb.getAll();
  return games.some(game => 
    game.name.toLowerCase() === gameName.toLowerCase()
  );
}

/**
 * Busca tempo de jogo de forma assíncrona após criação do jogo
 * REUTILIZA crawler existente sem duplicação de código
 * @param {string} gameId - ID do jogo
 * @param {string} gameName - Nome do jogo
 */
async function searchGamePlayTimeAsync(gameId, gameName) {
  try {
    console.log(`🚀 Iniciando busca assíncrona para: "${gameName}" (ID: ${gameId})`);
    
    // REUTILIZAR classe existente sem modificações
    const crawler = new HowLongToBeatCrawler();
    
    // REUTILIZAR método novo que usa 98% do código existente
    const playTime = await crawler.searchSingleGamePlayTime(gameName, {
      useOwnBrowser: true,    // Browser próprio (não interfere com crawling batch)
      quickSearch: true       // Mais rápido (3 variações vs 5+)
    });
    
    if (playTime !== null) {
      console.log(`✅ Tempo encontrado para "${gameName}": ${playTime}h`);
      await gamesDb.update(gameId, { playTime });
      console.log(`💾 Jogo "${gameName}" atualizado com tempo: ${playTime}h`);
    } else {
      console.log(`❌ Tempo não encontrado para "${gameName}"`);
    }
  } catch (error) {
    console.error(`❌ Erro na busca assíncrona para "${gameName}":`, error.message);
  }
}

// Buscar opções para dropdowns/combos (otimizado)
router.get('/dropdown-options', async (req, res) => {
  try {
    const games = await gamesDb.getAll();
    
    // Extrair opções únicas de forma otimizada
    const platformsSet = new Set();
    const genresSet = new Set();
    const publishersSet = new Set();
    
    games.forEach(game => {
      // Platforms
      if (game.platforms && Array.isArray(game.platforms)) {
        game.platforms.forEach(platform => platformsSet.add(platform));
      }
      
      // Genres  
      if (game.genres && Array.isArray(game.genres)) {
        game.genres.forEach(genre => genresSet.add(genre));
      }
      
      // Publishers
      if (game.publishers && Array.isArray(game.publishers)) {
        game.publishers.forEach(publisher => publishersSet.add(publisher));
      }
    });
    
    // Converter para arrays ordenados
    const platforms = Array.from(platformsSet).sort();
    const genres = Array.from(genresSet).sort();
    const publishers = Array.from(publishersSet).sort();
    
    // Status fixos (não dependem dos jogos)
    const statuses = ['Concluído', 'Não iniciado', 'Jogando', 'Abandonado', 'Na fila'];
    
    res.json({
      platforms,
      genres, 
      publishers,
      statuses,
      meta: {
        totalGames: games.length,
        platformCount: platforms.length,
        genreCount: genres.length,
        publisherCount: publishers.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar opções de dropdown:', error);
    res.status(500).json({ error: 'Erro ao buscar opções de dropdown' });
  }
});

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
    
    // Parâmetros de ordenação
    const orderBy = req.query.orderBy || 'name';
    const order = req.query.order || 'asc';
    
    // Parâmetros de filtros avançados
    const minMetacritic = req.query.minMetacritic ? parseInt(req.query.minMetacritic) : null;
    const genre = req.query.genre || '';
    const publisher = req.query.publisher || '';
    const status = req.query.status || '';
    
    // Buscar todos os jogos
    let allGames = await gamesDb.getAll();
    
    // Aplicar filtros básicos
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
    
    // Aplicar filtros avançados
    if (minMetacritic !== null) {
      allGames = allGames.filter(game => 
        game.metacritic && game.metacritic >= minMetacritic
      );
    }
    
    if (genre) {
      allGames = allGames.filter(game => 
        game.genres && Array.isArray(game.genres) && game.genres.includes(genre)
      );
    }
    
    if (publisher) {
      allGames = allGames.filter(game => 
        game.publishers && Array.isArray(game.publishers) && 
        game.publishers.some(pub => pub.includes(publisher))
      );
    }
    
    if (status) {
      // Filtrar por status específico usando o campo status (string)
      allGames = allGames.filter(game => 
        game.status === status
      );
    }
    
    // Aplicar ordenação
    allGames = sortGames(allGames, orderBy, order);
    
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
    
    // Se não tem playTime, buscar automaticamente de forma assíncrona
    if (!playTime) {
      console.log(`🔍 Buscando tempo automaticamente para: "${name}"`);
      searchGamePlayTimeAsync(createdGame.id, name).catch(error => {
        console.error(`❌ Erro na busca automática para "${name}":`, error.message);
      });
      
      res.status(201).json({
        ...createdGame,
        message: 'Jogo criado com sucesso! Buscando tempo de jogo automaticamente...'
      });
    } else {
      res.status(201).json(createdGame);
    }
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

// Buscar tempo de jogo manualmente para um jogo específico
router.post('/:id/search-playtime', async (req, res) => {
  try {
    const game = await gamesDb.getById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }
    
    console.log(`🔍 Busca manual solicitada para: "${game.name}"`);
    
    // Buscar de forma assíncrona (não bloqueia a resposta)
    searchGamePlayTimeAsync(game.id, game.name).catch(error => {
      console.error(`❌ Erro na busca manual para "${game.name}":`, error.message);
    });
    
    res.json({ 
      message: 'Busca de tempo de jogo iniciada',
      status: 'searching',
      gameName: game.name
    });
  } catch (error) {
    console.error('Erro ao iniciar busca de tempo de jogo:', error);
    res.status(500).json({ error: 'Erro ao iniciar busca de tempo de jogo' });
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