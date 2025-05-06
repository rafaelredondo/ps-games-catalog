# PS Games Catalog

Um catálogo de jogos para PlayStation e Nintendo Switch, com integração com a RAWG Video Games Database API.

## 🎮 Funcionalidades

### Principais
- Catálogo de jogos para PS4, PS5 e Nintendo Switch
- Busca automática de informações de jogos via RAWG API
- Autocomplete ao adicionar novos jogos
- Filtro por plataforma, gênero, publisher e metacritic
- Detalhes completos dos jogos
- Suporte para jogos físicos e digitais
- Sistema de prioridade para jogos

### Interface e Visualização
- Visualização em cards ou tabela (salvando a preferência no localStorage)
- Tabela com ordenação por coluna (nome, plataforma, gênero, ano e metacritic)
- Interface responsiva para dispositivos móveis e desktop
- Tema escuro moderno com cores PlayStation

### Game Wrapped
- Visualização estilo "Spotify Wrapped" para sua coleção de jogos
- Estatísticas de jogos mais longos e mais curtos
- Top jogos por pontuação Metacritic
- Gêneros e publishers favoritos
- Distribuição de jogos por plataforma
- Comparativo de jogos físicos vs digitais

### Importação e Exportação
- Importação de jogos em massa via CSV
- Correspondência automática com a base de dados RAWG
- Controle granular sobre o processo de importação

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
- Papa Parse (processamento CSV)

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

### Catálogo Principal
1. Acesse `http://localhost:5173`
2. Use o botão "Adicionar Jogo" para incluir novos jogos
3. Digite o nome do jogo para buscar automaticamente informações
4. Selecione a plataforma e o tipo de mídia
5. Opcionalmente, defina uma prioridade (1-10)
6. Salve o jogo

### Visualização e Ordenação
- Alterne entre visualização em cards ou tabela usando os botões no topo
- Na visualização em tabela, clique nos cabeçalhos para ordenar os jogos
- Use os filtros para refinar sua pesquisa

### Game Wrapped
1. Acesse a seção "Game Wrapped" para ver estatísticas da sua coleção
2. Explore os diferentes cards para insights sobre seus hábitos de jogo

### Importação CSV
1. Acesse a página de importação CSV
2. Faça upload de um arquivo CSV com seus jogos
3. Mapeie as colunas do CSV para os campos do sistema
4. Inicie a importação e acompanhe o progresso

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
