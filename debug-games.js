import { gamesDb } from './backend/src/db/database.js';

async function checkGames() {
  const games = await gamesDb.getAll();
  console.log('📊 Total de jogos:', games.length);
  
  // Jogos sem nota do Metacritic
  const gamesWithoutScores = games.filter(game => 
    game.metacritic === null || 
    game.metacritic === undefined || 
    game.metacritic === 0 ||
    game.metacritic === ''
  );
  
  console.log('🔍 Jogos sem nota do Metacritic:', gamesWithoutScores.length);
  
  // Mostrar alguns exemplos
  console.log('\n📋 Primeiros 10 jogos sem nota:');
  gamesWithoutScores.slice(0, 10).forEach((game, index) => {
    console.log(`  ${index + 1}. ${game.name} (metacritic: ${game.metacritic})`);
  });
  
  // Verificar Alan Wake especificamente
  const alanWakeGames = games.filter(game => 
    game.name.toLowerCase().includes('alan wake')
  );
  
  console.log(`\n🎮 Jogos do Alan Wake encontrados: ${alanWakeGames.length}`);
  alanWakeGames.forEach(game => {
    console.log(`   Nome: ${game.name}`);
    console.log(`   Metacritic: ${game.metacritic}`);
    console.log(`   Tipo: ${typeof game.metacritic}`);
    console.log(`   ---`);
  });
  
  // Verificar outros valores possíveis
  const metacriticValues = new Set();
  games.forEach(game => {
    metacriticValues.add(game.metacritic);
  });
  
  console.log('\n📈 Valores únicos de metacritic encontrados:');
  [...metacriticValues].sort().forEach(value => {
    const count = games.filter(g => g.metacritic === value).length;
    console.log(`   ${value} (${typeof value}) - ${count} jogos`);
  });
}

checkGames().catch(console.error); 