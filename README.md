# PS Games Catalog

Um catálogo de jogos para PlayStation e Nintendo Switch, com integração com a RAWG Video Games Database API.

## 🎮 Funcionalidades

- Catálogo de jogos para PS4, PS5 e Nintendo Switch
- Busca automática de informações de jogos via RAWG API
- Autocomplete ao adicionar novos jogos
- Filtro por plataforma
- Detalhes completos dos jogos
- Suporte para jogos físicos e digitais
- Sistema de prioridade para jogos

## 🛠️ Tecnologias

### Backend
- Node.js
- Express
- JSON Server (banco de dados)

### Frontend
- React
- Vite
- Material-UI
- Axios
- React Router

## 📦 Instalação

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuração

1. Clone o repositório
2. Instale as dependências do backend e frontend
3. Inicie o backend (porta 3000)
4. Inicie o frontend (porta 5173)

## 🚀 Uso

1. Acesse `http://localhost:5173`
2. Use o botão "Adicionar Jogo" para incluir novos jogos
3. Digite o nome do jogo para buscar automaticamente informações
4. Selecione a plataforma e o tipo de mídia
5. Opcionalmente, defina uma prioridade (1-10)
6. Salve o jogo

## 📝 Estrutura do Projeto

```
ps-games-catalog/
├── backend/           # API REST
│   ├── src/
│   │   ├── models/    # Modelos de dados
│   │   ├── routes/    # Rotas da API
│   │   └── db/        # Banco de dados
│   └── package.json
│
└── frontend/          # Interface React
    ├── src/
    │   ├── components/    # Componentes React
    │   ├── pages/         # Páginas da aplicação
    │   ├── services/      # Serviços e APIs
    │   └── contexts/      # Contextos React
    └── package.json
```

## 🔄 Branches

- `main`: Código do backend
- `frontend`: Código do frontend

## 📄 Licença

Este projeto está sob a licença MIT. 