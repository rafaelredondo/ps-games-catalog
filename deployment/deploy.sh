#!/bin/bash

# 🚀 Script de Deploy Automático - PS Games Catalog
# Executa o deploy na instância EC2 via SSH

set -e  # Parar execução se houver erro

# Configurações (EDITE ESSAS VARIÁVEIS)
EC2_USER="ec2-user"
EC2_HOST=""  # IP público da sua instância EC2
KEY_PATH=""  # Caminho para sua chave .pem
APP_DIR="/home/ec2-user/ps-games-catalog"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_step() {
    echo -e "${BLUE}🔄 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se as variáveis estão configuradas
check_config() {
    if [ -z "$EC2_HOST" ] || [ -z "$KEY_PATH" ]; then
        print_error "ERRO: Configure EC2_HOST e KEY_PATH no topo deste script!"
        print_warning "EC2_HOST: IP público da sua instância"
        print_warning "KEY_PATH: Caminho para sua chave .pem"
        exit 1
    fi
    
    if [ ! -f "$KEY_PATH" ]; then
        print_error "ERRO: Arquivo de chave não encontrado: $KEY_PATH"
        exit 1
    fi
    
    # Verificar permissões da chave
    chmod 400 "$KEY_PATH"
}

# Teste de conectividade
test_connection() {
    print_step "Testando conexão SSH..."
    if ssh -i "$KEY_PATH" -o ConnectTimeout=10 -o BatchMode=yes "$EC2_USER@$EC2_HOST" exit 2>/dev/null; then
        print_success "Conexão SSH estabelecida"
    else
        print_error "Falha na conexão SSH"
        print_warning "Verifique:"
        print_warning "- IP público correto"
        print_warning "- Chave SSH correta"
        print_warning "- Security Group permite SSH (porta 22)"
        exit 1
    fi
}

# Deploy principal
deploy() {
    print_step "Iniciando deploy..."
    
    ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
        set -e
        
        echo "🔄 Navegando para diretório da aplicação..."
        cd /home/ec2-user/ps-games-catalog
        
        echo "🔄 Fazendo backup do banco de dados..."
        if [ -f "backend/db.json" ]; then
            cp backend/db.json backend/db.json.backup.$(date +%Y%m%d_%H%M%S)
            echo "✅ Backup criado"
        fi
        
        echo "🔄 Atualizando código do repositório..."
        git pull origin main
        
        echo "🔄 Verificando mudanças no backend..."
        cd backend
        if [ -f "package-lock.json" ]; then
            npm ci --production
        else
            npm install --production
        fi
        
        echo "🔄 Verificando mudanças no frontend..."
        cd ../frontend
        if [ -f "package-lock.json" ]; then
            npm ci
        else
            npm install
        fi
        
        echo "🔄 Fazendo build do frontend..."
        npm run build
        
        echo "🔄 Reiniciando aplicação backend..."
        pm2 restart ps-games-backend || pm2 start /home/ec2-user/ps-games-catalog/deployment/pm2.config.js
        
        echo "🔄 Recarregando nginx..."
        sudo systemctl reload nginx
        
        echo "🔄 Verificando status dos serviços..."
        pm2 status
        sudo systemctl status nginx --no-pager -l
        
        echo "✅ Deploy concluído com sucesso!"
ENDSSH
}

# Status da aplicação
check_status() {
    print_step "Verificando status da aplicação..."
    
    ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
        echo "📊 Status PM2:"
        pm2 status
        
        echo ""
        echo "📊 Status nginx:"
        sudo systemctl status nginx --no-pager -l
        
        echo ""
        echo "📊 Uso de recursos:"
        free -h
        df -h /
        
        echo ""
        echo "📊 Últimos logs do backend:"
        pm2 logs ps-games-backend --lines 5 --nostream
ENDSSH
}

# Logs da aplicação
show_logs() {
    print_step "Mostrando logs da aplicação..."
    
    ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
        echo "📋 Logs do backend (PM2):"
        pm2 logs ps-games-backend --lines 20 --nostream
        
        echo ""
        echo "📋 Logs do nginx (access):"
        sudo tail -20 /var/log/nginx/ps-games-access.log 2>/dev/null || echo "Arquivo de log não encontrado"
        
        echo ""
        echo "📋 Logs do nginx (error):"
        sudo tail -20 /var/log/nginx/ps-games-error.log 2>/dev/null || echo "Arquivo de log não encontrado"
ENDSSH
}

# Rollback para commit anterior
rollback() {
    print_warning "Iniciando rollback para commit anterior..."
    
    ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
        set -e
        cd /home/ec2-user/ps-games-catalog
        
        echo "🔄 Voltando para commit anterior..."
        git reset --hard HEAD~1
        
        echo "🔄 Reinstalando dependências..."
        cd backend && npm install --production
        cd ../frontend && npm install && npm run build
        
        echo "🔄 Reiniciando serviços..."
        pm2 restart ps-games-backend
        sudo systemctl reload nginx
        
        echo "✅ Rollback concluído"
ENDSSH
}

# Menu principal
show_help() {
    echo -e "${BLUE}🚀 PS Games Catalog - Script de Deploy${NC}"
    echo ""
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  deploy     - Fazer deploy da aplicação"
    echo "  status     - Verificar status dos serviços"
    echo "  logs       - Mostrar logs da aplicação"
    echo "  rollback   - Voltar para commit anterior"
    echo "  test       - Testar conexão SSH"
    echo "  help       - Mostrar esta ajuda"
    echo ""
    echo "Exemplo:"
    echo "  $0 deploy"
    echo ""
}

# Executar comando baseado no argumento
case "${1:-help}" in
    "deploy")
        check_config
        test_connection
        deploy
        print_success "Deploy concluído! Acesse: http://$EC2_HOST"
        ;;
    "status")
        check_config
        check_status
        ;;
    "logs")
        check_config
        show_logs
        ;;
    "rollback")
        check_config
        rollback
        ;;
    "test")
        check_config
        test_connection
        ;;
    "help"|*)
        show_help
        ;;
esac 