import { HowLongToBeatCrawler } from './src/services/howlongtobeat-crawler.js';
import { gamesDb } from './src/db/database.js';

class PlayTimeUpdater {
  constructor() {
    this.crawler = new HowLongToBeatCrawler();
    this.results = {
      found: [],
      notFound: [],
      errors: []
    };
  }

  async getGamesWithoutPlayTime() {
    console.log('📊 Consultando base de dados...\n');
    
    const games = await gamesDb.getAll();
    const gamesWithoutPlayTime = games.filter(game => 
      !game.playTime || game.playTime === null || game.playTime === 0
    );
    
    console.log(`📈 Total de jogos na base: ${games.length}`);
    console.log(`❌ Jogos sem tempo de jogo: ${gamesWithoutPlayTime.length}\n`);
    
    if (gamesWithoutPlayTime.length === 0) {
      console.log('✅ Todos os jogos já têm tempo de jogo definido!');
      return [];
    }
    
    console.log('🎮 Jogos que precisam de tempo de jogo:');
    gamesWithoutPlayTime.forEach((game, index) => {
      const platforms = Array.isArray(game.platforms) ? game.platforms.join(', ') : game.platforms || 'N/A';
      console.log(`   ${index + 1}. ${game.name} (${platforms})`);
    });
    console.log('');
    
    return gamesWithoutPlayTime;
  }

  async searchPlayTimes(games, updateDatabase = false) {
    console.log(`🔍 Iniciando busca de tempos de jogo...\n`);
    console.log(`📋 Modo: ${updateDatabase ? 'ATUALIZAR BASE' : 'APENAS RELATÓRIO'}\n`);
    
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      const progress = `[${i + 1}/${games.length}]`;
      
      console.log(`${progress} 🔍 Buscando: "${game.name}"`);
      
      try {
        const startTime = Date.now();
        const playTime = await this.crawler.searchGamePlayTime(game.name);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        
        if (playTime !== null) {
          console.log(`   ✅ Encontrado: ${playTime}h (${duration}s)`);
          
          this.results.found.push({
            id: game.id,
            title: game.name,
            platform: Array.isArray(game.platforms) ? game.platforms.join(', ') : game.platforms || 'N/A',
            playTime: playTime,
            searchDuration: duration
          });
          
          // Atualizar base se solicitado
          if (updateDatabase) {
            await gamesDb.update(game.id, { playTime: playTime });
            console.log(`   💾 Atualizado na base de dados`);
          }
          
        } else {
          console.log(`   ❌ Não encontrado (${duration}s)`);
          
          this.results.notFound.push({
            id: game.id,
            title: game.name,
            platform: Array.isArray(game.platforms) ? game.platforms.join(', ') : game.platforms || 'N/A',
            searchDuration: duration
          });
        }
        
      } catch (error) {
        console.log(`   🚨 Erro: ${error.message}`);
        
        this.results.errors.push({
          id: game.id,
          title: game.name,
          platform: Array.isArray(game.platforms) ? game.platforms.join(', ') : game.platforms || 'N/A',
          error: error.message
        });
      }
      
      // Pausa entre buscas para não sobrecarregar o site
      if (i < games.length - 1) {
        console.log('   ⏸️ Aguardando 2s...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  generateReport(updateDatabase = false) {
    const total = this.results.found.length + this.results.notFound.length + this.results.errors.length;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO FINAL - ATUALIZAÇÃO DE TEMPOS DE JOGO');
    console.log('='.repeat(80));
    
    console.log(`\n📋 Modo executado: ${updateDatabase ? 'ATUALIZAÇÃO DA BASE' : 'APENAS RELATÓRIO'}`);
    console.log(`🎮 Total de jogos processados: ${total}`);
    console.log(`✅ Tempos encontrados: ${this.results.found.length}`);
    console.log(`❌ Não encontrados: ${this.results.notFound.length}`);
    console.log(`🚨 Erros: ${this.results.errors.length}`);
    console.log(`📈 Taxa de sucesso: ${total > 0 ? ((this.results.found.length / total) * 100).toFixed(1) : 0}%\n`);
    
    // Sucessos
    if (this.results.found.length > 0) {
      console.log('✅ JOGOS COM TEMPO ENCONTRADO:');
      console.log('-'.repeat(80));
      this.results.found.forEach((result, index) => {
        const status = updateDatabase ? '💾' : '📋';
        console.log(`${index + 1}. ${status} ${result.title.padEnd(40)} | ${result.playTime}h | ${result.searchDuration}s`);
      });
      console.log('');
    }
    
    // Não encontrados
    if (this.results.notFound.length > 0) {
      console.log('❌ JOGOS NÃO ENCONTRADOS:');
      console.log('-'.repeat(80));
      this.results.notFound.forEach((result, index) => {
        console.log(`${index + 1}. ${result.title.padEnd(40)} | ${result.platform} | ${result.searchDuration}s`);
      });
      console.log('');
    }
    
    // Erros
    if (this.results.errors.length > 0) {
      console.log('🚨 ERROS DURANTE BUSCA:');
      console.log('-'.repeat(80));
      this.results.errors.forEach((result, index) => {
        console.log(`${index + 1}. ${result.title.padEnd(40)} | ${result.error}`);
      });
      console.log('');
    }
    
    if (updateDatabase && this.results.found.length > 0) {
      console.log('💾 Base de dados atualizada com sucesso!');
    } else if (!updateDatabase && this.results.found.length > 0) {
      console.log('📋 Para atualizar a base, execute: node update-play-times.js --update');
    }
  }

  async cleanup() {
    await this.crawler.closeBrowser();
  }
}

async function main() {
  const updateMode = process.argv.includes('--update');
  
  console.log('🎮 ATUALIZADOR DE TEMPOS DE JOGO - HowLongToBeat\n');
  
  const updater = new PlayTimeUpdater();
  
  try {
    // 1. Buscar jogos sem tempo de jogo
    const gamesWithoutPlayTime = await updater.getGamesWithoutPlayTime();
    
    if (gamesWithoutPlayTime.length === 0) {
      return;
    }
    
    // 2. Confirmar execução
    if (updateMode) {
      console.log('⚠️  ATENÇÃO: Modo de ATUALIZAÇÃO ativado!');
      console.log('   A base de dados SERÁ MODIFICADA.\n');
    } else {
      console.log('📋 Modo RELATÓRIO ativado (base não será modificada)\n');
    }
    
    // 3. Buscar tempos de jogo
    await updater.searchPlayTimes(gamesWithoutPlayTime, updateMode);
    
    // 4. Gerar relatório
    updater.generateReport(updateMode);
    
  } catch (error) {
    console.error('🚨 Erro fatal:', error);
  } finally {
    await updater.cleanup();
    console.log('\n🔒 Processo concluído!');
  }
}

main().catch(console.error); 