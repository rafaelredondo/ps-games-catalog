import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Determinar o caminho correto do banco independente de onde é executado
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Procurar o db.json em possíveis localizações
function getDBPath() {
  // Se executado do backend/ → db.json
  const backendPath = join(process.cwd(), 'db.json');
  // Se executado da raiz → backend/db.json
  const rootPath = join(process.cwd(), 'backend', 'db.json');
  // Caminho relativo ao arquivo atual
  const relativePath = join(__dirname, '..', '..', 'db.json');
  
  // Retornar o primeiro que existir
  try {
    require('fs').accessSync(backendPath);
    return backendPath;
  } catch {
    try {
      require('fs').accessSync(rootPath);
      return rootPath;
    } catch {
      return relativePath; // fallback
    }
  }
}

const DB_FILE = getDBPath();

// Função para ler o banco de dados
async function readDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Se o arquivo não existir, retorna a estrutura padrão
    return { games: [] };
  }
}

// Função para escrever no banco de dados
async function writeDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// Inicializa o banco de dados
async function initDatabase() {
  const data = await readDB();
  if (!data.games) {
    data.games = [];
    await writeDB(data);
  }
}

// Funções auxiliares para manipulação do banco
const gamesDb = {
  async getAll() {
    const data = await readDB();
    return data.games;
  },

  async getById(id) {
    const data = await readDB();
    return data.games.find(game => game.id === id);
  },

  async create(game) {
    const data = await readDB();
    data.games.push(game);
    await writeDB(data);
    return game;
  },

  async update(id, updatedGame) {
    const data = await readDB();
    const index = data.games.findIndex(game => game.id === id);
    if (index !== -1) {
      data.games[index] = { ...data.games[index], ...updatedGame };
      await writeDB(data);
      return data.games[index];
    }
    return null;
  },

  async delete(id) {
    const data = await readDB();
    const index = data.games.findIndex(game => game.id === id);
    if (index !== -1) {
      const deletedGame = data.games[index];
      data.games.splice(index, 1);
      await writeDB(data);
      return deletedGame;
    }
    return null;
  },

  async clearAll() {
    await writeDB({ games: [] });
    return { message: 'Banco de dados limpo com sucesso' };
  }
};

export {
  initDatabase,
  gamesDb
}; 