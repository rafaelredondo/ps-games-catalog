import { MetacriticCrawler } from './backend/src/services/metacritic-crawler.js';

async function testAlanWake() {
  console.log('🧪 Testando busca do Alan Wake Remastered...');
  
  const crawler = new MetacriticCrawler();
  
  try {
    const score = await crawler.searchMetacriticScore('Alan Wake Remastered');
    console.log('✅ Resultado para Alan Wake Remastered:', score);
    
    // Testar variações do nome
    console.log('\n🔄 Testando variações do nome...');
    
    const variations = [
      'Alan Wake',
      'alan wake remastered',
      'Alan Wake Remastered PlayStation',
      'Alan Wake Remastered PS5'
    ];
    
    for (const variation of variations) {
      console.log(`\n🔍 Testando: "${variation}"`);
      const result = await crawler.searchMetacriticScore(variation);
      console.log(`   Resultado: ${result}`);
      
      // Pequeno delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testAlanWake().catch(console.error); 