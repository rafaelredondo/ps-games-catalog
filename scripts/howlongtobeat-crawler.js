#!/usr/bin/env node

import { HowLongToBeatCrawler } from '../backend/src/services/howlongtobeat-crawler.js';
import { gamesDb } from '../backend/src/db/database.js';

/**
 * Script de linha de comando para executar o crawler do HowLongToBeat
 * 
 * Uso:
 * node scripts/howlongtobeat-crawler.js [opções]
 * 
 * Opções:
 * --max-games <número>  : Máximo de jogos para processar (padrão: 10)
 * --dry-run            : Apenas simula, não salva no banco
 * --help               : Mostra esta ajuda
 */

// Função para exibir ajuda
function showHelp() {
  console.log(`
🎮 HowLongToBeat Crawler - PS Games Catalog

DESCRIÇÃO:
  Busca automaticamente tempos de jogo do HowLongToBeat para jogos que não possuem playTime.
  Foca apenas no tempo da história principal dos jogos.

USO:
  node scripts/howlongtobeat-crawler.js [opções]

OPÇÕES:
  --max-games <número>    Máximo de jogos para processar por execução (padrão: 400)
  --dry-run               Executa sem modificar o banco de dados (apenas visualização)
  --help                  Exibe esta mensagem de ajuda
  --clear-cooldown        Remove cooldown de todos os jogos (permite reprocessar tudo)

EXEMPLOS:
  node scripts/howlongtobeat-crawler.js
  node scripts/howlongtobeat-crawler.js --max-games 50
  node scripts/howlongtobeat-crawler.js --dry-run
  node scripts/howlongtobeat-crawler.js --clear-cooldown

IMPORTANTE:
  - O script adiciona um delay de 3 segundos entre requisições para ser respeitoso
  - Sites como HowLongToBeat podem ter proteções anti-bot
  - Execute em pequenos lotes para evitar bloqueios
  - Use --dry-run primeiro para testar

DICAS:
  - Para executar periodicamente, configure um cron job
  - Monitore os logs para identificar problemas
  - Se muitos jogos falharem, pode ser necessário ajustar o script
  - Tempos são extraídos apenas para a história principal
`);
}

// Função para parsear argumentos da linha de comando
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    maxGames: 400,
    dryRun: false,
    help: false,
    clearCooldown: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--max-games':
        if (i + 1 < args.length) {
          const value = parseInt(args[i + 1], 10);
          if (isNaN(value) || value <= 0) {
            console.error('❌ --max-games deve ser um número positivo');
            process.exit(1);
          }
          options.maxGames = value;
          i++; // Pular o próximo argumento (valor)
        } else {
          console.error('❌ --max-games requer um valor');
          process.exit(1);
        }
        break;
        
      case '--dry-run':
        options.dryRun = true;
        break;
        
      case '--help':
      case '-h':
        options.help = true;
        break;
        
      case '--clear-cooldown':
        options.clearCooldown = true;
        break;
        
      default:
        console.error(`❌ Opção desconhecida: ${arg}`);
        console.log('Use --help para ver as opções disponíveis');
        process.exit(1);
    }
  }

  return options;
}

// Função principal
async function main() {
  console.log('🎮 HowLongToBeat Crawler - PS Games Catalog\n');
  
  try {
    // Parsear argumentos
    const options = parseArguments();
    
    // Mostrar ajuda se solicitado
    if (options.help) {
      showHelp();
      process.exit(0);
    }

    // Validar se é um dry run
    if (options.dryRun) {
      console.log('🔍 MODO DRY RUN - Nenhuma alteração será salva no banco\n');
    }

    // Exibir configuração
    console.log('📊 Configuração:');
    console.log(`   Máximo de jogos: ${options.maxGames}`);
    console.log(`   Dry Run: ${options.dryRun ? 'Sim' : 'Não'}`);
    console.log(`   Clear Cooldown: ${options.clearCooldown ? 'Sim' : 'Não'}`);
    console.log('');

    // Inicializar crawler
    const crawler = new HowLongToBeatCrawler();
    
    // Confirmação se não for dry run
    if (!options.dryRun) {
      console.log('⚠️  O crawler irá fazer requisições reais ao HowLongToBeat e atualizar o banco de dados.');
      console.log('💡 Dica: Use --dry-run primeiro para testar sem fazer alterações.\n');
    }

    // Executar crawler
    const result = await crawler.crawlAndUpdatePlayTimes({
      limit: options.maxGames,  // Corrigir: usar 'limit' em vez de 'maxGames'
      dryRun: options.dryRun,
      clearCooldown: options.clearCooldown
    });

    // Exibir resultados finais
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO FINAL');
    console.log('='.repeat(50));
    console.log(`✅ Jogos processados: ${result.processed}`);
    console.log(`🔄 Jogos atualizados: ${result.updated}`);
    console.log(`❌ Jogos falharam: ${result.failed}`);
    
    if (result.errors.length > 0) {
      console.log('\n⚠️ Erros encontrados:');
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    // Taxa de sucesso
    const successRate = result.processed > 0 ? (result.updated / result.processed * 100).toFixed(1) : 0;
    console.log(`\n📈 Taxa de sucesso: ${successRate}%`);

    // Sugestões
    if (result.failed > 0) {
      console.log('\n💡 Sugestões:');
      console.log('   - Alguns jogos podem ter nomes diferentes no HowLongToBeat');
      console.log('   - Verifique manualmente os jogos que falharam');
      console.log('   - Execute novamente após algumas horas se houve muitas falhas');
      console.log('   - Jogos muito antigos ou obscuros podem não ter dados');
    }

    if (!options.dryRun && result.updated > 0) {
      console.log('\n🎉 Sucesso! Os tempos de jogo foram atualizados no banco de dados.');
      console.log('   Você pode verificar os resultados na aplicação web.');
    }

    if (result.updated > 0) {
      console.log('\n📊 Informações adicionais:');
      console.log('   - Tempos são baseados na história principal dos jogos');
      console.log('   - Valores em horas com uma casa decimal');
      console.log('   - Dados extraídos da comunidade do HowLongToBeat');
    }

  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('🌐 Problema de conexão com a internet.');
    } else if (error.message.includes('database')) {
      console.error('💾 Problema com o banco de dados.');
    } else if (error.message.includes('HowLongToBeat')) {
      console.error('🕸️ Problema ao acessar o HowLongToBeat.');
      console.error('   - Site pode estar indisponível');
      console.error('   - Possível bloqueio por rate limiting');
      console.error('   - Tente novamente mais tarde');
    }
    
    process.exit(1);
  }
}

// Executar apenas se este arquivo foi chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 