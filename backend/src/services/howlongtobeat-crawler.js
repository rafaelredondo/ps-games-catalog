import puppeteer from 'puppeteer';
import { gamesDb } from '../db/database.js';

/**
 * HowLongToBeat Crawler Service com Puppeteer
 * 
 * Busca automaticamente tempos de jogo do HowLongToBeat usando automação de browser
 */
export class HowLongToBeatCrawler {
  constructor() {
    this.delay = 3000; // 3 segundos entre buscas para ser respeitoso
    this.baseUrl = 'https://howlongtobeat.com';
    this.browser = null;
    this.page = null;
  }

  /**
   * Inicializa o browser Puppeteer
   */
  async initBrowser() {
    if (!this.browser) {
      console.log('🚀 Iniciando browser...');
      this.browser = await puppeteer.launch({
        headless: true, // Usar headless para produção
        defaultViewport: { width: 1280, height: 720 },
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      this.page = await this.browser.newPage();
      
      // Configurar User-Agent
      await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      console.log('✅ Browser iniciado com sucesso');
    }
  }

  /**
   * Fecha o browser Puppeteer
   */
  async closeBrowser() {
    if (this.browser) {
      console.log('🔒 Fechando browser...');
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * Busca jogos sem tempo de jogo e que não estão em cooldown
   * @returns {Promise<Array>} Lista de jogos para processar
   */
  async findGamesWithoutPlayTime() {
    try {
      const allGames = await gamesDb.getAll();
      const gamesWithoutPlayTime = allGames.filter(game => 
        game.playTime === null || 
        game.playTime === undefined || 
        game.playTime === 0
      );
      
      // Filtrar jogos que não estão em cooldown
      const availableGames = gamesWithoutPlayTime.filter(game => !this.isGameInCooldown(game));
      
      console.log(`📊 Estatísticas:`);
      console.log(`   • Jogos sem tempo: ${gamesWithoutPlayTime.length}`);
      console.log(`   • Em cooldown: ${gamesWithoutPlayTime.length - availableGames.length}`);
      console.log(`   • Disponíveis para processar: ${availableGames.length}`);
      
      return availableGames;
    } catch (error) {
      console.error('Erro ao buscar jogos sem tempo de jogo:', error);
      throw error;
    }
  }
  
  /**
   * Verifica se um jogo está em cooldown (teve 1 tentativa falhada recente)
   * @param {Object} game - Objeto do jogo
   * @returns {boolean} True se está em cooldown
   */
  isGameInCooldown(game) {
    // Se não tem contadores, não está em cooldown
    if (!game.playTimeAttemptCount || !game.playTimeLastAttempt) {
      return false;
    }
    
    // Se já tentou 1 vez (máximo permitido), está em cooldown
    if (game.playTimeAttemptCount >= 1) {
      const lastAttempt = new Date(game.playTimeLastAttempt);
      const now = new Date();
      const daysSinceLastAttempt = (now - lastAttempt) / (1000 * 60 * 60 * 24);
      
      // Cooldown de 7 dias após 1 tentativa falhada
      if (daysSinceLastAttempt < 7) {
        console.log(`⏸️ Jogo "${game.name}" em cooldown (${Math.ceil(7 - daysSinceLastAttempt)} dias restantes)`);
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Atualiza contador de tentativas no banco
   * @param {number} gameId - ID do jogo
   * @param {boolean} success - Se a busca foi bem-sucedida
   */
  async updateAttemptCounter(gameId, success) {
    try {
      const game = await gamesDb.getById(gameId);
      if (!game) return false;
      
      const now = new Date().toISOString();
      
      if (success) {
        // Se encontrou, limpar contadores de falha
        await gamesDb.update(gameId, {
          playTimeLastAttempt: now,
          playTimeAttemptCount: 0
        });
        console.log(`✅ Contadores de tentativa limpos para "${game.name}"`);
      } else {
        // Se falhou, incrementar contador
        const newAttemptCount = (game.playTimeAttemptCount || 0) + 1;
        await gamesDb.update(gameId, {
          playTimeLastAttempt: now,
          playTimeAttemptCount: newAttemptCount
        });
        console.log(`❌ Tentativa ${newAttemptCount} registrada para "${game.name}" (entrará em cooldown de 7 dias)`);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar contador de tentativas:', error);
      return false;
    }
  }

  /**
   * Busca o tempo de jogo de um jogo específico no HowLongToBeat
   * @param {string} gameName - Nome do jogo para buscar
   * @returns {Promise<number|null>} Tempo em horas ou null se não encontrado
   */
  async searchGamePlayTime(gameName) {
    try {
      await this.initBrowser();
      
      // Estratégia: gerar variações do nome e tentar cada uma
      const originalYear = this.extractYearFromGameName(gameName);
      const searchVariations = this.generateSearchVariations(gameName, originalYear);
      
      console.log(`🔍 Buscando "${gameName}" - ${searchVariations.length} variações para testar`);
      
      for (const searchTerm of searchVariations) {
        console.log(`\n🎯 Testando variação: "${searchTerm}"`);
        
        const playTime = await this.searchWithPuppeteer(searchTerm, originalYear);
        if (playTime !== null) {
          console.log(`✅ Encontrado! Tempo: ${playTime}h para "${searchTerm}"`);
          return playTime;
        }
      }

      console.log(`❌ Nenhuma variação de "${gameName}" encontrada`);
      return null;
    } catch (error) {
      console.error(`❌ Erro ao buscar "${gameName}" no HowLongToBeat:`, error.message);
      return null;
    }
  }

  /**
   * Busca usando Puppeteer - simula digitação real
   * @param {string} searchTerm - Termo de busca
   * @param {string|null} preferredYear - Ano preferido para priorizar
   * @returns {Promise<number|null>} Tempo em horas ou null
   */
  async searchWithPuppeteer(searchTerm, preferredYear = null) {
    try {
      console.log(`🌐 Navegando para ${this.baseUrl}...`);
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Fechar pop-up de privacidade se aparecer
      await this.closePivacyPopup();
      
      // Encontrar caixa de busca
      const searchSelector = 'input[placeholder*="Search"], input[name*="search"], input[type="search"], .search_box input';
      await this.page.waitForSelector(searchSelector, { timeout: 10000 });
      
      console.log(`⌨️ Digitando "${searchTerm}" na caixa de busca...`);
      
      // Limpar e digitar na caixa de busca
      await this.page.click(searchSelector);
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('KeyA');
      await this.page.keyboard.up('Control');
      await this.page.type(searchSelector, searchTerm);
      
      // PRESSIONAR ENTER para submeter a busca
      console.log('🔍 Pressionando Enter para submeter a busca...');
      await this.page.keyboard.press('Enter');
      
      // Aguardar navegação para página de resultados
      await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
      console.log('✅ Navegação para página de resultados concluída');
      
      // Aguardar resultados aparecerem
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Garantir que estamos na aba "Games"
      await this.ensureGamesTab();
      
      // Aguardar mais um pouco para carregar os resultados da aba Games
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      
      // Extrair jogos diretamente da página de resultados (não precisamos navegar)
      const gamesData = await this.extractGamesFromSearchResults();
      
      if (gamesData.length === 0) {
        console.log(`❌ Nenhum resultado encontrado para "${searchTerm}"`);
        return null;
      }
      
      console.log(`🔗 Encontrados ${gamesData.length} resultados, testando até 5...`);
      
      // Testar até 5 resultados
      const maxTests = Math.min(gamesData.length, 5);
      const candidateGames = [];
      
      for (let i = 0; i < maxTests; i++) {
        const gameData = gamesData[i];
        console.log(`🎮 Testando jogo ${i + 1}/${maxTests}: "${gameData.title}"`);
        
        try {
          console.log(`📖 Título encontrado: "${gameData.title}"`);
          
          // Verificar se é um match válido
          if (this.isGameNameMatch(searchTerm, gameData.title)) {
            console.log(`✅ Match confirmado!`);
            
            // Extrair ano do título encontrado
            const foundYearMatch = gameData.title.match(/\((\d{4})\)/);
            const foundYear = foundYearMatch ? foundYearMatch[1] : null;
            
            if (gameData.mainStoryTime !== null) {
              candidateGames.push({
                title: gameData.title,
                year: foundYear,
                playTime: gameData.mainStoryTime,
                isPreferredYear: preferredYear && foundYear === preferredYear,
                timeType: gameData.timeType
              });
              
              console.log(`⏱️ Tempo encontrado: ${gameData.mainStoryTime}h (${gameData.timeType || 'Main Story'}) para "${gameData.title}" (${foundYear || 'ano não identificado'})`);
              
              // Se é o ano preferido, retornar imediatamente
              if (preferredYear && foundYear === preferredYear) {
                console.log(`🎯 Encontrado jogo do ano preferido ${preferredYear}!`);
                return gameData.mainStoryTime;
              }
            }
          } else {
            console.log(`❌ Não é o jogo procurado. Buscando: "${searchTerm}" vs Encontrado: "${gameData.title}"`);
          }
        } catch (error) {
          console.log(`❌ Erro ao processar jogo:`, error.message);
        }
      }
      
      // Se encontrou candidatos mas nenhum do ano preferido, retornar o primeiro
      if (candidateGames.length > 0) {
        const bestCandidate = candidateGames[0];
        console.log(`🏆 Melhor candidato: "${bestCandidate.title}" - ${bestCandidate.playTime}h`);
        return bestCandidate.playTime;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Erro na busca com Puppeteer:`, error.message);
      return null;
    }
  }

  /**
   * Garante que estamos na aba "Games"
   */
  async ensureGamesTab() {
    try {
      // Procurar pelo botão da aba Games
      const gamesTabSelector = 'button.SearchOptions_search_tab__iDtf_';
      const gamesTabElements = await this.page.$$(gamesTabSelector);
      
      for (const element of gamesTabElements) {
        const text = await element.evaluate(el => el.textContent.trim());
        if (text === 'Games') {
          console.log('🎯 Clicando na aba "Games"...');
          await element.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
          return;
        }
      }
      
      console.log('ℹ️ Aba "Games" não encontrada ou já ativa');
    } catch (error) {
      console.log('❌ Erro ao tentar clicar na aba Games:', error.message);
    }
  }

  /**
   * Converte texto de tempo para número de horas
   * @param {string} timeText - Texto com tempo (ex: "8½ Hours", "12 Hours") 
   * @returns {number|null} Número de horas ou null se inválido
   */
  parseTimeText(timeText) {
    if (!timeText || timeText === '--') return null;
    
    const timeMatch = timeText.match(/(\d+(?:\.\d+)?(?:½)?)\s*Hours?/i);
    if (timeMatch) {
      let hours = parseFloat(timeMatch[1]);
      if (timeText.includes('½')) {
        hours += 0.5;
      }
      return hours;
    }
    return null;
  }

  /**
   * Extrai jogos diretamente da página de resultados
   * @returns {Promise<Array>} Array de objetos com dados dos jogos
   */
  async extractGamesFromSearchResults() {
    try {
      const gamesData = await this.page.evaluate(() => {
        const games = [];
        
        // Procurar especificamente dentro do container de resultados
        const searchResultsContainer = document.querySelector('#search-results-header');
        if (!searchResultsContainer) {
          console.log('❌ Container #search-results-header não encontrado');
          return [];
        }
        
        console.log('✅ Container #search-results-header encontrado');
        
        // Verificar se existe o título "We Found X games"
        const titleElement = searchResultsContainer.querySelector('.SearchOptions_search_title__83U9o');
        if (titleElement) {
          console.log(`📊 Título encontrado: "${titleElement.textContent}"`);
        }
        
        // Procurar por elementos de jogos APENAS dentro do container correto
        const gameElements = searchResultsContainer.querySelectorAll('li.GameCard_search_list__IuMbi');
        console.log(`🔍 Encontrados ${gameElements.length} elementos de jogos no container correto`);
        
        gameElements.forEach(gameElement => {
          try {
            // Extrair título e link
            const titleElement = gameElement.querySelector('h2 a');
            if (!titleElement) return;
            
            const title = titleElement.textContent.trim();
            const href = titleElement.getAttribute('href');
            
            // Extrair ano se presente
            const yearElement = gameElement.querySelector('h2');
            const fullTitle = yearElement ? yearElement.textContent.trim() : title;
            
            // Extrair tempo de jogo com fallback: Main Story → Solo
            let playTime = null;
            let timeType = null;
            const tidbits = gameElement.querySelectorAll('[class*="tidbit"]');
            
            // DEBUG: Capturar todos os tidbits para análise
            const allTidbits = [];
            for (let i = 0; i < tidbits.length; i++) {
              const tidbit = tidbits[i];
              allTidbits.push(tidbit ? tidbit.textContent.trim() : 'null');
            }
            
            // DEBUG: Investigar estrutura HTML do elemento do jogo
            const gameElementHTML = gameElement.innerHTML;
            const allTextContent = gameElement.textContent;
            
            // DEBUG: Tentar outros seletores de tidbits
            const alternativeSelectors = [
              '.GameCard_search_list_tidbit__0r_OP',
              '.search_list_tidbit',
              '.tidbit',
              '[class*="tidbit"]',
              '[class*="time"]',
              '[class*="Time"]',
              '.time_100', // Possível seletor antigo
              'li' // Elementos li dentro do card
            ];
            
            let foundAlternativeElements = [];
            for (const selector of alternativeSelectors) {
              const elements = gameElement.querySelectorAll(selector);
              if (elements.length > 0) {
                foundAlternativeElements.push({
                  selector: selector,
                  count: elements.length,
                  texts: Array.from(elements).map(el => el.textContent.trim()).slice(0, 5) // Limitar a 5
                });
              }
            }
            
            // Primeiro, tentar encontrar "Main Story"
            for (let i = 0; i < tidbits.length - 1; i++) {
              const labelElement = tidbits[i];
              const valueElement = tidbits[i + 1];
              
              if (labelElement && labelElement.textContent.includes('Main Story')) {
                const timeText = valueElement ? valueElement.textContent.trim() : '';
                if (timeText && timeText !== '--') {
                  // Usar a função parseTimeText que não existe no contexto do browser
                  const timeMatch = timeText.match(/(\d+(?:\.\d+)?(?:½)?)\s*Hours?/i);
                  if (timeMatch) {
                    let hours = parseFloat(timeMatch[1]);
                    if (timeText.includes('½')) {
                      hours += 0.5;
                    }
                    playTime = hours;
                    timeType = 'Main Story';
                    console.log(`✅ Encontrado Main Story: ${playTime}h`);
                  }
                }
                break;
              }
            }
            
            // Se não encontrou Main Story, tentar "Solo" como fallback
            if (playTime === null) {
              for (let i = 0; i < tidbits.length - 1; i++) {
                const labelElement = tidbits[i];
                const valueElement = tidbits[i + 1];
                
                if (labelElement && labelElement.textContent.includes('Solo')) {
                  const timeText = valueElement ? valueElement.textContent.trim() : '';
                  if (timeText && timeText !== '--') {
                    const timeMatch = timeText.match(/(\d+(?:\.\d+)?(?:½)?)\s*Hours?/i);
                    if (timeMatch) {
                      let hours = parseFloat(timeMatch[1]);
                      if (timeText.includes('½')) {
                        hours += 0.5;
                      }
                      playTime = hours;
                      timeType = 'Solo';
                      console.log(`🎯 Fallback para Solo: ${playTime}h`);
                    }
                  }
                  break;
                }
              }
            }
            
            if (title) {
              games.push({
                title: fullTitle,
                href: href,
                mainStoryTime: playTime,
                timeType: timeType
              });
            }
          } catch (error) {
            console.log('Erro ao processar elemento do jogo:', error);
          }
        });
        
        return games;
      });
      
      console.log(`📊 Extraídos ${gamesData.length} jogos da página de resultados`);
      
      // DEBUG: mostrar tidbits de todos os jogos encontrados
      if (gamesData.length > 0) {
        console.log('🔍 DEBUG - Tidbits capturados por jogo:');
        gamesData.forEach((game, i) => {
          console.log(`  ${i + 1}. "${game.title}"`);
          console.log(`     Tidbits: [${game.debugTidbits ? game.debugTidbits.join(', ') : 'null'}]`);
          console.log(`     Tempo: ${game.mainStoryTime || 'null'}h (${game.timeType || 'nenhum'})`);
          
          // DEBUG: Mostrar seletores alternativos encontrados
          if (game.debugAlternativeElements && game.debugAlternativeElements.length > 0) {
            console.log(`     🔧 Seletores alternativos encontrados:`);
            game.debugAlternativeElements.forEach(alt => {
              console.log(`        ${alt.selector}: ${alt.count} elementos - [${alt.texts.join(', ')}]`);
            });
          }
          
          // DEBUG: Mostrar todo o texto do elemento (resumido)
          if (game.debugTextContent) {
            const shortText = game.debugTextContent.replace(/\s+/g, ' ').trim().substring(0, 200);
            console.log(`     📝 Texto: "${shortText}${shortText.length >= 200 ? '...' : ''}"`);
          }
        });
      }
      
      // Debug: mostrar os primeiros jogos encontrados
      if (gamesData.length > 0) {
        console.log('🎮 Primeiros jogos encontrados:');
        gamesData.slice(0, 3).forEach((game, i) => {
          const timeInfo = game.mainStoryTime 
            ? `${game.mainStoryTime}h (${game.timeType || 'Main Story'})` 
            : 'sem tempo';
          console.log(`  ${i + 1}. "${game.title}" - ${timeInfo}`);
        });
      }
      
      return gamesData;
    } catch (error) {
      console.error('Erro ao extrair jogos da página de resultados:', error.message);
      return [];
    }
  }

  /**
   * Fecha pop-up de privacidade se aparecer
   */
  async closePivacyPopup() {
    try {
      // Aguardar um pouco para o pop-up aparecer
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Seletores possíveis para o botão de fechar
      const closeSelectors = [
        '[data-testid="close-tour"]',
        '.tour-close',
        '.close-tour',
        '.privacy-close',
        '.modal-close',
        'button[aria-label*="close"]',
        'button[aria-label*="Close"]',
        '.close-btn',
        '[class*="close"]'
      ];
      
      for (const selector of closeSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            console.log(`🔒 Fechando pop-up com seletor: ${selector}`);
            await element.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            return;
          }
        } catch (error) {
          // Continuar tentando outros seletores
        }
      }
      
      console.log('ℹ️ Nenhum pop-up de privacidade encontrado');
    } catch (error) {
      console.log('❌ Erro ao tentar fechar pop-up:', error.message);
    }
  }

  /**
   * Extrai links de jogos da página de resultados
   * @returns {Promise<Array<string>>} Array de URLs de jogos
   */
  async extractGameLinksFromPage() {
    try {
      const gameLinks = await this.page.evaluate(() => {
        const links = [];
        
        // Procurar por links que levam a páginas de jogos
        const linkElements = document.querySelectorAll('a[href*="/game/"]');
        
        linkElements.forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.includes('/game/') && !links.includes(href)) {
            links.push(href.startsWith('http') ? href : `https://howlongtobeat.com${href}`);
          }
        });
        
        return links;
      });
      
      return gameLinks;
    } catch (error) {
      console.error('Erro ao extrair links de jogos:', error.message);
      return [];
    }
  }

  /**
   * Extrai o título do jogo da página atual
   * @returns {Promise<string|null>} Título do jogo ou null
   */
  async extractGameTitleFromPage() {
    try {
      const title = await this.page.evaluate(() => {
        // Procurar por seletores comuns de título
        const selectors = [
          'h1',
          '.game_title',
          '.GameHeader_profile_header__c_h_L h1',
          '[class*="title"]',
          '[class*="Title"]'
        ];
        
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent) {
            return element.textContent.trim();
          }
        }
        
        // Fallback: título da página
        return document.title.replace(/- HowLongToBeat/g, '').trim();
      });
      
      return title || null;
    } catch (error) {
      console.error('Erro ao extrair título do jogo:', error.message);
      return null;
    }
  }

  /**
   * Extrai tempo de jogo da página atual
   * @param {string} gameName - Nome do jogo para logs
   * @returns {Promise<number|null>} Tempo em horas ou null
   */
  async extractPlayTimeFromPage(gameName) {
    try {
      const playTime = await this.page.evaluate(() => {
        // Procurar por elementos que contenham tempo de jogo
        const timeElements = document.querySelectorAll('*');
        
        for (const element of timeElements) {
          const text = element.textContent;
          if (!text) continue;
          
          // Procurar por padrões de tempo
          const timePatterns = [
            /(\d+(?:\.\d+)?)\s*(?:½|hours?|hrs?|h)\b/i,
            /(\d+)\s*(?:½|hours?|hrs?|h)\s*(\d+)\s*(?:minutes?|mins?|m)\b/i,
            /(\d+(?:\.\d+)?)\s*(?:½)?\s*Hours?/i
          ];
          
          for (const pattern of timePatterns) {
            const match = text.match(pattern);
            if (match) {
              let hours = parseFloat(match[1]);
              
              // Se tem ½, adicionar 0.5
              if (text.includes('½')) {
                hours += 0.5;
              }
              
              // Se tem minutos, converter e adicionar
              if (match[2]) {
                hours += parseFloat(match[2]) / 60;
              }
              
              if (hours > 0 && hours < 1000) { // Sanity check
                return hours;
              }
            }
          }
        }
        
        return null;
      });
      
      return playTime;
    } catch (error) {
      console.error('Erro ao extrair tempo de jogo:', error.message);
      return null;
    }
  }

  /**
   * Extrai ano do nome do jogo
   * @param {string} gameName - Nome do jogo
   * @returns {string|null} Ano extraído ou null
   */
  extractYearFromGameName(gameName) {
    const yearMatch = gameName.match(/\((\d{4})\)/);
    return yearMatch ? yearMatch[1] : null;
  }

  /**
   * Gera variações do nome para busca progressiva
   * @param {string} gameName - Nome original do jogo
   * @param {string|null} originalYear - Ano extraído do nome original
   * @returns {Array<string>} Array de variações para testar
   */
  generateSearchVariations(gameName, originalYear) {
    const variations = [];
    
    // 1. Nome limpo sem símbolos (prioridade máxima)
    const cleanName = gameName.replace(/[™®]/g, '').trim();
    variations.push(cleanName);
    
    // 2. Nome original apenas se for diferente do limpo
    if (cleanName !== gameName) {
      variations.push(gameName);
    }
    
    // 3. Remove ano entre parênteses se houver
    if (originalYear) {
      const withoutYear = cleanName.replace(/\s*\(\d{4}\)\s*/g, '').trim();
      if (withoutYear !== cleanName && withoutYear.length > 3) {
        variations.push(withoutYear);
        console.log(`📅 Detectado ano ${originalYear}, buscando sem ano: "${withoutYear}"`);
      }
    }
    
    // 4. Remove edições conhecidas
    const editionPatterns = [
      /\s*-?\s*(definitive|complete|goty|game\s+of\s+the\s+year|deluxe|ultimate|special|collector's?|limited|enhanced|remastered|director's?\s+cut|anniversary|\d+th\s+anniversary)\s+edition\s*/gi,
      /\s*-?\s*(definitive|complete|goty|deluxe|ultimate|special|enhanced|remastered|anniversary|\d+th\s+anniversary)\s*/gi
    ];
    
    for (const pattern of editionPatterns) {
      const withoutEdition = cleanName.replace(pattern, ' ').replace(/\s+/g, ' ').trim();
      if (withoutEdition !== cleanName && withoutEdition.length > 3) {
        variations.push(withoutEdition);
        console.log(`📦 Removendo edição: "${withoutEdition}"`);
      }
    }
    
    // 5. Remove tanto ano quanto edição (busca mais genérica)
    let baseGame = cleanName;
    if (originalYear) {
      baseGame = baseGame.replace(/\s*\(\d{4}\)\s*/g, '');
    }
    for (const pattern of editionPatterns) {
      baseGame = baseGame.replace(pattern, ' ');
    }
    baseGame = baseGame.replace(/\s+/g, ' ').trim();
    if (baseGame !== cleanName && baseGame.length > 3) {
      variations.push(baseGame);
      console.log(`🎮 Busca base: "${baseGame}"`);
    }

    // Remove duplicatas mantendo ordem
    return [...new Set(variations)];
  }

  /**
   * Verifica se dois nomes de jogos são equivalentes
   * @param {string} searchedName - Nome buscado
   * @param {string} foundName - Nome encontrado
   * @returns {boolean} True se forem equivalentes
   */
  isGameNameMatch(searchedName, foundName) {
    if (!searchedName || !foundName) return false;
    
    const normalizeGameName = (name) => {
      return name
        .toLowerCase()
        // Remover prefixos do HowLongToBeat
        .replace(/^how\s+long\s+is\s+/i, '')
        .replace(/\?+$/g, '') // Remover ? do final
        // Remover símbolos e pontuação (EXCETO números romanos e anos)
        .replace(/[™®©]/g, '')
        .replace(/[:\-–—]/g, ' ')
        .replace(/['"]/g, '')
        .replace(/[\.!]/g, '')
        // Remover stop words (artigos, preposições, conectivos)
        .replace(/\b(the|a|an|of|in|on|at|to|for|with|by|from|into|onto|upon|over|under|above|below|between|among|through|during|before|after|while|since|until|and|or|but|nor|so|yet)\b/g, '')
        // Remover anos entre parênteses APENAS
        .replace(/\s*\(\d{4}\)\s*/g, '')
        // Remover edições especiais (preservando números romanos e anos)
        .replace(/\b(definitive|complete|goty|game\s+of\s+the\s+year|deluxe|ultimate|special|collector's?|limited|enhanced|remastered|director's?\s+cut|anniversary|\d+th\s+anniversary)\s+edition\b/gi, '')
        .replace(/\b(definitive|complete|goty|deluxe|ultimate|special|enhanced|remastered|anniversary|\d+th\s+anniversary)\b/gi, '')
        // Normalizar espaços
        .replace(/\s+/g, ' ')
        .trim();
    };

    const normalizedSearched = normalizeGameName(searchedName);
    const normalizedFound = normalizeGameName(foundName);
    
    console.log(`🔍 Comparando: "${normalizedSearched}" vs "${normalizedFound}"`);
    
    // REGRA 1: Match exato (após normalização) - prioridade máxima
    if (normalizedSearched === normalizedFound) {
      console.log(`✅ Match EXATO encontrado`);
      return true;
    }
    
    // REGRA 2: Verificar se há números romanos ou anos - ser mais rigoroso
    const hasRomanNumerals = /\b(i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv|xvi|xvii|xviii|xix|xx)\b/i;
    const hasYearNumbers = /\b(19|20)\d{2}\b|\b\d{1,2}\b/; // Anos ou números como FIFA 19, 18, etc.
    
    const searchedHasNumbers = hasRomanNumerals.test(normalizedSearched) || hasYearNumbers.test(normalizedSearched);
    const foundHasNumbers = hasRomanNumerals.test(normalizedFound) || hasYearNumbers.test(normalizedFound);
    
    if (searchedHasNumbers || foundHasNumbers) {
      console.log(`🔢 Números/Romanos detectados - aplicando match rigoroso`);
      
      // Para jogos com números, exigir match muito alto (90%+)
      const distance = this.calculateLevenshteinDistance(normalizedSearched, normalizedFound);
      const maxLength = Math.max(normalizedSearched.length, normalizedFound.length);
      const similarity = ((maxLength - distance) / maxLength) * 100;
      
      console.log(`📊 Similaridade (modo rigoroso): ${similarity.toFixed(1)}%`);
      
      // Match rigoroso: 90% para jogos com números
      return similarity >= 90;
    }
    
    // REGRA 3: Para jogos sem números, usar similaridade padrão mais permissiva
    const distance = this.calculateLevenshteinDistance(normalizedSearched, normalizedFound);
    const maxLength = Math.max(normalizedSearched.length, normalizedFound.length);
    const similarity = ((maxLength - distance) / maxLength) * 100;
    
    console.log(`📊 Similaridade (modo padrão): ${similarity.toFixed(1)}%`);
    
    // Match padrão: 75% para jogos sem números (mais rigoroso que antes)
    return similarity >= 75;
  }

  /**
   * Calcula a distância de Levenshtein entre duas strings
   * @param {string} str1 - Primeira string
   * @param {string} str2 - Segunda string
   * @returns {number} Distância de Levenshtein
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
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Atualiza o tempo de jogo de um jogo no banco de dados
   * @param {number} gameId - ID do jogo
   * @param {number} playTime - Tempo de jogo em horas
   * @returns {Promise<boolean>} True se atualizado com sucesso
   */
  async updateGamePlayTime(gameId, playTime) {
    try {
      await gamesDb.update(gameId, { playTime });
      console.log(`✅ Tempo de jogo atualizado: ID ${gameId} - ${playTime}h`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao atualizar tempo de jogo do ID ${gameId}:`, error);
      return false;
    }
  }

  /**
   * Aguarda um tempo especificado
   * @param {number} ms - Milissegundos para aguardar
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Executa o crawling e atualiza tempos de jogo
   * @param {Object} options - Opções de configuração  
   * @param {number} options.limit - Limite de jogos para processar (padrão: 400)
   * @param {boolean} options.dryRun - Se true, não atualiza o banco (padrão: false)
   * @param {boolean} options.clearCooldown - Se true, limpa cooldown antes de começar (padrão: false)
   * @returns {Promise<Object>} Estatísticas do crawling
   */
  async crawlAndUpdatePlayTimes(options = {}) {
    const { limit = 400, dryRun = false, clearCooldown = false } = options;
    
    const stats = {
      processed: 0,
      found: 0,
      updated: 0,
      errors: 0,
      skippedCooldown: 0,
      clearedCooldowns: 0
    };

    try {
      console.log(`🚀 Iniciando crawling de tempos de jogo...`);
      console.log(`📊 Limite: ${limit} jogos`);
      console.log(`🧪 Modo: ${dryRun ? 'DRY RUN' : 'PRODUÇÃO'}`);
      console.log(`⏸️ Sistema de cooldown: 1 tentativa → 7 dias de pausa`);
      
      // Limpar cooldown se solicitado (ANTES de buscar jogos)
      if (clearCooldown && !dryRun) {
        console.log(`🧹 Limpando cooldown de todos os jogos...`);
        stats.clearedCooldowns = await this.clearAllCooldowns();
      }
      
      // Buscar jogos SEM tempo APÓS limpar cooldown
      const gamesWithoutPlayTime = await this.findGamesWithoutPlayTime();
      
      await this.initBrowser();
      console.log(`🎮 Encontrados ${gamesWithoutPlayTime.length} jogos disponíveis para processar`);
      
      const gamesToProcess = gamesWithoutPlayTime.slice(0, limit);
      
      for (const game of gamesToProcess) {
        try {
          console.log(`\n🔍 Processando: ${game.name} (ID: ${game.id})`);
          stats.processed++;
          
          const playTime = await this.searchGamePlayTime(game.name);
          
          if (playTime !== null) {
            stats.found++;
            console.log(`✅ Tempo encontrado: ${playTime}h`);
            
            if (!dryRun) {
              // Atualizar tempo de jogo no banco
              const updated = await this.updateGamePlayTime(game.id, playTime);
              if (updated) {
                stats.updated++;
              }
              
              // Atualizar contador de tentativas (sucesso)
              await this.updateAttemptCounter(game.id, true);
            } else {
              console.log(`🧪 DRY RUN: Não atualizando banco de dados`);
            }
          } else {
            console.log(`❌ Tempo não encontrado`);
            
            if (!dryRun) {
              // Atualizar contador de tentativas (falha) - entrará em cooldown
              await this.updateAttemptCounter(game.id, false);
            }
          }
          
          // Aguardar entre buscas para ser respeitoso
          if (stats.processed < gamesToProcess.length) {
            console.log(`⏳ Aguardando ${this.delay}ms...`);
            await this.sleep(this.delay);
          }
          
        } catch (error) {
          console.error(`❌ Erro ao processar jogo "${game.name}":`, error.message);
          stats.errors++;
          
          if (!dryRun) {
            // Mesmo com erro, contar como tentativa falhada
            await this.updateAttemptCounter(game.id, false);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro no crawling:', error);
      stats.errors++;
    } finally {
      await this.closeBrowser();
    }

    console.log(`\n📊 Estatísticas finais:`);
    if (stats.clearedCooldowns > 0) {
      console.log(`   Cooldowns limpos: ${stats.clearedCooldowns}`);
    }
    console.log(`   Processados: ${stats.processed}`);
    console.log(`   Encontrados: ${stats.found}`);
    console.log(`   Atualizados: ${stats.updated}`);
    console.log(`   Erros: ${stats.errors}`);
    console.log(`   Taxa de sucesso: ${stats.processed > 0 ? ((stats.found / stats.processed) * 100).toFixed(1) : 0}%`);
    
    if (!clearCooldown) {
      console.log(`\n💡 Próxima execução: Jogos que falharam hoje estarão em cooldown por 7 dias`);
      console.log(`   Para reprocessar todos os jogos: adicione --clear-cooldown`);
    }

    return {
      processed: stats.processed,
      updated: stats.updated,
      failed: stats.errors,
      errors: [] // Simplified for compatibility
    };
  }

  /**
   * Busca tempo de jogo para um jogo específico - REUTILIZA código existente
   * Usado durante a criação de jogos para busca automática
   * @param {string} gameName - Nome do jogo
   * @param {Object} options - Opções de configuração
   * @param {boolean} options.useOwnBrowser - Se true, cria browser próprio (padrão: true)
   * @param {boolean} options.quickSearch - Se true, testa menos variações (padrão: true)
   * @returns {Promise<number|null>} Tempo em horas ou null
   */
  async searchSingleGamePlayTime(gameName, options = {}) {
    const { useOwnBrowser = true, quickSearch = true } = options;
    
    let browserInstance = null;
    let originalBrowser = null;
    let originalPage = null;
    
    try {
      console.log(`🔍 [SINGLE] Buscando "${gameName}"`);
      
      if (useOwnBrowser) {
        // Salvar instâncias atuais e criar browser temporário
        originalBrowser = this.browser;
        originalPage = this.page;
        this.browser = null;
        this.page = null;
        
        await this.initBrowser();
        browserInstance = this.browser;
        console.log(`🚀 [SINGLE] Browser temporário criado`);
      } else {
        // Usar browser existente (se houver)
        await this.initBrowser();
      }
      
      // REUTILIZAR métodos existentes com adaptações mínimas
      const originalYear = this.extractYearFromGameName(gameName);
      let searchVariations = this.generateSearchVariations(gameName, originalYear);
      
      // Se quickSearch, limitar variações para ser mais rápido
      if (quickSearch) {
        searchVariations = searchVariations.slice(0, 3); // Top 3 variações mais prováveis
        console.log(`⚡ [SINGLE] Modo rápido - ${searchVariations.length} variações`);
      }
      
      for (const searchTerm of searchVariations) {
        console.log(`🎯 [SINGLE] Testando: "${searchTerm}"`);
        
        // REUTILIZAR método searchWithPuppeteer existente
        const playTime = await this.searchWithPuppeteer(searchTerm, originalYear);
        if (playTime !== null) {
          console.log(`✅ [SINGLE] Encontrado! ${playTime}h`);
          return playTime;
        }
      }

      console.log(`❌ [SINGLE] Não encontrado para "${gameName}"`);
      return null;
      
    } catch (error) {
      console.error(`❌ [SINGLE] Erro ao buscar "${gameName}":`, error.message);
      return null;
    } finally {
      // Limpar browser temporário se foi criado
      if (useOwnBrowser && browserInstance) {
        console.log(`🔒 [SINGLE] Fechando browser temporário`);
        await browserInstance.close();
        
        // Restaurar instâncias originais
        this.browser = originalBrowser;
        this.page = originalPage;
      }
    }
  }

  /**
   * Remove cooldown de todos os jogos (limpa contadores de tentativas)
   * @returns {Promise<number>} Número de jogos limpos
   */
  async clearAllCooldowns() {
    try {
      const allGames = await gamesDb.getAll();
      let clearedCount = 0;
      
      for (const game of allGames) {
        if (game.playTimeAttemptCount > 0 || game.playTimeLastAttempt) {
          await gamesDb.update(game.id, {
            playTimeAttemptCount: 0,
            playTimeLastAttempt: null
          });
          clearedCount++;
        }
      }
      
      console.log(`🧹 Cooldown limpo para ${clearedCount} jogos`);
      return clearedCount;
    } catch (error) {
      console.error('Erro ao limpar cooldowns:', error);
      throw error;
    }
  }
} 