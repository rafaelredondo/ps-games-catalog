import axios from 'axios';
import { gamesDb } from '../db/database.js';

/**
 * Metacritic Crawler Service
 * 
 * Busca automaticamente notas do Metacritic para jogos que não possuem avaliação
 */
export class MetacriticCrawler {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.delay = 2000; // 2 segundos entre requisições para ser respeitoso
  }

  /**
   * Busca jogos no banco que não possuem nota do Metacritic
   * @returns {Promise<Array>} Array de jogos sem nota
   */
  async findGamesWithoutMetacriticScore() {
    try {
      const allGames = await gamesDb.getAll();
      return allGames.filter(game => 
        game.metacritic === null || 
        game.metacritic === undefined || 
        game.metacritic === 0
      );
    } catch (error) {
      console.error('Erro ao buscar jogos sem nota do Metacritic:', error);
      throw error;
    }
  }

  /**
   * Busca a nota de um jogo específico no Metacritic
   * @param {string} gameName - Nome do jogo para buscar
   * @returns {Promise<number|null>} Nota do Metacritic ou null se não encontrado
   */
  async searchMetacriticScore(gameName, gameData = null) {
    try {
      // Tentar diferentes estratégias de busca
      const strategies = [
        () => this.searchByDirectURL(gameName),
        () => this.searchByAlternativeURL(gameName),
        () => this.searchWithVariations(gameName, gameData)
      ];

      for (const strategy of strategies) {
        const score = await strategy();
        if (score !== null) {
          return score;
        }
      }

      return null;
    } catch (error) {
      console.error(`❌ Erro ao buscar "${gameName}" no Metacritic:`, error.message);
      return null;
    }
  }

  /**
   * Busca por URL direta (método principal)
   */
  async searchByDirectURL(gameName) {
    try {
      // Limpar nome primeiro, depois sanitizar para URL
      const cleanedName = this.cleanGameName(gameName);
      const urlName = cleanedName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const directUrl = `https://www.metacritic.com/game/${urlName}/`;
      
      const config = {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
          'DNT': '1',
          'Referer': 'https://www.google.com/'
        },
        timeout: 15000,
        maxRedirects: 5
      };

      console.log(`🔍 Buscando "${gameName}" no Metacritic...`);
      console.log(`🌐 URL: ${directUrl}`);
      console.log(`🔧 User-Agent: ${config.headers['User-Agent']}`);
      
      const response = await axios.get(directUrl, config);
      const html = response.data;
      
      console.log(`📊 Response Status: ${response.status}`);
      console.log(`📊 Response Size: ${html.length} chars`);
      console.log(`📊 Response Headers:`, JSON.stringify(response.headers, null, 2));
      
      // Log de debug para ver se a página está carregando
      if (html.length < 1000) {
        console.log(`⚠️ Página muito pequena! Conteúdo:`, html.substring(0, 500));
      } else {
        console.log(`📄 Primeiros 200 chars:`, html.substring(0, 200));
      }

      const result = this.extractScoreFromHTML(html, gameName);
      return result ? result.score : null;

    } catch (error) {
      console.log(`❌ Erro na requisição para "${gameName}":`, error.message);
      console.log(`🔧 Error code:`, error.code);
      console.log(`🔧 Error type:`, error.constructor.name);
      
      if (error.response) {
        console.log(`📊 Response status:`, error.response.status);
        console.log(`📊 Response data:`, error.response.data?.substring(0, 200));
        
        if (error.response.status === 404) {
          console.log(`❌ Página não encontrada para "${gameName}"`);
          return null;
        }
      } else if (error.request) {
        console.log(`❌ Erro de rede/timeout para "${gameName}"`);
        console.log(`🔧 Request details:`, error.request?.constructor?.name);
      } else {
        console.log(`❌ Erro desconhecido para "${gameName}":`, error.message);
      }
      
      // Não fazer throw, retornar null para continuar com URLs alternativas
      return null;
    }
  }

  /**
   * Busca por URL direta retornando detalhes completos (para validação de ano)
   */
  async searchByDirectURLWithDetails(gameName) {
    try {
      // Limpar nome primeiro, depois sanitizar para URL
      const cleanedName = this.cleanGameName(gameName);
      const urlName = cleanedName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const directUrl = `https://www.metacritic.com/game/${urlName}/`;
      
      const config = {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
          'DNT': '1',
          'Referer': 'https://www.google.com/'
        },
        timeout: 15000,
        maxRedirects: 5
      };

      console.log(`🔍 Buscando detalhes para "${gameName}" no Metacritic...`);
      console.log(`🌐 URL: ${directUrl}`);
      
      const response = await axios.get(directUrl, config);
      const html = response.data;
      
      console.log(`📊 Response Status: ${response.status}`);
      console.log(`📊 Response Size: ${html.length} chars`);
      
      return this.extractScoreFromHTML(html, gameName);

    } catch (error) {
      console.log(`❌ Erro na requisição para detalhes de "${gameName}":`, error.message);
      return null;
    }
  }

  /**
   * Busca usando URL alternativa 
   */
  async searchByAlternativeURL(gameName) {
    try {
      // Limpar nome primeiro, depois tentar com plataforma específica
      const cleanedName = this.cleanGameName(gameName);
      const urlName = cleanedName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const platforms = ['playstation-5', 'playstation-4', 'nintendo-switch', 'pc'];
      
      for (const platform of platforms) {
        const altUrl = `https://www.metacritic.com/game/${platform}/${urlName}/`;
        
        try {
          const config = {
            headers: { 'User-Agent': this.userAgent },
            timeout: 10000
          };

          console.log(`🔍 Tentando URL alternativa: ${altUrl}`);
          const response = await axios.get(altUrl, config);
          const result = this.extractScoreFromHTML(response.data, gameName);
          
          if (result !== null) {
            return result.score;
          }
        } catch (error) {
          // Continuar para próxima plataforma
          continue;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Limpa o nome do jogo removendo símbolos e caracteres desnecessários
   * @param {string} gameName - Nome original do jogo
   * @returns {string} Nome limpo
   */
  cleanGameName(gameName) {
    return gameName
      .replace(/[™®]/g, '') // Remove símbolos de marca registrada
      .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
      .trim();
  }

  /**
   * Detecta e remove sufixos de edições especiais
   * @param {string} gameName - Nome do jogo
   * @returns {Object} Objeto com nome base e nome da edição
   */
  detectSpecialEdition(gameName) {
    const cleanName = this.cleanGameName(gameName);
    
    // Padrões de edições especiais
    const editionPatterns = [
      // Padrões com hífen - específicos primeiro
      /^(.+?)\s*-\s*([\d\w]+th\s+Anniversary\s+Edition)$/i,
      /^(.+?)\s*-\s*(Definitive\s+Edition)$/i,
      /^(.+?)\s*-\s*(Complete\s+Edition)$/i,
      /^(.+?)\s*-\s*(Ultimate\s+Edition)$/i,
      /^(.+?)\s*-\s*(Deluxe\s+Edition)$/i,
      /^(.+?)\s*-\s*(Director's\s+Cut)$/i,
      /^(.+?)\s*-\s*(Enhanced\s+Edition)$/i,
      /^(.+?)\s*-\s*(GOTY\s+Edition)$/i,
      /^(.+?)\s*-\s*(Game\s+of\s+the\s+Year\s+Edition)$/i,
      /^(.+?)\s*-\s*(Premium\s+Edition)$/i,
      /^(.+?)\s*-\s*(Special\s+Edition)$/i,
      /^(.+?)\s*-\s*(Collector's\s+Edition)$/i,
      /^(.+?)\s*-\s*(Gold\s+Edition)$/i,
      /^(.+?)\s*-\s*(Platinum\s+Edition)$/i,
      
      // Padrões mais genéricos com hífen (múltiplas palavras)
      /^(.+?)\s*-\s*(.+\s+Edition)$/i,
      /^(.+?)\s*-\s*(.+\s+Cut)$/i,
      
      // Padrões com dois pontos
      /^(.+?):\s*(Complete\s+Edition)$/i,
      /^(.+?):\s*(Ultimate\s+Edition)$/i,
      /^(.+?):\s*(Deluxe\s+Edition)$/i,
      /^(.+?):\s*(Enhanced\s+Edition)$/i,
      /^(.+?):\s*(Director's\s+Cut)$/i,
      /^(.+?):\s*(GOTY\s+Edition)$/i,
      /^(.+?):\s*(Game\s+of\s+the\s+Year\s+Edition)$/i,
      /^(.+?):\s*(Premium\s+Edition)$/i,
      /^(.+?):\s*(Special\s+Edition)$/i,
      /^(.+?):\s*(Collector's\s+Edition)$/i,
      /^(.+?):\s*(Gold\s+Edition)$/i,
      /^(.+?):\s*(Platinum\s+Edition)$/i,
      
      // Padrões de sufixos simples
      /^(.+?)\s+(Remastered)$/i,
      /^(.+?)\s+(Enhanced\s+Edition)$/i,
      /^(.+?)\s+(Complete\s+Edition)$/i,
      /^(.+?)\s+(Ultimate\s+Edition)$/i,
      /^(.+?)\s+(Deluxe\s+Edition)$/i,
      /^(.+?)\s+(Definitive\s+Edition)$/i,
      /^(.+?)\s+(Director's\s+Cut)$/i,
      /^(.+?)\s+(Premium\s+Edition)$/i,
      /^(.+?)\s+(Special\s+Edition)$/i,
      /^(.+?)\s+(Collector's\s+Edition)$/i,
      /^(.+?)\s+(Gold\s+Edition)$/i,
      /^(.+?)\s+(Platinum\s+Edition)$/i,
      /^(.+?)\s+(GOTY)$/i
    ];

    for (const pattern of editionPatterns) {
      const match = cleanName.match(pattern);
      if (match) {
        return {
          baseName: match[1].trim(),
          editionName: match[2] ? match[2].trim() : '',
          isSpecialEdition: true,
          originalName: cleanName
        };
      }
    }

    return {
      baseName: cleanName,
      editionName: '',
      isSpecialEdition: false,
      originalName: cleanName
    };
  }

  /**
   * Extrai o ano de uma data no formato YYYY-MM-DD
   * @param {string} dateString - Data no formato YYYY-MM-DD
   * @returns {number|null} Ano ou null se inválido
   */
  extractYearFromDate(dateString) {
    if (!dateString || typeof dateString !== 'string') return null;
    
    const match = dateString.match(/^(\d{4})-\d{2}-\d{2}$/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Valida se o ano do jogo corresponde aproximadamente ao esperado
   * @param {number} gameYear - Ano do jogo
   * @param {number} foundYear - Ano encontrado no Metacritic
   * @returns {boolean} True se os anos são compatíveis
   */
  validateGameYear(gameYear, foundYear) {
    if (!gameYear || !foundYear) return true; // Se não temos ano, não validamos
    
    // Permite diferença de até 2 anos (para remasters, relançamentos, etc.)
    const yearDiff = Math.abs(gameYear - foundYear);
    return yearDiff <= 2;
  }

  async searchWithVariations(gameName, gameData = null) {
    try {
      // Limpar nome inicial
      const cleanedName = this.cleanGameName(gameName);
      console.log(`🧹 Nome limpo: "${cleanedName}"`);
      
      // Detectar edições especiais
      const editionInfo = this.detectSpecialEdition(cleanedName);
      console.log(`🎯 Análise de edição:`, editionInfo);
      
      // Extrair ano do jogo se disponível
      const gameYear = gameData && gameData.released ? 
        this.extractYearFromDate(gameData.released) : null;
      
      if (gameYear) {
        console.log(`📅 Ano do jogo: ${gameYear}`);
      }

      // Criar lista de variações para testar
      const variations = [];
      
      // 1. Nome original limpo (primeira tentativa)
      variations.push({
        name: cleanedName,
        description: 'Nome original limpo',
        priority: 1
      });
      
      // 2. Se é edição especial, tentar nome base primeiro
      if (editionInfo.isSpecialEdition) {
        variations.push({
          name: editionInfo.baseName,
          description: `Nome base (removendo "${editionInfo.editionName}")`,
          priority: 2
        });
      }
      
      // 3. Variações de formatação
      variations.push(
        {
          name: cleanedName.replace(/\s*:\s*/g, '-'),
          description: 'Dois pontos → hífen',
          priority: 3
        },
        {
          name: cleanedName.replace(/\s+/g, '-'),
          description: 'Espaços → hífens',
          priority: 4
        },
        {
          name: cleanedName.replace(/remastered/i, '').trim(),
          description: 'Removendo "Remastered"',
          priority: 5
        }
      );
      
      // 4. Se é edição especial, testar variações do nome base também
      if (editionInfo.isSpecialEdition) {
        const baseName = editionInfo.baseName;
        variations.push(
          {
            name: baseName.replace(/\s*:\s*/g, '-'),
            description: 'Nome base: dois pontos → hífen',
            priority: 6
          },
          {
            name: baseName.replace(/\s+/g, '-'),
            description: 'Nome base: espaços → hífens',
            priority: 7
          }
        );
      }

      // Ordenar por prioridade e remover duplicatas
      const uniqueVariations = variations
        .filter((v, index, arr) => 
          arr.findIndex(item => item.name === v.name) === index
        )
        .filter(v => v.name && v.name.length > 0)
        .sort((a, b) => a.priority - b.priority);

      console.log(`🔄 Testando ${uniqueVariations.length} variações:`);
      uniqueVariations.forEach((v, i) => {
        console.log(`   ${i + 1}. "${v.name}" (${v.description})`);
      });

      // Testar cada variação
      for (const variation of uniqueVariations) {
        if (variation.name !== gameName) {
          console.log(`\n🔄 Tentando: "${variation.name}" (${variation.description})`);
          
          // Precisamos de uma versão especial do searchByDirectURL que retorna o objeto completo
          const result = await this.searchByDirectURLWithDetails(variation.name);
          if (result !== null) {
            // Se temos ano do jogo, validar compatibilidade
            if (gameYear && result.year) {
              const isValidYear = this.validateGameYear(gameYear, result.year);
              console.log(`📅 Validação de ano: jogo=${gameYear}, encontrado=${result.year}, válido=${isValidYear}`);
              
              if (!isValidYear) {
                console.log(`⚠️ Ano incompatível, continuando busca...`);
                continue;
              }
            }
            
            console.log(`✅ Sucesso com variação: "${variation.name}"`);
            return result.score;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Erro em searchWithVariations:`, error);
      return null;
    }
  }

  /**
   * Extrai a pontuação e outras informações do HTML
   */
  extractScoreFromHTML(html, gameName) {
    console.log(`🔍 Extraindo score para "${gameName}"`);
    console.log(`📊 HTML size: ${html.length} chars`);
    
    // Primeiro, tentar extrair o ano de lançamento
    const yearPatterns = [
      /"datePublished":\s*"(\d{4})-\d{2}-\d{2}"/i,
      /"releaseDate":\s*"(\d{4})-\d{2}-\d{2}"/i,
      /Released:\s*(\d{4})/i,
      /Release Date:\s*\w+\s+\d+,\s*(\d{4})/i
    ];
    
    let foundYear = null;
    for (const pattern of yearPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        foundYear = parseInt(match[1], 10);
        console.log(`📅 Ano encontrado na página: ${foundYear}`);
        break;
      }
    }
    
    // Padrões atualizados para o novo Metacritic (2024)
    const scorePatterns = [
      // Padrões mais específicos primeiro (maior precisão)
      /"ratingValue":(\d+)/i,                    // JSON-LD estruturado
      /&amp;score=(\d+)/i,                       // Metadados de anúncios
      /"aggregateRating"[^}]*"ratingValue":(\d+)/i, // JSON-LD completo
      
      // Padrões gerais do Metacritic
      /"score":\s*(\d+)/i,
      /metaScore['"]\s*:\s*(\d+)/i,
      /"metascore"\s*:\s*(\d+)/i,
      
      // Padrões HTML
      /<span[^>]*class="[^"]*score[^"]*"[^>]*>(\d+)<\/span>/i,
      /<div[^>]*class="[^"]*metascore[^"]*"[^>]*>(\d+)<\/div>/i,
      /<div[^>]*data-score="(\d+)"/i,
      
      // Padrões específicos da nova estrutura
      /\\"metascore\\":\s*(\d+)/i,
      /score['"]\s*:\s*['"]*(\d+)['"]/i
    ];

    console.log(`🔍 Testando ${scorePatterns.length} padrões...`);
    
    for (let i = 0; i < scorePatterns.length; i++) {
      const pattern = scorePatterns[i];
      const match = html.match(pattern);
      console.log(`🧪 Padrão ${i+1}: ${pattern} -> ${match ? `MATCH: ${match[1]}` : 'NO MATCH'}`);
      
      if (match && match[1]) {
        const score = parseInt(match[1], 10);
        
        // Verificar se é nota 0 e se há indicadores TBD na página
        if (score === 0) {
          const tbdIndicators = ['TBD', 'tbd', 'To Be Determined', 'Not Yet Rated', 'Not Rated'];
          const hasTBD = tbdIndicators.some(indicator => 
            html.toLowerCase().includes(indicator.toLowerCase())
          );
          
          if (hasTBD) {
            console.log(`⚠️ Nota 0 encontrada mas página contém indicadores TBD - ignorando`);
            continue; // Continuar para o próximo padrão
          }
        }
        
        if (score >= 0 && score <= 100) {
          console.log(`✅ Nota encontrada: ${score} (padrão ${i+1})`);
          // Retornar objeto com score e ano
          return {
            score: score,
            year: foundYear
          };
        } else {
          console.log(`⚠️ Score inválido: ${score} (fora do range 0-100)`);
        }
      }
    }

    // Verificar se a página carregou corretamente
    if (html.length < 1000) {
      console.log(`❌ Página muito pequena para "${gameName}"`);
      console.log(`📄 Conteúdo completo:`, html);
      return null;
    }

    console.log(`⚠️ HTML carregado mas nota não encontrada para "${gameName}"`);
    
    // Verificar se contém indicadores TBD
    const tbdIndicators = ['TBD', 'tbd', 'To Be Determined', 'Not Yet Rated', 'Not Rated'];
    const hasTBD = tbdIndicators.some(indicator => 
      html.toLowerCase().includes(indicator.toLowerCase())
    );
    
    if (hasTBD) {
      console.log(`📋 Página contém indicadores TBD - jogo ainda não avaliado`);
      return null;
    }
    
    console.log('📄 Primeiros 1000 caracteres:', html.substring(0, 1000));
    
    // Verificar se contém indicadores do Metacritic
    const indicators = ['metacritic', 'metascore', 'ratingValue', 'God of War'];
    indicators.forEach(indicator => {
      const found = html.toLowerCase().includes(indicator.toLowerCase());
      console.log(`🔍 Contém "${indicator}": ${found ? '✅' : '❌'}`);
    });
    
    return null;
  }

  /**
   * Atualiza a nota do Metacritic de um jogo no banco de dados
   * @param {number} gameId - ID do jogo
   * @param {number} score - Nova nota do Metacritic
   * @returns {Promise<boolean>} True se atualizou com sucesso
   */
  async updateGameMetacriticScore(gameId, score) {
    try {
      await gamesDb.update(gameId, { metacritic: score });
      console.log(`📝 Nota ${score} salva no banco para o jogo ID ${gameId}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao atualizar jogo ${gameId} no banco:`, error);
      return false;
    }
  }

  /**
   * Aguarda um tempo específico
   * @param {number} ms - Millisegundos para aguardar
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Executa o processo completo de crawler
   * @param {Object} options - Opções de configuração
   * @param {number} options.maxGames - Máximo de jogos para processar
   * @param {boolean} options.dryRun - Se true, não salva no banco
   * @returns {Promise<Object>} Resultado do processo
   */
  async crawlAndUpdateScores(options = {}) {
    const { maxGames = 400, dryRun = false } = options;
    
    console.log('🕷️ Iniciando crawler do Metacritic...');
    console.log(`📊 Configuração: maxGames=${maxGames}, dryRun=${dryRun}`);
    
    const result = {
      processed: 0,
      updated: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      updatedGames: [],
      failedGames: []
    };

    try {
      // Buscar jogos sem nota
      const gamesWithoutScores = await this.findGamesWithoutMetacriticScore();
      
      if (gamesWithoutScores.length === 0) {
        console.log('✅ Todos os jogos já possuem nota do Metacritic!');
        return result;
      }

      console.log(`📋 Encontrados ${gamesWithoutScores.length} jogos sem nota do Metacritic`);
      
      // Limitar o número de jogos se especificado
      const gamesToProcess = gamesWithoutScores.slice(0, maxGames);
      
      console.log(`🎯 Processando ${gamesToProcess.length} jogos...`);

      // Processar cada jogo
      for (const game of gamesToProcess) {
        result.processed++;
        
        console.log(`\n🎮 Processando jogo ${result.processed}/${gamesToProcess.length}: "${game.name}"`);
        
        try {
          // Buscar nota no Metacritic
          const score = await this.searchMetacriticScore(game.name, game);
          
          if (score !== null) {
            if (!dryRun) {
              // Atualizar no banco
              const updated = await this.updateGameMetacriticScore(game.id, score);
              if (updated) {
                result.updated++;
                result.updatedGames.push({
                  name: game.name,
                  platform: game.platforms?.[0] || 'N/A',
                  score: score
                });
                console.log(`✅ "${game.name}" atualizado com nota ${score}`);
              } else {
                result.failed++;
                result.failedGames.push({
                  name: game.name,
                  platform: game.platforms?.[0] || 'N/A',
                  reason: 'Erro ao salvar no banco'
                });
                result.errors.push(`Erro ao salvar "${game.name}" no banco`);
              }
            } else {
              result.updated++;
              result.updatedGames.push({
                name: game.name,
                platform: game.platforms?.[0] || 'N/A',
                score: score
              });
              console.log(`🔍 [DRY RUN] "${game.name}" seria atualizado com nota ${score}`);
            }
          } else {
            result.failed++;
            result.failedGames.push({
              name: game.name,
              platform: game.platforms?.[0] || 'N/A',
              reason: 'Nota não encontrada'
            });
            result.errors.push(`Nota não encontrada para "${game.name}"`);
            console.log(`❌ Nota não encontrada para "${game.name}"`);
          }
          
          // Aguardar antes da próxima requisição (ser respeitoso com o servidor)
          if (result.processed < gamesToProcess.length) {
            console.log(`⏳ Aguardando ${this.delay}ms antes da próxima requisição...`);
            await this.sleep(this.delay);
          }
          
        } catch (error) {
          result.failed++;
          result.failedGames.push({
            name: game.name,
            platform: game.platforms?.[0] || 'N/A',
            reason: `Erro: ${error.message}`
          });
          result.errors.push(`Erro ao processar "${game.name}": ${error.message}`);
          console.error(`❌ Erro ao processar "${game.name}":`, error.message);
        }
      }

      // Relatório final
      console.log('\n📊 Relatório Final:');
      console.log(`✅ Processados: ${result.processed}`);
      console.log(`🔄 Atualizados: ${result.updated}`);
      console.log(`❌ Falharam: ${result.failed}`);
      
      // Detalhes dos jogos atualizados
      if (result.updatedGames.length > 0) {
        console.log(`\n✅ Jogos ATUALIZADOS com sucesso:`);
        result.updatedGames.forEach((game, index) => {
          console.log(`   ${index + 1}. ${game.name} - Nota: ${game.score} (${game.platform})`);
        });
      }
      
      // Detalhes dos jogos que falharam
      if (result.failedGames.length > 0) {
        console.log(`\n❌ Jogos que FALHARAM:`);
        result.failedGames.forEach((game, index) => {
          console.log(`   ${index + 1}. ${game.name} - ${game.reason} (${game.platform})`);
        });
      }
      
      if (result.errors.length > 0) {
        console.log('\n⚠️ Log de erros detalhado:');
        result.errors.forEach((error, index) => {
          console.log(`${index + 1}. ${error}`);
        });
      }

      return result;

    } catch (error) {
      console.error('❌ Erro fatal no crawler:', error);
      result.errors.push(`Erro fatal: ${error.message}`);
      throw error;
    }
  }
} 