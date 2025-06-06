#!/bin/bash

# Deploy simplificado para EC2 - usado pelo GitHub Actions
# Este script assume que o frontend já foi buildado no GitHub Actions

set -e

# Configurações
APP_NAME="ps-games-backend"
BACKEND_DIR="/home/ec2-user/ps-games-catalog/backend"
FRONTEND_TEMP_DIR="/tmp/frontend-build"
NGINX_DIR="/var/www/html"

# Funções de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log_info() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1"
}

log_warning() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1"
}

# 1. Backup do frontend atual (se existir)
log "📦 Criando backup do frontend atual..."
if [ -d "$NGINX_DIR" ] && [ "$(ls -A $NGINX_DIR 2>/dev/null)" ]; then
    sudo cp -r "$NGINX_DIR" "/home/ec2-user/backup-frontend-$(date +%Y%m%d_%H%M%S)" || {
        log_warning "Falha ao criar backup do frontend, continuando..."
    }
fi

# 2. Atualizar código do repositório
log "🔄 Atualizando código do repositório..."
cd /home/ec2-user/ps-games-catalog
git fetch origin main
git reset --hard origin/main
log "✅ Código atualizado"

# 3. Atualizar dependências do backend se necessário
log "📦 Verificando dependências do backend..."
cd "$BACKEND_DIR"
if ! npm ci --production --silent; then
    log_warning "Falha ao instalar dependências, tentando com cache limpo..."
    npm cache clean --force
    npm ci --production
fi
log "✅ Dependências do backend atualizadas"

# 4. Copiar frontend buildado do diretório temporário
log "📋 Instalando frontend buildado..."
if [ -d "$FRONTEND_TEMP_DIR" ] && [ "$(ls -A $FRONTEND_TEMP_DIR 2>/dev/null)" ]; then
    # Limpar diretório do nginx
    sudo rm -rf "$NGINX_DIR"/*
    
    # Copiar arquivos buildados
    sudo cp -r "$FRONTEND_TEMP_DIR"/* "$NGINX_DIR"/
    
    # Ajustar permissões
    sudo chown -R nginx:nginx "$NGINX_DIR"
    sudo chmod -R 755 "$NGINX_DIR"
    
    log "✅ Frontend instalado com sucesso"
else
    log_error "Diretório do frontend buildado não encontrado: $FRONTEND_TEMP_DIR"
    exit 1
fi

# 5. Reiniciar backend via PM2
log "🔄 Reiniciando backend..."
if pm2 status | grep -q "$APP_NAME"; then
    pm2 restart "$APP_NAME"
    log "✅ Backend reiniciado"
else
    log_info "Backend não estava rodando, iniciando..."
    cd "$BACKEND_DIR"
    pm2 start src/server.js --name "$APP_NAME"
    pm2 save
    log "✅ Backend iniciado"
fi

# 6. Reiniciar nginx
log "🔄 Reiniciando nginx..."
sudo systemctl reload nginx
log "✅ Nginx reiniciado"

# 7. Limpar diretório temporário
log "🧹 Limpando arquivos temporários..."
rm -rf "$FRONTEND_TEMP_DIR"

# 8. Verificar saúde da aplicação
log "🏥 Verificando saúde da aplicação..."

# Aguardar um momento para os serviços subirem
sleep 5

# Verificar backend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health | grep -q "200"; then
    log "✅ Backend rodando corretamente"
else
    log_error "Backend não está respondendo corretamente"
    pm2 logs "$APP_NAME" --lines 10
    exit 1
fi

# Verificar frontend via nginx
if curl -s -o /dev/null -w "%{http_code}" http://localhost/ | grep -q "200"; then
    log "✅ Frontend sendo servido corretamente"
else
    log_error "Frontend não está sendo servido corretamente"
    sudo nginx -t
    exit 1
fi

log "🎉 Deploy concluído com sucesso!"
log "📊 Status dos serviços:"
pm2 status
sudo systemctl status nginx --no-pager -l 