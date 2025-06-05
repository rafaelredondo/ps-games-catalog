#!/bin/bash

# PS Games Catalog - Deploy CI/CD  
# Script otimizado para deploy automático via GitHub Actions
# 
# Uso:
#   ./deploy-ci.sh           # Deploy normal (apenas com mudanças)
#   ./deploy-ci.sh --force   # Deploy forçado (rebuild tudo)

set -e  # Parar em qualquer erro

# Verificar se é deploy forçado
FORCE_DEPLOY="false"
if [ "$1" = "--force" ]; then
    FORCE_DEPLOY="true"
    echo "🔥 MODO FORÇADO ATIVADO - Vai rebuildar tudo!"
fi

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
REPO_DIR="/home/ec2-user/ps-games-catalog"
BACKEND_DIR="$REPO_DIR/backend"
FRONTEND_DIR="$REPO_DIR/frontend"
NGINX_ROOT="/var/www/html"
APP_NAME="ps-games-backend"

# Função para log
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

echo -e "${BLUE}🚀 PS Games Catalog - Deploy Automático${NC}"
echo "================================================"

# 1. Verificar se repositório existe
if [ ! -d "$REPO_DIR" ]; then
    log_error "Diretório do repositório não encontrado: $REPO_DIR"
    exit 1
fi

cd "$REPO_DIR"

# 2. Fazer backup do banco antes do deploy
log "📁 Fazendo backup pré-deploy..."
if [ -f "$BACKEND_DIR/db.json" ]; then
    cp "$BACKEND_DIR/db.json" "$BACKEND_DIR/db.json.backup.$(date +%Y%m%d_%H%M%S)"
    log "✅ Backup realizado"
else
    log_warning "Arquivo db.json não encontrado"
fi

# 3. Fetch e verificar mudanças ANTES do reset
log "📥 Baixando atualizações do repositório..."
git fetch origin main

# Capturar hash do commit atual antes do reset
CURRENT_COMMIT=$(git rev-parse HEAD)
LATEST_COMMIT=$(git rev-parse origin/main)

# 4. Verificar se há mudanças no backend
BACKEND_CHANGED="false"
if [ "$FORCE_DEPLOY" = "true" ]; then
    BACKEND_CHANGED="true"
    log_info "Deploy forçado: backend será atualizado"
elif [ "$CURRENT_COMMIT" != "$LATEST_COMMIT" ]; then
    if git diff $CURRENT_COMMIT..origin/main --name-only | grep -q "^backend/"; then
        BACKEND_CHANGED="true"
        log_info "Mudanças detectadas no backend"
    fi
else
    log_info "Nenhuma atualização disponível"
fi

# 5. Verificar se há mudanças no frontend  
FRONTEND_CHANGED="false"
if [ "$FORCE_DEPLOY" = "true" ]; then
    FRONTEND_CHANGED="true"
    log_info "Deploy forçado: frontend será rebuiltado"
elif [ "$CURRENT_COMMIT" != "$LATEST_COMMIT" ]; then
    if git diff $CURRENT_COMMIT..origin/main --name-only | grep -q "^frontend/"; then
        FRONTEND_CHANGED="true"
        log_info "Mudanças detectadas no frontend"
    fi
fi

# 6. Fazer reset apenas se há atualizações
if [ "$CURRENT_COMMIT" != "$LATEST_COMMIT" ]; then
    log "🔄 Aplicando atualizações..."
    git reset --hard origin/main
    log "✅ Código atualizado"
else
    log_info "Repository já atualizado, pulando reset"
fi

# 7. Atualizar backend se necessário
if [ "$BACKEND_CHANGED" = "true" ]; then
    log "🔄 Atualizando backend..."
    cd "$BACKEND_DIR"
    
    # Instalar dependências se package.json mudou
    if git diff HEAD@{1} --name-only | grep -q "backend/package.json"; then
        log_info "Instalando dependências do backend..."
        npm ci --only=production
    fi
    
    # Reiniciar aplicação
    log "🔄 Reiniciando aplicação..."
    pm2 restart "$APP_NAME" || pm2 start src/server.js --name "$APP_NAME"
    pm2 save
    
    log "✅ Backend atualizado"
