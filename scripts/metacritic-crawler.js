#!/usr/bin/env node

import { MetacriticCrawler } from '../backend/src/services/metacritic-crawler.js';
import { gamesDb } from '../backend/src/db/database.js';

/**
 * Script de linha de comando para executar o crawler do Metacritic
 * 
 * Uso:
 * node scripts/metacritic-crawler.js [opções]
 * 
 * Opções:
 * --max-games <número>  : Máximo de jogos para processar (padrão: 10)
 * --dry-run            : Apenas simula, não salva no banco
 * --help               : Mostra esta ajuda
 */

// Função para exibir ajuda
function showHelp() {
  console.log(`
🕷️ Metacritic Crawler - PS Games Catalog

DESCRIÇÃO:
  Busca automaticamente notas do Metacritic para jogos que não possuem avaliação.

USO:
  node scripts/metacritic-crawler.js [opções]

OPÇÕES:
  --max-games <número>    Máximo de jogos para processar por execução (padrão: 10)
  --dry-run              Apenas simula o processo, não salva no banco de dados
  --help                 Mostra esta mensagem de ajuda

EXEMPLOS:
  # Processar até 5 jogos
  node scripts/metacritic-crawler.js --max-games 5

  # Simular o processo sem salvar
  node scripts/metacritic-crawler.js --dry-run

  # Processar até 20 jogos
  node scripts/metacritic-crawler.js --max-games 20

IMPORTANTE:
  - O script adiciona um delay de 2 segundos entre requisições para ser respeitoso
  - Sites como Metacritic podem ter proteções anti-bot
  - Execute em pequenos lotes para evitar bloqueios
  - Use --dry-run primeiro para testar

DICAS:
  - Para executar periodicamente, configure um cron job
  - Monitore os logs para identificar problemas
  - Se muitos jogos falharem, pode ser necessário ajustar o script
`);
}

// Função para parsear argumentos da linha de comando
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    maxGames: 10,
    dryRun: false,
    help: false
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
  console.log('🕷️ Metacritic Crawler - PS Games Catalog\n');
  
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
    console.log('');

    // Inicializar crawler
    const crawler = new MetacriticCrawler();
    
    // Buscar jogos sem nota primeiro
    console.log('🔍 Verificando jogos sem nota do Metacritic...');
    const gamesWithoutScores = await crawler.findGamesWithoutMetacriticScore();
    
    if (gamesWithoutScores.length === 0) {
      console.log('✅ Parabéns! Todos os jogos já possuem nota do Metacritic.');
      process.exit(0);
    }

    console.log(`📋 Encontrados ${gamesWithoutScores.length} jogos sem nota:`);
    gamesWithoutScores.slice(0, options.maxGames).forEach((game, index) => {
      console.log(`   ${index + 1}. ${game.name}`);
    });

    if (gamesWithoutScores.length > options.maxGames) {
      console.log(`   ... e mais ${gamesWithoutScores.length - options.maxGames} jogos`);
    }
    console.log('');

    // Confirmar execução se não for dry run
    if (!options.dryRun) {
      console.log('⚠️  O crawler irá fazer requisições reais ao Metacritic e atualizar o banco de dados.');
      console.log('💡 Dica: Use --dry-run primeiro para testar sem fazer alterações.\n');
    }

    // Executar crawler
    const result = await crawler.crawlAndUpdateScores({
      maxGames: options.maxGames,
      dryRun: options.dryRun
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
      console.log('   - Alguns jogos podem ter nomes diferentes no Metacritic');
      console.log('   - Verifique manualmente os jogos que falharam');
      console.log('   - Execute novamente após algumas horas se houve muitas falhas');
    }

    if (!options.dryRun && result.updated > 0) {
      console.log('\n🎉 Sucesso! As notas foram atualizadas no banco de dados.');
      console.log('   Você pode verificar os resultados na aplicação web.');
    }

  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('🌐 Problema de conexão com a internet.');
    } else if (error.message.includes('database')) {
      console.error('💾 Problema com o banco de dados.');
    }
    
    process.exit(1);
  }
}

// Executar apenas se este arquivo foi chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 