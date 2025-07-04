# 🎮 PS Games Catalog

Catálogo completo de jogos do PlayStation com deploy automático via GitHub Actions.

## 🚀 Deploy Automático Configurado!!!

Este projeto agora possui **deploy automático** configurado:

### ⚡ Fluxo de Deploy:
1. **Desenvolver** → Fazer mudanças localmente
2. **Commit/Push** → `git push origin main`  
3. **Deploy Automático** → GitHub Actions detecta e deploya
4. **Verificação** → Testes automáticos de saúde
5. **Pronto!** → App atualizada em https://gamescatalog.net

### 🎯 Features do Deploy:
- ✅ **Detecção Inteligente**: Só atualiza o que mudou (frontend/backend)
- ✅ **Backup Automático**: Backup antes e após deploy
- ✅ **Health Checks**: Verifica se tudo está funcionando
- ✅ **Rollback Seguro**: Mantém backup para restauração
- ✅ **Logs Completos**: Acompanhe o deploy no GitHub Actions

---

## 🏗️ **Arquitetura**

### **Frontend:**
- ⚛️ React + TypeScript
- 🎨 Tailwind CSS
- 📱 Responsive Design
- 🚀 Build otimizado

### **Backend:**
- 🟢 Node.js + Express
- 📊 JSON Database
- 🔒 CORS configurado
- ⚡ PM2 Process Manager
- 🕷️ **Metacritic Crawler** (Novo!)

### **Infraestrutura:**
- ☁️ AWS EC2 (Free Tier)
- 🌐 Nginx (Reverse Proxy)
- 🔒 SSL/TLS (Let's Encrypt)
- 💾 S3 Backup (Redundância)

---

## 📁 **Estrutura do Projeto**

```
ps-games-catalog/
├── frontend/           # React App
├── backend/           # Node.js API
├── deployment/        # Scripts de deploy
├── .github/workflows/ # GitHub Actions
└── docs/             # Documentação
```

---

## 🌐 **Links Úteis**

- **🎮 Aplicação**: https://gamescatalog.net
- **📊 GitHub Actions**: [Ver deploys automáticos](../../actions)
- **📱 Status da App**: Online 24/7
- **🕷️ Metacritic Crawler**: [Documentação completa](docs/metacritic-crawler.md)

## 🆕 **Novidades**

### 🕷️ Metacritic Crawler
Sistema automatizado para buscar notas do Metacritic para jogos sem avaliação:

```bash
# Comandos npm (recomendado)
npm run crawler:help    # Ver ajuda completa
npm run crawler:dry     # Simular sem salvar no banco
npm run crawler         # Executar crawler (10 jogos)

# Ou diretamente
node scripts/metacritic-crawler.js --max-games 5
```

### 🎮 HowLongToBeat Crawler (Novo!)
Sistema para buscar tempos de jogo do HowLongToBeat para jogos sem playTime:

```bash
# Buscar tempos de jogo automaticamente
node scripts/howlongtobeat-crawler.js --max-games 5

# Modo simulação
node scripts/howlongtobeat-crawler.js --dry-run

# Ver ajuda completa
node scripts/howlongtobeat-crawler.js --help
```

**Features dos Crawlers:**
- ✅ Busca automática de notas no Metacritic
- ✅ Busca automática de tempos de jogo no HowLongToBeat
- 🔍 Modo de simulação (dry-run)
- 🌐 API REST para integração web
- ⏰ Rate limiting respeitoso
- 🧪 Desenvolvido com TDD
- 📊 Múltiplas estratégias de busca

---

**🎉 Desenvolvido com deploy automático e infraestrutura em nuvem!**
# Deploy trigger Thu Jun  5 20:00:22 -03 2025
# SSH e deploy funcionando com novo IP EC2: 54.84.52.202

## 🚀 Deploy Status

Último deploy: 2025-06-05 - Fixing frontend serving issue