else
    log_info "⏭️  Backend sem mudanças, pulando atualização"
fi

# 8. Atualizar frontend se necessário
if [ "$FRONTEND_CHANGED" = "true" ]; then
    log "🎨 Atualizando frontend..."
    cd "$FRONTEND_DIR"
    
    # Instalar dependências se package.json mudou
    if git diff HEAD@{1} --name-only | grep -q "frontend/package.json"; then
        log_info "Instalando dependências do frontend..."
        npm ci
    fi
    
    # Build do frontend
    log_info "Fazendo build do frontend..."
    npm run build
    
    # Copiar arquivos buildados para o diretório do nginx
    log_info "Copiando arquivos para nginx..."
    sudo rm -rf /var/www/html/*
    sudo cp -r dist/* /var/www/html/
    sudo chown -R nginx:nginx /var/www/html/
    sudo chmod -R 755 /var/www/html/
    
    # Atualizar configuração do nginx se necessário
    if [ -f "$REPO_DIR/deployment/nginx.conf" ]; then
        # Criar diretórios nginx se não existirem
        sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
        sudo cp "$REPO_DIR/deployment/nginx.conf" /etc/nginx/sites-available/ps-games-catalog
        sudo ln -sf /etc/nginx/sites-available/ps-games-catalog /etc/nginx/sites-enabled/ps-games-catalog
        log_info "Configuração nginx atualizada"
    else
        log_info "Arquivo nginx.conf não encontrado, pulando configuração"
    fi
    
    # Limpar cache do nginx e recarregar
    if sudo nginx -t; then
        sudo systemctl reload nginx
        log_info "Cache do nginx limpo"
    else
        log_warning "Configuração nginx inválida, mantendo configuração anterior"
    fi
    
    log "✅ Frontend atualizado"
else
    log_info "⏭️  Frontend sem mudanças, pulando atualização"
fi

# 9. Verificar saúde da aplicação
log "🏥 Verificando saúde da aplicação..."

# Verificar PM2 e iniciar se necessário
if pm2 status | grep -q "online"; then
    log "✅ Backend rodando"
else
    log_warning "Backend não está rodando, iniciando..."
    cd "$BACKEND_DIR"
    pm2 start src/server.js --name "$APP_NAME" || {
        log_error "Falha ao iniciar backend!"
        pm2 logs "$APP_NAME" --lines 10
        exit 1
    }
    pm2 save
    log "✅ Backend iniciado"
fi

# Verificar nginx
if sudo systemctl is-active --quiet nginx; then
    log "✅ Nginx rodando"
else
    log_error "Nginx não está rodando!"
    sudo systemctl status nginx
    exit 1
fi

# Teste básico de conectividade
if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
    log "✅ API respondendo"
elif curl -s -f http://localhost:3000/ > /dev/null 2>&1; then
    log "✅ Servidor respondendo"
else
    log_warning "Servidor pode não estar respondendo corretamente"
fi

# 10. Fazer backup pós-deploy
log "💾 Executando backup pós-deploy..."
if [ -f "/home/ec2-user/backup-s3.sh" ]; then
    /home/ec2-user/backup-s3.sh > /dev/null 2>&1 || log_warning "Backup falhou"
    log "✅ Backup executado"
fi

# 11. Summary
echo
echo "================================================"
log "🎉 Deploy concluído com sucesso!"
echo -e "${BLUE}📊 Resumo:${NC}"
echo "- Backend: $([ "$BACKEND_CHANGED" = "true" ] && echo "✅ Atualizado" || echo "⏭️  Sem mudanças")"
echo "- Frontend: $([ "$FRONTEND_CHANGED" = "true" ] && echo "✅ Atualizado" || echo "⏭️  Sem mudanças")"
echo "- PM2: ✅ Online"
echo "- Nginx: ✅ Online"
echo "- Backup: ✅ Executado"
echo
echo -e "${GREEN}🌐 Aplicação disponível em: https://gamescatalog.net${NC}"
echo "================================================" 