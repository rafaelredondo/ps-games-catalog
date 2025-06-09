import fs from 'fs';

// Carregar banco de dados
const db = JSON.parse(fs.readFileSync('./backend/db.json', 'utf8'));

// Filtrar jogos sem status
const gamesWithoutStatus = db.games.filter(game => !game.status || game.status === '');

console.log(`📊 Encontrados ${gamesWithoutStatus.length} jogos sem status de ${db.games.length} total`);

// Criar relatório detalhado
const report = {
  timestamp: new Date().toISOString(),
  totalGames: db.games.length,
  gamesWithoutStatus: gamesWithoutStatus.length,
  percentage: ((gamesWithoutStatus.length / db.games.length) * 100).toFixed(1),
  games: gamesWithoutStatus.map(game => ({
    id: game.id,
    name: game.name,
    platforms: game.platforms,
    released: game.released,
    metacritic: game.metacritic,
    playTime: game.playTime
  }))
};

// Salvar relatório
fs.writeFileSync('games-without-status-report.json', JSON.stringify(report, null, 2));

console.log('📝 Relatório salvo em: games-without-status-report.json');
console.log();
console.log('📋 Lista resumida:');
console.log('==================');

gamesWithoutStatus.forEach((game, index) => {
  const platforms = Array.isArray(game.platforms) ? game.platforms.join(', ') : game.platforms || 'N/A';
  const year = game.released ? new Date(game.released).getFullYear() : 'N/A';
  console.log(`${(index + 1).toString().padStart(3, ' ')}. ${game.name} [${platforms}] (${year})`);
}); 