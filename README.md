# PS Games Catalog - Backend

API REST para gerenciamento de catálogo de jogos PlayStation (PS4 e PS5).

## Funcionalidades

- Listar, cadastrar, editar e remover jogos
- Suporte a múltiplas plataformas por jogo (PS4 e PS5)
- Suporte a diferentes tipos de mídia (físico e digital)
- Validação para evitar duplicatas do mesmo jogo na mesma plataforma e tipo de mídia

## Tecnologias

- Node.js
- Express
- JSON File System (para armazenamento)

## Estrutura de Dados

```json
{
  "id": "string",
  "name": "string",
  "platforms": [
    {
      "platform": "PS4" | "PS5",
      "mediaType": "physical" | "digital",
      "coverImage": "string",
      "rating": number,
      "playTime": number,
      "completed": boolean,
      "notes": "string"
    }
  ],
  "createdAt": "string",
  "updatedAt": "string"
}
```

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor em modo desenvolvimento:
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## Endpoints

### Jogos

- `GET /api/games` - Lista todos os jogos
- `GET /api/games/:id` - Busca um jogo específico
- `POST /api/games` - Cria um novo jogo
- `PUT /api/games/:id` - Atualiza um jogo
- `DELETE /api/games/:id` - Remove um jogo
- `DELETE /api/games/clear` - Limpa todo o banco de dados

### Plataformas

- `GET /api/games/platform/:platform` - Lista jogos por plataforma (PS4 ou PS5)

## Exemplo de Uso

### Criar um novo jogo

```bash
curl -X POST http://localhost:3000/api/games \
-H "Content-Type: application/json" \
-d '{
  "name": "Hogwarts Legacy",
  "platforms": [
    {
      "platform": "PS5",
      "mediaType": "physical",
      "coverImage": "https://example.com/hogwarts-ps5.jpg",
      "rating": 9,
      "playTime": 45,
      "completed": true,
      "notes": "Versão física com melhor performance"
    }
  ]
}'
```

## Regras de Negócio

1. Não é permitido ter duplicatas do mesmo jogo na mesma plataforma e tipo de mídia
2. Um jogo pode existir em múltiplas plataformas (PS4 e PS5)
3. Um jogo pode existir em diferentes tipos de mídia (físico e digital) na mesma plataforma 