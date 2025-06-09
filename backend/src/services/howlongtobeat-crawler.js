import axios from 'axios';
import { gamesDb } from '../db/database.js';

/**
 * HowLongToBeat Crawler Service
 * 
 * Busca automaticamente tempos de jogo do HowLongToBeat para jogos que não possuem playTime
 */
export class HowLongToBeatCrawler {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.delay = 3000; // 3 segundos entre requisições para ser respeitoso
    this.baseUrl = 'https://howlongtobeat.com';
  }

  /**
   * Busca jogos no banco que não possuem tempo de jogo
   * @returns {Promise<Array>} Array de jogos sem playTime
   */
  async findGamesWithoutPlayTime() {
    try {
      const allGames = await gamesDb.getAll();
      return allGames.filter(game => 
        game.playTime === null || 
        game.playTime === undefined || 
        game.playTime === 0
      );
    } catch (error) {
      console.error('Erro ao buscar jogos sem tempo de jogo:', error);
      throw error;
    }
  }

  /**
   * Busca o tempo de jogo de um jogo específico no HowLongToBeat
   * @param {string} gameName - Nome do jogo para buscar
   * @returns {Promise<number|null>} Tempo em horas ou null se não encontrado
   */
  async searchGamePlayTime(gameName) {
    try {
      // Tentar diferentes estratégias de busca
      const strategies = [
        () => this.searchByDirectURL(gameName),
        () => this.searchBySearchAPI(gameName),
        () => this.searchWithVariations(gameName)
      ];

      for (const strategy of strategies) {
        const playTime = await strategy();
        if (playTime !== null) {
          return playTime;
        }
      }

      return null;
    } catch (error) {
      console.error(`❌ Erro ao buscar "${gameName}" no HowLongToBeat:`, error.message);
      return null;
    }
  }

  /**
   * Busca por URL direta (método principal)
   */
  async searchByDirectURL(gameName) {
    try {
      // Sanitizar nome para URL do HowLongToBeat
      const urlName = gameName
        .toLowerCase()
        .replace(/[™®]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const directUrl = `${this.baseUrl}/game/${urlName}`;
      
      const config = {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0',
          'DNT': '1'
        },
        timeout: 15000,
        maxRedirects: 5
      };

      console.log(`🔍 Buscando "${gameName}" no HowLongToBeat...`);
      console.log(`🌐 URL: ${directUrl}`);
      
      const response = await axios.get(directUrl, config);
      const html = response.data;
      
      console.log(`📊 Response Status: ${response.status}`);
      console.log(`📊 Response Size: ${html.length} chars`);
      
      return this.extractPlayTimeFromHTML(html, gameName);

    } catch (error) {
      console.log(`❌ Erro na requisição direta para "${gameName}":`, error.message);
      
      if (error.response?.status === 404) {
        console.log(`❌ Página não encontrada para "${gameName}"`);
      }
      
      return null;
    }
  }

  /**
   * Busca usando a página de busca HTML do HowLongToBeat
   */
  async searchBySearchAPI(gameName) {
    try {
      // Usar a página de busca HTML em vez da API que está sendo bloqueada
      const searchUrl = `${this.baseUrl}/?q=${encodeURIComponent(gameName)}`;
      
      const config = {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0',
          'DNT': '1'
        },
        timeout: 15000
      };

      console.log(`🔍 Buscando "${gameName}" na página de busca...`);
      const response = await axios.get(searchUrl, config);
      
      // Procurar links para jogos nos resultados
      const gameLinks = this.extractGameLinksFromSearchHTML(response.data);
      
      if (gameLinks.length > 0) {
        // Tentar o primeiro resultado (mais relevante)
        const firstGameUrl = `${this.baseUrl}${gameLinks[0]}`;
        console.log(`🔗 Tentando jogo: ${firstGameUrl}`);
        
        const gameResponse = await axios.get(firstGameUrl, config);
        return this.extractPlayTimeFromHTML(gameResponse.data, gameName);
      }

      return null;
    } catch (error) {
      console.log(`❌ Erro na busca via página para "${gameName}":`, error.message);
      return null;
    }
  }

  /**
   * Busca usando variações do nome
   */
  async searchWithVariations(gameName) {
    try {
      const variations = [
        gameName.replace(/[™®]/g, '').trim(),
        gameName.replace(/\s*:\s*/g, ' ').replace(/[™®]/g, '').trim(),
        gameName.replace(/remastered/i, '').trim(),
        gameName.replace(/edition/i, '').trim(),
        gameName.replace(/\s+/g, ' ').trim()
      ];

      for (const variation of variations) {
        if (variation !== gameName && variation.length > 3) {
          console.log(`🔄 Tentando variação: "${variation}"`);
          const result = await this.searchBySearchAPI(variation);
          if (result !== null) {
            return result;
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extrai links de jogos da página de busca HTML
   */
  extractGameLinksFromSearchHTML(html) {
    try {
      const links = [];
      
      // Procurar por links para páginas de jogos
      const linkPatterns = [
        /href="(\/game\/[^"]+)"/g,
        /href="(\/game\?id=\d+)"/g
      ];

      for (const pattern of linkPatterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
          const link = match[1];
          if (!links.includes(link)) {
            links.push(link);
          }
        }
      }

      console.log(`🔗 Encontrados ${links.length} links de jogos`);
      return links.slice(0, 5); // Máximo 5 resultados
    } catch (error) {
      console.error('Erro ao extrair links da busca:', error);
      return [];
    }
  }

  /**
   * Extrai tempo de jogo do HTML da página
   */
  extractPlayTimeFromHTML(html, gameName) {
    try {
      // Padrão específico para a estrutura atual do HowLongToBeat
      // <div class="GameCard_search_list_tidbit__0r_OP text_white shadow_text">Main Story</div>
      // <div class="GameCard_search_list_tidbit__0r_OP center time_100">26½ Hours</div>
      
      const patterns = [
        // Padrão para o novo layout com GameCard_search_list_tidbit
        /<div[^>]*GameCard_search_list_tidbit[^>]*>Main Story<\/div>[\s\S]*?<div[^>]*GameCard_search_list_tidbit[^>]*>([^<]+)<\/div>/i,
        
        // Padrão mais flexível para o mesmo layout
        /<div[^>]*>Main Story<\/div>[\s\S]*?<div[^>]*time_\d+[^>]*>([^<]+)<\/div>/i,
        
        // Padrões para layouts de resultado de busca
        /<div[^>]*search_list_tidbit[^>]*>Main Story<\/div>[\s\S]*?<div[^>]*search_list_tidbit[^>]*>([^<]+)<\/div>/i,
        
        // Padrões para páginas individuais de jogos
        /<h5[^>]*>Main Story<\/h5>[\s\S]*?<div[^>]*>([^<]+)<\/div>/i,
        /<li[^>]*>\s*<h5[^>]*>Main Story<\/h5>\s*<div[^>]*>([^<]+)<\/div>/i,
        
        // Padrões para tabelas
        /<td[^>]*>Main Story<\/td>[\s\S]*?<td[^>]*>([^<]+)<\/td>/i,
        /<tr[^>]*>[\s\S]*?Main Story[\s\S]*?<td[^>]*>([^<]+)<\/td>/i,
        
        // Padrões mais genéricos como fallback
        /Main Story[\s\S]*?(\d+(?:\.5|½)?\s*Hours?)/i,
        /Main[\s\S]*?(\d+(?:\.5|½)?\s*Hours?)/i
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const timeStr = match[1].trim();
          const hours = this.parseTimeStringToHours(timeStr);
          
          if (hours > 0) {
            console.log(`✅ Tempo encontrado para "${gameName}": ${hours} horas (${timeStr})`);
            return hours;
          }
        }
      }

      // Debug: Se não encontrou, mostrar um pouco do HTML para ajudar a debug
      console.log(`❌ Não foi possível extrair tempo da página HTML para "${gameName}"`);
      
      // Mostrar se existe "Main Story" no HTML
      if (html.includes('Main Story')) {
        console.log('🔍 HTML contém "Main Story", mas não conseguiu extrair o tempo');
        
        // Extrair contexto ao redor de "Main Story" para debug
        const mainStoryIndex = html.indexOf('Main Story');
        if (mainStoryIndex !== -1) {
          const context = html.substring(mainStoryIndex - 200, mainStoryIndex + 500);
          console.log('📄 Contexto ao redor de "Main Story":', context.replace(/\s+/g, ' '));
        }
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Erro ao extrair tempo do HTML para "${gameName}":`, error);
      return null;
    }
  }

  /**
   * Encontra o melhor match nos resultados da busca
   */
  findBestMatch(games, searchTerm) {
    if (!games || games.length === 0) return null;

    // Calcular similaridade simples
    const searchLower = searchTerm.toLowerCase();
    
    let bestMatch = null;
    let bestScore = 0;

    for (const game of games) {
      const gameName = (game.game_name || '').toLowerCase();
      
      // Match exato
      if (gameName === searchLower) {
        return game;
      }

      // Calcular score de similaridade simples
      let score = 0;
      if (gameName.includes(searchLower)) {
        score = 0.8;
      } else if (searchLower.includes(gameName)) {
        score = 0.7;
      } else {
        // Palavras em comum
        const searchWords = searchLower.split(/\s+/);
        const gameWords = gameName.split(/\s+/);
        const commonWords = searchWords.filter(word => 
          gameWords.some(gWord => gWord.includes(word) || word.includes(gWord))
        );
        score = commonWords.length / Math.max(searchWords.length, gameWords.length);
      }

      if (score > bestScore && score > 0.3) {
        bestScore = score;
        bestMatch = game;
      }
    }

    return bestMatch;
  }

  /**
   * Extrai tempo de jogo dos dados da API
   */
  parsePlayTimeFromGameData(gameData) {
    try {
      if (!gameData || typeof gameData !== 'object') {
        return null;
      }

      // Procurar campo de Main Story
      const mainStory = gameData.comp_main || gameData.comp_plus || gameData.comp_100;
      
      if (mainStory && mainStory > 0) {
        // Os dados da API geralmente vêm em segundos, converter para horas
        const hours = Math.round((mainStory / 3600) * 10) / 10; // Arredondar para 1 casa decimal
        return hours;
      }

      return null;
    } catch (error) {
      console.error('Erro ao processar dados da API:', error);
      return null;
    }
  }

  /**
   * Converte string de tempo para horas
   */
  parseTimeStringToHours(timeStr) {
    try {
      if (!timeStr || typeof timeStr !== 'string') {
        return 0;
      }

      // Preservar caracteres importantes antes de limpar
      const originalStr = timeStr;
      
      // Converter ½ para .5 antes de limpar
      timeStr = timeStr.replace(/½/g, '.5');
      
      // Limpar string mas preservar pontos, números e letras importantes
      timeStr = timeStr.replace(/[^\d\.\w\s½]/g, '').trim();
      
      // Se o string parece ser apenas um número muito grande (provavelmente um ID), retornar 0
      if (/^\d{5,}$/.test(timeStr)) {
        console.log(`⚠️ String "${timeStr}" parece ser um ID, não um tempo`);
        return 0;
      }
      
      // Padrões mais específicos para diferentes formatos
      const patterns = [
        // "25h 30m", "1h 30m", etc. (colocar primeiro para capturar minutos)
        /(\d+(?:\.\d+)?)\s*h(?:ours?)?\s*(\d+)?\s*m(?:in(?:utes?)?)?/i,
        
        // "26½ Hours", "26.5 Hours", "0.3 Hours" 
        /(\d+(?:\.\d+|½)?)\s*(?:hours?|hrs?)\s*$/i,
        
        // "25.5h", "25h", "0.3h"
        /(\d+(?:\.\d+)?)\s*h$/i,
        
        // Apenas números de 1-3 dígitos com decimal opcional
        /^(\d{1,3}(?:\.\d+)?)$/
      ];

      for (const pattern of patterns) {
        const match = timeStr.match(pattern);
        if (match) {
          const hours = parseFloat(match[1]);
          const minutes = match[2] ? parseInt(match[2]) : 0;
          

          
          // Validar se o tempo é razoável (entre 0.5 e 200 horas para história principal)
          const totalHours = hours + (minutes / 60);
          if (totalHours >= 0.5 && totalHours <= 200) {
            console.log(`⏳ Convertendo "${originalStr}" → ${totalHours} horas`);
            return totalHours;
          } else if (totalHours > 200) {
            console.log(`⚠️ Tempo muito alto (${totalHours}h), provavelmente não é história principal: "${originalStr}"`);
          } else if (totalHours < 0.5) {
            console.log(`⚠️ Tempo muito baixo (${totalHours}h): "${originalStr}"`);
          }
        }
      }

      console.log(`❌ Não foi possível converter tempo: "${originalStr}"`);
      return 0;
    } catch (error) {
      console.error('Erro ao converter tempo:', error);
      return 0;
    }
  }

  /**
   * Atualiza o tempo de jogo de um jogo no banco
   */
  async updateGamePlayTime(gameId, playTime) {
    try {
      const game = await gamesDb.getById(gameId);
      if (!game) {
        throw new Error(`Jogo com ID ${gameId} não encontrado`);
      }

      game.playTime = playTime;
      await gamesDb.update(gameId, game);
      
      console.log(`✅ Jogo "${game.name}" atualizado com tempo: ${playTime}h`);
      return game;
    } catch (error) {
      console.error(`❌ Erro ao atualizar jogo ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Pausa execução por um tempo determinado
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Executa o crawler completo
   */
  async crawlAndUpdatePlayTimes(options = {}) {
    const { maxGames = 10, dryRun = false } = options;
    
    const result = {
      processed: 0,
      updated: 0,
      failed: 0,
      errors: []
    };

    try {
      console.log('🚀 Iniciando HowLongToBeat Crawler...\n');
      
      const gamesWithoutPlayTime = await this.findGamesWithoutPlayTime();
      
      if (gamesWithoutPlayTime.length === 0) {
        console.log('✅ Todos os jogos já possuem tempo de jogo!');
        return result;
      }

      const gamesToProcess = gamesWithoutPlayTime.slice(0, maxGames);
      console.log(`📋 Processando ${gamesToProcess.length} jogos...\n`);

      for (const game of gamesToProcess) {
        try {
          console.log(`\n${'='.repeat(60)}`);
          console.log(`🎮 Processando: ${game.name}`);
          console.log(`🆔 ID: ${game.id}`);

          const playTime = await this.searchGamePlayTime(game.name);
          result.processed++;

          if (playTime !== null) {
            if (!dryRun) {
              await this.updateGamePlayTime(game.id, playTime);
            } else {
              console.log(`🔍 DRY RUN: ${game.name} teria tempo atualizado para ${playTime}h`);
            }
            result.updated++;
          } else {
            console.log(`❌ Tempo não encontrado para "${game.name}"`);
            result.failed++;
            result.errors.push(`Tempo não encontrado: ${game.name}`);
          }

          // Delay entre requisições
          if (result.processed < gamesToProcess.length) {
            console.log(`⏳ Aguardando ${this.delay/1000}s antes do próximo jogo...`);
            await this.sleep(this.delay);
          }

        } catch (error) {
          console.error(`❌ Erro ao processar "${game.name}":`, error.message);
          result.failed++;
          result.errors.push(`Erro em ${game.name}: ${error.message}`);
        }
      }

      return result;
      
    } catch (error) {
      console.error('❌ Erro fatal no crawler:', error);
      throw error;
    }
  }
} 