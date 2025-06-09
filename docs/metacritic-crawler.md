# Metacritic Crawler

Sistema automatizado para buscar e atualizar notas do Metacritic para jogos que não possuem avaliação no catálogo.

## 🎯 Funcionalidades

- ✅ Identifica jogos sem nota do Metacritic
- 🕷️ Faz busca automatizada no site do Metacritic
- 📝 Atualiza notas no banco de dados
- 🔍 Modo de simulação (dry-run) para testes
- 🌐 Interface via linha de comando
- 🚀 API REST para integração web
- ⏰ Rate limiting respeitoso (2s entre requisições)

## 🛠️ Instalação e Configuração

### Dependências

O sistema usa as seguintes bibliotecas:

```bash
npm install axios cheerio
```

### Estrutura de Arquivos

```
backend/
├── src/
│   ├── services/
│   │   └── metacritic-crawler.js    # Serviço principal
│   └── routes/
│       └── metacritic.js            # Endpoints da API
├── tests/
│   └── metacritic-crawler.test.js   # Testes TDD
scripts/
└── metacritic-crawler.js            # Script de linha de comando
```

## 🖥️ Uso via Linha de Comando

### Comandos Básicos

```bash
# Ver ajuda
node scripts/metacritic-crawler.js --help

# Simular processo (não salva no banco)
node scripts/metacritic-crawler.js --dry-run

# Processar até 5 jogos
node scripts/metacritic-crawler.js --max-games 5

# Processo padrão (até 10 jogos)
node scripts/metacritic-crawler.js
```

### Opções Disponíveis

| Opção | Descrição | Padrão |
|-------|-----------|--------|
| `--max-games <número>` | Máximo de jogos para processar | 10 |
| `--dry-run` | Apenas simula, não salva no banco | false |
| `--help` | Mostra ajuda | - |

### Exemplo de Saída

```
🕷️ Metacritic Crawler - PS Games Catalog

📊 Configuração:
   Máximo de jogos: 5
   Dry Run: Não

🔍 Verificando jogos sem nota do Metacritic...
📋 Encontrados 8 jogos sem nota:
   1. The Last of Us Part II
   2. Bloodborne
   3. Horizon Zero Dawn
   4. Uncharted 4
   5. God of War (2018)

🎮 Processando jogo 1/5: "The Last of Us Part II"
🔍 Buscando "The Last of Us Part II" no Metacritic...
✅ Nota encontrada: 93
📝 Nota 93 salva no banco para o jogo ID 42
✅ "The Last of Us Part II" atualizado com nota 93

==================================================
📊 RESUMO FINAL
==================================================
✅ Jogos processados: 5
🔄 Jogos atualizados: 4
❌ Jogos falharam: 1
📈 Taxa de sucesso: 80.0%
```

## 🌐 API REST

### Endpoints Disponíveis

#### 1. Verificar Status
```http
GET /api/metacritic/status
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "gamesWithoutScores": 8,
    "games": [
      { "id": 42, "name": "The Last of Us Part II" },
      { "id": 43, "name": "Bloodborne" }
    ]
  }
}
```

#### 2. Executar Crawler
```http
POST /api/metacritic/crawl
Content-Type: application/json

{
  "maxGames": 5,
  "dryRun": false
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "processed": 5,
    "updated": 4,
    "failed": 1,
    "errors": ["Nota não encontrada para \"Unknown Game\""],
    "successRate": "80.0"
  }
}
```

#### 3. Buscar Jogo Específico
```http
POST /api/metacritic/search/The Last of Us
Content-Type: application/json

{
  "updateDatabase": true
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "gameName": "The Last of Us",
    "metacriticScore": 95,
    "found": true,
    "updated": true,
    "gameId": 42
  }
}
```

## 🧪 Testes

O sistema foi desenvolvido seguindo TDD (Test-Driven Development).

### Executar Testes

```bash
cd backend
npm test metacritic-crawler.test.js
```

### Cobertura de Testes

