# 🔧 Troubleshooting GitHub Actions

## 🚨 Problema: Deploys Enfileirados (Queued)

### Possíveis Causas:
1. **Limite de concorrência** - GitHub Actions gratuito tem limite de workflows simultâneos
2. **Múltiplos commits** - Vários deploys acumulados na fila
3. **Runner indisponível** - Falta de runners disponíveis
4. **Workflow travado** - Deploy anterior não finalizou

### ✅ Soluções Implementadas:

#### 1. Concorrência Configurada
```yaml
concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: true
```
- Cancela deploys anteriores automaticamente
- Evita acúmulo na fila

#### 2. Deploy Manual de Emergência
```bash
# Se Actions estiver travado, use:
./deployment/manual-deploy.sh
```

#### 3. Monitoramento via GitHub CLI
```bash
# Instalar GitHub CLI
brew install gh
gh auth login

# Verificar status
./scripts/check-actions.sh
```

## 🛠️ Como Resolver:

### Opção 1: Cancelar Deploys Pendentes
```bash
# Listar workflows
gh run list

# Cancelar run específico
gh run cancel <run-id>

# Cancelar todos pendentes
gh run list --status=queued --json databaseId --jq '.[].databaseId' | xargs -I {} gh run cancel {}
```

### Opção 2: Deploy Manual
```bash
# Execute deploy direto no servidor
./deployment/manual-deploy.sh
```

### Opção 3: Forçar Novo Trigger
```bash
# Commit vazio para forçar novo deploy
git commit --allow-empty -m "force deploy trigger"
git push origin main
```

## 📊 Monitoramento

### Verificar Status
- **GitHub UI**: https://github.com/seu-usuario/ps-games-catalog/actions
- **CLI**: `gh run list --workflow=deploy.yml`
- **Script**: `./scripts/check-actions.sh`

### Logs em Tempo Real
```bash
gh run watch
```

## 🚀 Prevenção

1. **Evite commits em sequência rápida**
2. **Use commits mais significativos**
3. **Monitore a fila antes de fazer push**
4. **Tenha sempre o deploy manual como backup**

## 📞 Alternativas de Deploy

### 1. Deploy Manual (Recomendado)
```bash
./deployment/manual-deploy.sh
```

### 2. Deploy via SSH Direto
```bash
ssh -i ~/.ssh/ps-games-key.pem ec2-user@gamescatalog.net
cd ps-games-catalog
git pull && ./deployment/deploy-ci.sh
```

### 3. Webhook Deploy (Futuro)
- Configurar webhook direto no servidor
- Deploy independente do GitHub Actions 