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
   * Gera variações do nome para busca progressiva
   * @param {string} gameName - Nome original do jogo
   * @param {string|null} originalYear - Ano extraído do nome original
   * @returns {Array<string>} Array de variações para testar
   */
  generateSearchVariations(gameName, originalYear) {
    const variations = [];
    
    // 1. Remove apenas símbolos (mantém edições/anos)
    variations.push(gameName.replace(/[™®]/g, '').trim());
    
    // 2. Remove ano entre parênteses se houver
    if (originalYear) {
      const withoutYear = gameName.replace(/\s*\(\d{4}\)\s*/g, '').trim();
      variations.push(withoutYear);
      console.log(`📅 Detectado ano ${originalYear}, buscando sem ano: "${withoutYear}"`);
    }
    
    // 3. Remove edições conhecidas (mas mantém ano se houver)
    const editionPatterns = [
      /\s*-?\s*(definitive|complete|goty|game\s+of\s+the\s+year|deluxe|ultimate|special|collector's?|limited|enhanced|remastered|director's?\s+cut)\s+edition\s*/gi,
      /\s*-?\s*(definitive|complete|goty|deluxe|ultimate|special|enhanced|remastered)\s*/gi
    ];
    
    for (const pattern of editionPatterns) {
      const withoutEdition = gameName.replace(pattern, ' ').replace(/\s+/g, ' ').trim();
      if (withoutEdition !== gameName && withoutEdition.length > 3) {
        variations.push(withoutEdition);
        console.log(`📦 Removendo edição: "${withoutEdition}"`);
      }
    }
    
    // 4. Remove tanto ano quanto edição (busca mais genérica)
    let baseGame = gameName;
    if (originalYear) {
      baseGame = baseGame.replace(/\s*\(\d{4}\)\s*/g, '');
    }
    for (const pattern of editionPatterns) {
      baseGame = baseGame.replace(pattern, ' ');
    }
    baseGame = baseGame.replace(/\s+/g, ' ').trim();
    if (baseGame !== gameName && baseGame.length > 3) {
      variations.push(baseGame);
      console.log(`🎮 Busca base: "${baseGame}"`);
    }
    
    // 5. Outras limpezas
    variations.push(
      gameName.replace(/\s*:\s*/g, ' ').replace(/[™®]/g, '').trim(),
      gameName.replace(/\s+/g, ' ').trim()
    );

    // Remove duplicatas mantendo ordem
    return [...new Set(variations)];
  }

  /**
   * Busca com prioridade para jogos do ano especificado
   * @param {string} searchTerm - Termo de busca
   * @param {string|null} preferredYear - Ano preferido (se houver)
   * @returns {Promise<number|null>} Tempo em horas ou null
   */
  async searchBySearchAPIWithYearPriority(searchTerm, preferredYear = null) {
    try {
      const searchUrl = `${this.baseUrl}/?q=${encodeURIComponent(searchTerm)}`;
      
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

      console.log(`🔍 Buscando "${searchTerm}" na página de busca...`);
      const response = await axios.get(searchUrl, config);
      
      const gameLinks = this.extractGameLinksFromSearchHTML(response.data);
      
      if (gameLinks.length > 0) {
        console.log(`🔗 Encontrados ${gameLinks.length} links de jogos`);
        
        // Se temos um ano preferido, ordenar resultados por prioridade
        const candidateGames = [];
        
        // Testar até 5 resultados para encontrar matches
        const maxTests = Math.min(gameLinks.length, 5);
        
        for (let i = 0; i < maxTests; i++) {
          const gameUrl = `${this.baseUrl}${gameLinks[i]}`;
          console.log(`🔗 Tentando jogo ${i + 1}/${maxTests}: ${gameUrl}`);
          
          try {
            const gameResponse = await axios.get(gameUrl, config);
            const gameTitle = this.extractGameTitleFromHTML(gameResponse.data);
            
            if (gameTitle) {
              console.log(`📖 Título encontrado: "${gameTitle}"`);
              
              // Verificar se é um match válido
              if (this.isGameNameMatch(searchTerm, gameTitle)) {
                console.log(`✅ Match confirmado!`);
                
                // Extrair ano do título encontrado
                const foundYearMatch = gameTitle.match(/\((\d{4})\)/);
                const foundYear = foundYearMatch ? foundYearMatch[1] : null;
                
                const playTime = this.extractPlayTimeFromHTML(gameResponse.data, searchTerm);
                
                if (playTime !== null) {
                  candidateGames.push({
                    title: gameTitle,
                    year: foundYear,
                    playTime: playTime,
                    isPreferredYear: preferredYear && foundYear === preferredYear
                  });
                  
                  console.log(`⏱️ Tempo encontrado: ${playTime}h para "${gameTitle}" (${foundYear || 'ano não identificado'})`);
                  
                  // Se é o ano preferido, retornar imediatamente
                  if (preferredYear && foundYear === preferredYear) {
                    console.log(`🎯 Encontrado jogo do ano preferido ${preferredYear}!`);
                    return playTime;
                  }
                }
              } else {
                console.log(`❌ Não é o jogo procurado. Buscando: "${searchTerm}" vs Encontrado: "${gameTitle}"`);
              }
            }
          } catch (error) {
            console.log(`❌ Erro ao acessar ${gameUrl}:`, error.message);
          }
          
          // Delay entre tentativas
          if (i < maxTests - 1) {
            await this.sleep(1000);
          }
        }
        
        // Se não encontrou o ano preferido, retornar o primeiro match válido
        if (candidateGames.length > 0) {
          const bestMatch = candidateGames[0];
          console.log(`🎮 Usando melhor match: "${bestMatch.title}" (${bestMatch.playTime}h)`);
          return bestMatch.playTime;
        }
        
        console.log(`❌ Nenhum dos ${maxTests} resultados corresponde a "${searchTerm}"`);
      }

      return null;
    } catch (error) {
      console.log(`❌ Erro na busca com prioridade de ano para "${searchTerm}":`, error.message);
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
        // Tentar múltiplos resultados até encontrar um match válido
        for (let i = 0; i < Math.min(gameLinks.length, 5); i++) {
          const gameUrl = `${this.baseUrl}${gameLinks[i]}`;
          console.log(`🔗 Tentando jogo ${i + 1}/${gameLinks.length}: ${gameUrl}`);
          
          const gameResponse = await axios.get(gameUrl, config);
          const gameTitle = this.extractGameTitleFromHTML(gameResponse.data);
          
          if (gameTitle) {
            console.log(`📖 Título encontrado: "${gameTitle}"`);
            
            // Verificar se é realmente o jogo que procuramos
            if (this.isGameNameMatch(gameName, gameTitle)) {
              console.log(`✅ Match confirmado! Extraindo tempo...`);
              return this.extractPlayTimeFromHTML(gameResponse.data, gameName);
            } else {
              console.log(`❌ Não é o jogo procurado. Buscando: "${gameName}" vs Encontrado: "${gameTitle}"`);
            }
          }
          
          // Delay entre tentativas
          if (i < gameLinks.length - 1) {
            await this.sleep(1000); // 1 segundo entre tentativas
          }
        }
        
        console.log(`❌ Nenhum dos ${Math.min(gameLinks.length, 5)} resultados corresponde a "${gameName}"`);
      }

      return null;
    } catch (error) {
      console.log(`❌ Erro na busca via página para "${gameName}":`, error.message);
      return null;
    }
  }

  /**
   * Busca usando variações do nome (com lógica inteligente para anos e edições)
   */
  async searchWithVariations(gameName) {
    try {
      // Extrair ano do nome original (se houver)
      const yearMatch = gameName.match(/\((\d{4})\)/);
      const originalYear = yearMatch ? yearMatch[1] : null;
      
      // Gerar variações progressivamente mais genéricas
      const variations = this.generateSearchVariations(gameName, originalYear);

      for (const variation of variations) {
        if (variation !== gameName && variation.length > 3) {
          console.log(`🔄 Tentando variação: "${variation}"`);
          const result = await this.searchBySearchAPIWithYearPriority(variation, originalYear);
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
   * Extrai o título do jogo da página HTML
   */
  extractGameTitleFromHTML(html) {
    try {
      // Padrões para extrair o título do jogo
      const titlePatterns = [
        // Título na tag title
        /<title[^>]*>([^<]+)/i,
        
        // Título em h1
        /<h1[^>]*>([^<]+)<\/h1>/i,
        
        // Título em elementos específicos do HowLongToBeat
        /<div[^>]*class="[^"]*GameHeader_profile_header[^"]*"[^>]*>[\s\S]*?<h1[^>]*>([^<]+)<\/h1>/i,
        /<div[^>]*class="[^"]*profile_header[^"]*"[^>]*>[\s\S]*?<h1[^>]*>([^<]+)<\/h1>/i,
        
        // Fallback para outras estruturas
        /<h2[^>]*>([^<]+)<\/h2>/i
      ];

      for (const pattern of titlePatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          let title = match[1].trim();
          
          // Limpar título
          title = title.replace(/\s*\|\s*HowLongToBeat/i, '');
          title = title.replace(/^\s*HowLongToBeat\s*[\|\-]\s*/i, '');
          title = title.trim();
          
          if (title.length > 2) {
            return title;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Erro ao extrair título:', error);
      return null;
    }
  }

  /**
   * Verifica se o nome do jogo encontrado é um match válido
   */
  isGameNameMatch(searchedName, foundName) {
    try {
      if (!searchedName || !foundName) return false;

      // Normalizar ambos os nomes
      const normalizeGameName = (name) => {
        return name
          .toLowerCase()
          .replace(/^how long is\s+/i, '') // Remover "How long is" do início
          .replace(/\?\s*$/i, '') // Remover "?" do final
          .replace(/[™®©]/g, '') // Remover símbolos de marca
          .replace(/[^\w\s]/g, ' ') // Remover pontuação
          .replace(/\s+/g, ' ') // Normalizar espaços
          .replace(/\b(the|a|an)\b/g, '') // Remover artigos
          .replace(/\b(edition|remastered|definitive|enhanced|deluxe|goty|complete)\b/g, '') // Remover palavras especiais
          .trim();
      };

      const normalizedSearched = normalizeGameName(searchedName);
      const normalizedFound = normalizeGameName(foundName);

      // Match exato após normalização
      if (normalizedSearched === normalizedFound) {
        return true;
      }

      // Verificar se um contém o outro (pelo menos 70% de sobreposição)
      const searchWords = normalizedSearched.split(/\s+/).filter(w => w.length > 2);
      const foundWords = normalizedFound.split(/\s+/).filter(w => w.length > 2);

      if (searchWords.length === 0 || foundWords.length === 0) return false;

      // Contar palavras em comum
      const commonWords = searchWords.filter(word => 
        foundWords.some(fWord => 
          fWord.includes(word) || word.includes(fWord) || 
          this.calculateLevenshteinDistance(word, fWord) <= 2
        )
      );

      const similarity = commonWords.length / Math.max(searchWords.length, foundWords.length);
      
      // Aceitar se similaridade >= 65%
      return similarity >= 0.65;
      
    } catch (error) {
      console.error('Erro na verificação de match:', error);
      return false;
    }
  }

  /**
   * Calcula distância de Levenshtein para matching fuzzy
   */
  calculateLevenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
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