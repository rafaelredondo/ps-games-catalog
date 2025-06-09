# 🕷️ Guia do Crawler Metacritic em Produção

Este guia explica como executar o crawler do Metacritic em produção para atualizar as notas dos jogos.

## 📊 Status Atual

Antes de executar o crawler, você pode verificar quantos jogos precisam de notas:

- **Total de jogos no banco**: ~700+
- **Jogos sem nota Metacritic**: 75
- **Taxa de sucesso esperada**: 70%

## 🚀 Métodos de Execução

### **1. Via API REST (Recomendado) 🌐**

O método mais seguro para executar remotamente:

#### Configuração Inicial
```bash
# 1. Criar arquivo de configuração
echo "API_URL=https://gamescatalog.net" > .env.crawler
echo "API_USER=admin" >> .env.crawler
echo "API_PASS=sua_senha_aqui" >> .env.crawler
```

#### Execução
```bash
# Verificar status
curl -X GET https://gamescatalog.net/api/metacritic/status \
     -H "Authorization: Basic $(echo -n 'admin:senha' | base64)"

# Executar crawler (modo seguro)
./scripts/api-crawler.sh --max-games 5

# Executar com mais jogos
./scripts/api-crawler.sh --max-games 20

# Apenas testar (não altera banco)
./scripts/api-crawler.sh --dry-run
```

### **2. Via SSH no Servidor 🖥️**

Para execução direta no servidor:

```bash
# 1. Conectar no servidor
ssh ubuntu@gamescatalog.net

# 2. Navegar para o projeto
cd ps-games-catalog

# 3. Executar com backup automático
./scripts/production-crawler.sh --backup --max-games 10

# 4. Apenas testar
./scripts/production-crawler.sh --dry-run

# 5. Processar todos os jogos (CUIDADO!)
./scripts/production-crawler.sh --backup --max-games 75
```

## ⚠️ Considerações de Segurança

### **Rate Limiting**
- **Delay entre requests**: 2 segundos
- **Máximo recomendado**: 20 jogos por execução
- **Respeito ao Metacritic**: Não sobrecarregar seus servidores

### **Backup Obrigatório**
```bash
# Sempre fazer backup antes de execuções grandes
./scripts/production-crawler.sh --backup --max-games 20
```

### **Monitoramento**
- Logs salvos em `logs/crawler_TIMESTAMP.log`
- Acompanhar taxa de sucesso
- Verificar erros específicos

## 📈 Estratégia Recomendada

### **Fase 1: Teste Pequeno**
```bash
# 1. Testar com poucos jogos
./scripts/api-crawler.sh --dry-run --max-games 3

# 2. Executar real com poucos jogos
./scripts/api-crawler.sh --max-games 5
```

### **Fase 2: Execução Incremental**
```bash
# Processar em lotes de 10-20 jogos
./scripts/api-crawler.sh --max-games 20
# Aguardar alguns minutos
./scripts/api-crawler.sh --max-games 20
# Repetir até completar todos
```

### **Fase 3: Verificação**
```bash
# Verificar quantos restam
curl -X GET https://gamescatalog.net/api/metacritic/status \
     -H "Authorization: Basic $(echo -n 'admin:senha' | base64)"
```

## 🎯 Endpoints da API

### **GET /api/metacritic/status**
Verifica quantos jogos precisam de notas:
```json
{
  "success": true,
  "data": {
    "gamesWithoutScores": 75,
    "games": [...]
  }
}
```

### **POST /api/metacritic/crawl**
Executa o crawler:
```json
{
  "maxGames": 10,
  "dryRun": false
}
```

Resposta:
```json
{
  "success": true,
  "data": {
    "processed": 10,
    "updated": 7,
    "failed": 3,
    "successRate": "70.0"
  }
}
```

### **POST /api/metacritic/search/:gameName**
Busca nota específica:
```bash
curl -X POST https://gamescatalog.net/api/metacritic/search/Alan%20Wake%20Remastered \
     -H "Content-Type: application/json" \
     -H "Authorization: Basic $(echo -n 'admin:senha' | base64)" \
     -d '{"updateDatabase": true}'
```

## 🔍 Monitoramento e Logs

### **Verificar Logs**
```bash
# No servidor
tail -f logs/crawler_TIMESTAMP.log

# Ver logs recentes
ls -la logs/crawler_*.log | tail -5
```

### **Verificar Resultados**
```bash
# Contar jogos com nota
grep -c '"metacriticScore":[0-9]' backend/db.json

# Ver jogos atualizados recentemente
grep -A5 -B5 '"metacriticScore":' backend/db.json | head -20
```

## 🆘 Solução de Problemas

### **Erro de Conexão**
```bash
# Verificar se a API está rodando
curl -I https://gamescatalog.net/api/health

# Verificar logs do backend
pm2 logs backend
```

### **Taxa de Sucesso Baixa**
- Normal: 70% de sucesso esperado
- Problemas: nomes diferentes entre banco e Metacritic
- Solução: buscar manualmente casos específicos

### **Restaurar Backup**
```bash
# Se algo der errado
cp backend/db.backup.TIMESTAMP.json backend/db.json
pm2 restart backend
```

## 📊 Resultados Esperados

### **Por Plataforma**
- **PlayStation**: 65-75% sucesso
- **Nintendo Switch**: 90-100% sucesso  
- **PC**: 60-70% sucesso

### **Jogos Comuns com Sucesso**
- Títulos populares (Zelda, Mario, etc.)
- Lançamentos recentes
- Grandes desenvolvedoras

### **Possíveis Falhas**
- Jogos independentes/pequenos
- Nomes muito diferentes
- Edições específicas (GOTY, etc.)

## 🔄 Manutenção Regular

### **Execução Mensal**
```bash
# Script para execução regular
./scripts/api-crawler.sh --max-games 10
```

### **Novos Jogos**
Quando adicionar novos jogos, execute o crawler para buscar suas notas automaticamente.

### **Atualizações do Metacritic**
Se o Metacritic mudar a estrutura das páginas, pode ser necessário atualizar os regex patterns no código.

---

## 🚀 Comandos Rápidos

```bash
# Status
curl -X GET https://gamescatalog.net/api/metacritic/status -H "Authorization: Basic ..."

# Executar 10 jogos
./scripts/api-crawler.sh --max-games 10

# Backup + 20 jogos
./scripts/production-crawler.sh --backup --max-games 20

# Apenas teste
./scripts/api-crawler.sh --dry-run
```

**⚡ Lembre-se**: Sempre teste primeiro, faça backup e execute em lotes pequenos! 