- ✅ Busca de jogos sem nota
- ✅ Pesquisa no Metacritic
- ✅ Atualização no banco de dados
- ✅ Tratamento de erros
- ✅ Processo completo end-to-end

## ⚠️ Limitações e Considerações

### Rate Limiting
- **Delay**: 2 segundos entre requisições
- **Motivo**: Respeitar os servidores do Metacritic
- **Configurável**: Pode ser ajustado no código

### Proteções Anti-Bot
- **User-Agent**: Simula browser real
- **Headers**: Headers completos para parecer navegador
- **Falhas**: Sites podem bloquear após muitas requisições

### Precisão da Busca
- **Correspondência**: Busca por nome exato do jogo
- **Variações**: Nomes diferentes podem não encontrar resultado
- **Múltiplas versões**: Pode retornar versão diferente da desejada

## 🔧 Configuração Avançada

### Customizar User-Agent

```javascript
// Em metacritic-crawler.js
constructor() {
  this.userAgent = 'Seu-User-Agent-Customizado';
  this.delay = 3000; // 3 segundos
}
```

### Ajustar Padrões de Busca

```javascript
// Adicionar novos padrões regex para extrair scores
const scorePatterns = [
  /<span[^>]*class="[^"]*metascore[^"]*"[^>]*>(\d+)<\/span>/i,
  // Adicionar mais padrões aqui
];
```

## 📅 Automação com Cron

### Configurar Execução Periódica

```bash
# Editar crontab
crontab -e

# Executar toda sexta às 02:00 (máximo 10 jogos)
0 2 * * 5 cd /path/to/project && node scripts/metacritic-crawler.js --max-games 10 >> logs/crawler.log 2>&1

# Executar diariamente às 03:00 (máximo 3 jogos)
0 3 * * * cd /path/to/project && node scripts/metacritic-crawler.js --max-games 3 >> logs/crawler.log 2>&1
```

### Logs e Monitoramento

```bash
# Criar diretório de logs
mkdir logs

# Monitorar execução
tail -f logs/crawler.log
```

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão
```
🌐 Erro de conexão ao buscar "Game Name": ENOTFOUND
```
**Solução**: Verificar conexão com internet

#### 2. Rate Limit (429)
```
⏰ Rate limit atingido para "Game Name" (429)
```
**Solução**: Aguardar e executar novamente mais tarde

#### 3. Acesso Negado (403)
```
🚫 Acesso negado ao Metacritic para "Game Name" (403)
```
**Solução**: Site pode estar bloqueando. Tentar mais tarde ou ajustar User-Agent

#### 4. Nota Não Encontrada
```
❌ Jogo "Game Name" não encontrado no Metacritic
```
**Possíveis causas**:
- Nome do jogo diferente no Metacritic
- Jogo muito antigo ou obscuro
- Erro temporário no site

### Debug Mode

Para mais detalhes durante execução:

```javascript
// Adicionar console.log extra no código
console.log('HTML retornado:', html.substring(0, 500));
```

## 📈 Métricas e Relatórios

### Taxa de Sucesso Esperada
- **Jogos populares**: 80-90%
- **Jogos antigos**: 60-70%
- **Jogos independentes**: 40-60%

### Monitoramento de Performance
- Tempo médio por jogo: 2-4 segundos
- Taxa de erro aceitável: < 20%
- Bloqueios esperados: < 5%

## 🔒 Segurança e Ética

### Boas Práticas
- ✅ Rate limiting respeitoso
- ✅ Headers realistas
- ✅ Timeout apropriado
- ✅ Tratamento de erros
- ✅ Logs detalhados

### Termos de Uso
- Respeitar robots.txt do Metacritic
- Não sobrecarregar os servidores
- Usar apenas para uso pessoal
- Parar se solicitado pelo site

## 📞 Suporte

Para problemas ou sugestões:
1. Verificar logs de erro
2. Conferir conectividade
3. Testar com `--dry-run` primeiro
4. Verificar se há atualizações no site do Metacritic

---

*Sistema desenvolvido seguindo princípios de TDD, Clean Code e boas práticas de web scraping.* 