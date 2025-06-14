# Scripts do PS Games Catalog

Este diretório contém scripts utilitários para o projeto.

## 📁 Scripts Disponíveis

### 🚀 Desenvolvimento

#### `start-dev.sh`
**NOVO!** Script completo para iniciar ambiente de desenvolvimento.

```bash
# Iniciar backend e frontend com logs em arquivos
./scripts/start-dev.sh
```

**Características:**
- ✅ Verifica e libera portas ocupadas automaticamente
- 🔄 Mata processos antigos se necessário
- 📋 Instala dependências se não existirem
- 📝 Logs salvos em arquivos separados (backend.log e frontend.log)
- 🛡️ Cleanup automático ao sair (Ctrl+C)
- ⏳ Validação de inicialização dos serviços

#### `start-dev-interactive.sh`
**NOVO!** Versão interativa para ver logs na tela.

```bash
# Iniciar com logs na tela
./scripts/start-dev-interactive.sh
```

**Características:**
- ✅ Mesmo controle de portas que a versão completa
- 👀 Logs do frontend visíveis na tela
- 🏃‍♂️ Backend roda em background
- 🧹 Cleanup automático dos processos

**Portas utilizadas:**
- Backend: `3000`
- Frontend: `5173` (Vite)

### 🚀 Deploy Scripts

#### `deploy-direct.sh`
Script para deploy direto no servidor AWS.

```bash
./scripts/deploy-direct.sh
```

#### `github-deploy.sh`
Script para deploy via GitHub Actions.

```bash
./scripts/github-deploy.sh
```

### 🕷️ Metacritic Crawler

#### `metacritic-crawler.js`
**NOVO!** Script para buscar automaticamente notas do Metacritic para jogos sem avaliação.

```bash
# Ver ajuda completa
node scripts/metacritic-crawler.js --help

# Simular processo (recomendado primeiro)
node scripts/metacritic-crawler.js --dry-run

# Processar até 5 jogos
node scripts/metacritic-crawler.js --max-games 5

# Processo padrão (10 jogos)
node scripts/metacritic-crawler.js
```

**Características:**
- ✅ Busca automática no Metacritic
- 🔍 Modo dry-run para testes
- ⏰ Rate limiting respeitoso (2s entre requisições)
- 📊 Relatórios detalhados
- 🛡️ Tratamento robusto de erros

## 🔧 Configuração

### Permissões
Torne os scripts executáveis:

```bash
chmod +x scripts/*.sh
chmod +x scripts/*.js
```

### Dependências
Para o crawler do Metacritic:

```bash
cd backend
npm install axios cheerio
```

## 📋 Uso Recomendado

### Para Deploy
1. Teste localmente primeiro
2. Use `github-deploy.sh` para deploy automático
3. Use `deploy-direct.sh` apenas para emergências

### Para Crawler
1. **Sempre** teste com `--dry-run` primeiro
2. Execute em pequenos lotes (`--max-games 5-10`)
3. Monitore os logs para identificar problemas
4. Configure cron job para execução automática

## 📅 Automação

### Cron Job para Crawler
```bash
# Editar crontab
crontab -e

# Executar toda sexta às 02:00
0 2 * * 5 cd /path/to/project && node scripts/metacritic-crawler.js --max-games 10 >> logs/crawler.log 2>&1
```

## 🐛 Troubleshooting

### Problemas Comuns

#### Script não executa
```bash
# Verificar permissões
ls -la scripts/

# Dar permissão se necessário
chmod +x scripts/script-name
```

#### Crawler falha
```bash
# Testar conectividade
curl -I https://www.metacritic.com

# Verificar dependências
cd backend && npm list axios cheerio
```

## 📚 Documentação Adicional

- **Crawler**: [docs/metacritic-crawler.md](../docs/metacritic-crawler.md)
- **Deploy**: [docs/deployment/](../docs/deployment/)

---

*Scripts desenvolvidos seguindo boas práticas de DevOps e automação.* 