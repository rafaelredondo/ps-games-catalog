import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDatabase } from './db/database.js';
import gamesRouter from './routes/games.js';
import { basicAuth } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Aplicar autenticação a todas as rotas da API
app.use('/api', basicAuth);

// Rotas
app.use('/api/games', gamesRouter);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API de Catálogo de Jogos PlayStation' });
});

// Inicializa o banco de dados e inicia o servidor
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer(); 