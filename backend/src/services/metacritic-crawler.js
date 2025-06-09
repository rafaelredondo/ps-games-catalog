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
  async searchMetacriticScore(gameName) {
    try {
      // Tentar diferentes estratégias de busca
      const strategies = [
        () => this.searchByDirectURL(gameName),
        () => this.searchByAlternativeURL(gameName),
        () => this.searchWithVariations(gameName)
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
      // Sanitizar nome para URL direta do Metacritic
      const urlName = gameName
        .toLowerCase()
        .replace(/[™®]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const directUrl = `https://www.metacritic.com/game/${urlName}/`;
      
      const config = {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
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

      return this.extractScoreFromHTML(html, gameName);

    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`❌ Página não encontrada para "${gameName}"`);
        return null;
      }
      throw error;
    }
  }

  /**
   * Busca usando URL alternativa 
   */
  async searchByAlternativeURL(gameName) {
    try {
      // Tentar com plataforma específica
      const urlName = gameName
        .toLowerCase()
        .replace(/[™®]/g, '')
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
          const score = this.extractScoreFromHTML(response.data, gameName);
          
          if (score !== null) {
            return score;
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
   * Busca usando variações do nome
   */
  async searchWithVariations(gameName) {
    try {
      const variations = [
        gameName.replace(/[™®]/g, '').trim(),
        gameName.replace(/\s*:\s*/g, '-').replace(/[™®]/g, '').trim(),
        gameName.replace(/\s+/g, '-').replace(/[™®]/g, '').trim(),
        gameName.replace(/remastered/i, '').trim(),
        gameName.replace(/edition/i, '').trim()
      ];

      for (const variation of variations) {
        if (variation !== gameName) {
          console.log(`🔄 Tentando variação: "${variation}"`);
          const result = await this.searchByDirectURL(variation);
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
   * Extrai a pontuação do HTML
   */
  extractScoreFromHTML(html, gameName) {
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

    for (const pattern of scorePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const score = parseInt(match[1], 10);
        if (score >= 0 && score <= 100) {
          console.log(`✅ Nota encontrada: ${score}`);
          return score;
        }
      }
    }

    // Verificar se a página carregou corretamente
    if (html.length < 1000) {
      console.log(`❌ Página muito pequena para "${gameName}"`);
      return null;
    }

    console.log(`⚠️ HTML carregado mas nota não encontrada para "${gameName}"`);
    // console.log('📄 Primeiros 500 caracteres:', html.substring(0, 500)); // DEBUG
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
    const { maxGames = 50, dryRun = false } = options;
    
    console.log('🕷️ Iniciando crawler do Metacritic...');
    console.log(`📊 Configuração: maxGames=${maxGames}, dryRun=${dryRun}`);
    
    const result = {
      processed: 0,
      updated: 0,
      failed: 0,
      skipped: 0,
      errors: []
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
          const score = await this.searchMetacriticScore(game.name);
          
          if (score !== null) {
            if (!dryRun) {
              // Atualizar no banco
              const updated = await this.updateGameMetacriticScore(game.id, score);
              if (updated) {
                result.updated++;
                console.log(`✅ "${game.name}" atualizado com nota ${score}`);
              } else {
                result.failed++;
                result.errors.push(`Erro ao salvar "${game.name}" no banco`);
              }
            } else {
              result.updated++;
              console.log(`🔍 [DRY RUN] "${game.name}" seria atualizado com nota ${score}`);
            }
          } else {
            result.failed++;
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
          result.errors.push(`Erro ao processar "${game.name}": ${error.message}`);
          console.error(`❌ Erro ao processar "${game.name}":`, error.message);
        }
      }

      // Relatório final
      console.log('\n📊 Relatório Final:');
      console.log(`✅ Processados: ${result.processed}`);
      console.log(`🔄 Atualizados: ${result.updated}`);
      console.log(`❌ Falharam: ${result.failed}`);
      
      if (result.errors.length > 0) {
        console.log('\n⚠️ Erros encontrados:');
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