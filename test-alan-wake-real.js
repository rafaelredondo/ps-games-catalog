import { MetacriticCrawler } from './backend/src/services/metacritic-crawler.js';

async function testAlanWakeReal() {
  console.log('🎮 TESTE REAL: Alan Wake Remastered');
  console.log('='.repeat(50));
  
  const crawler = new MetacriticCrawler();
  
  try {
    console.log('🔍 Testando busca real no Metacritic...');
    
    // Teste com o nome exato
    console.log('\n📋 1. Testando nome exato: "Alan Wake Remastered"');
    const score1 = await crawler.searchMetacriticScore('Alan Wake Remastered');
    console.log(`   Resultado: ${score1}`);
    
    if (score1) {
      console.log('✅ SUCESSO! Encontrou a nota.');
      return;
    }
    
    // Teste sem "Remastered"
    console.log('\n📋 2. Testando sem "Remastered": "Alan Wake"');
    const score2 = await crawler.searchMetacriticScore('Alan Wake');
    console.log(`   Resultado: ${score2}`);
    
    if (score2) {
      console.log('✅ SUCESSO! Encontrou a nota.');
      return;
    }
    
    console.log('\n❌ Não conseguiu encontrar a nota em nenhuma tentativa.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testAlanWakeReal().catch(console.error); 