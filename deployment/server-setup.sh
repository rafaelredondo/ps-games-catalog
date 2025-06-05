#!/bin/bash

# 🏗️ Script de Configuração Inicial do Servidor EC2
# Execute este script UMA VEZ na instância EC2 recém-criada

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

print_step "Iniciando configuração do servidor EC2..."

# Atualizar sistema
print_step "Atualizando sistema..."
sudo yum update -y
print_success "Sistema atualizado"

# Instalar Node.js 18
print_step "Instalando Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
node_version=$(node --version)
npm_version=$(npm --version)
print_success "Node.js instalado: $node_version, npm: $npm_version"

# Instalar PM2
print_step "Instalando PM2..."
sudo npm install -g pm2
pm2_version=$(pm2 --version)
print_success "PM2 instalado: $pm2_version"

# Instalar Git
print_step "Instalando Git..."
sudo yum install -y git
git_version=$(git --version)
print_success "Git instalado: $git_version"

# Instalar nginx
print_step "Instalando nginx..."
sudo yum install -y nginx
nginx_version=$(nginx -v 2>&1)
print_success "nginx instalado: $nginx_version"

# Configurar nginx
print_step "Configurando nginx..."
sudo systemctl enable nginx
sudo systemctl start nginx
print_success "nginx configurado e iniciado"

# Instalar htop para monitoramento
print_step "Instalando ferramentas de monitoramento..."
sudo yum install -y htop
print_success "htop instalado"

# Criar diretórios necessários
print_step "Criando diretórios..."
mkdir -p /home/ec2-user/logs
mkdir -p /home/ec2-user/backups
print_success "Diretórios criados"

# Configurar PM2 para auto-start
print_step "Configurando PM2 para auto-start..."
pm2 startup systemd -u ec2-user --hp /home/ec2-user
print_warning "Execute o comando de startup que apareceu acima (se houver)"

# Clonar repositório (você precisa fornecer a URL)
print_step "Preparando para clonar repositório..."
print_warning "AÇÃO NECESSÁRIA: Clone seu repositório manualmente:"
echo "cd /home/ec2-user"
echo "git clone https://github.com/SEU-USUARIO/ps-games-catalog.git"
echo ""

# Verificar instalações
print_step "Verificando instalações..."
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "PM2: $(pm2 --version)"
echo "Git: $(git --version)"
echo "nginx: $(nginx -v 2>&1)"

print_success "Configuração inicial concluída!"
print_warning "Próximos passos:"
echo "1. Clone seu repositório Git"
echo "2. Configure as variáveis de ambiente no backend/.env"
echo "3. Execute o primeiro deploy manual ou use o script deploy.sh"
echo ""
echo "Comandos úteis:"
echo "pm2 status          - Ver status dos processos"
echo "pm2 logs            - Ver logs dos processos"
echo "sudo systemctl status nginx - Ver status do nginx"
echo "htop                - Monitor de sistema" 