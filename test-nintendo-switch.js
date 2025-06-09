import { MetacriticCrawler } from './backend/src/services/metacritic-crawler.js';

async function testNintendoSwitch() {
  console.log('🎮 TESTE: Nintendo Switch no Metacritic');
  console.log('='.repeat(50));
  
  const crawler = new MetacriticCrawler();
  
  // Jogos que sabemos que existem no Nintendo Switch
  const switchGames = [
    'Gone Home',           // Confirmado na base como Nintendo Switch
    'Overcooked',          // Confirmado na base como Nintendo Switch  
    'The Legend of Zelda', // Jogo icônico do Switch
    'Super Mario Odyssey'  // Outro jogo icônico do Switch
  ];
  
  for (const gameName of switchGames) {
    console.log(`\n📋 Testando: "${gameName}"`);
    
    try {
      const score = await crawler.searchMetacriticScore(gameName);
      
      if (score !== null) {
        console.log(`✅ SUCESSO! "${gameName}" → Nota: ${score}`);
      } else {
        console.log(`❌ FALHOU: "${gameName}" → Nota não encontrada`);
      }
      
      // Aguardar 2 segundos entre testes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`❌ ERRO: "${gameName}" → ${error.message}`);
    }
  }
  
  console.log('\n='.repeat(50));
  console.log('🎯 Teste concluído!');
}

testNintendoSwitch().catch(console.error); 