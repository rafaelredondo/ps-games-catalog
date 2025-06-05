# 🚀 Deploy na AWS EC2 - Guia Completo

## 📋 Pré-requisitos

- Conta AWS ativa
- Ter sua chave SSH configurada (.pem)
- Git configurado localmente

## 🏗️ Passo 1: Criar Instância EC2

### 1.1 Console AWS
1. Acesse [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Clique em **"Launch Instance"**

### 1.2 Configuração da Instância
```
Name: ps-games-catalog
OS: Amazon Linux 2023 (Free tier eligible)
Instance type: t2.micro (Free tier eligible)
Key pair: Criar nova ou usar existente
Security Group: Permitir SSH (22), HTTP (80), HTTPS (443), Custom (3000)
Storage: 8 GB gp3 (Free tier)
```

### 1.3 Security Group Rules
```
SSH (22)     - Seu IP ou 0.0.0.0/0
HTTP (80)    - 0.0.0.0/0
HTTPS (443)  - 0.0.0.0/0
Custom (3000) - 0.0.0.0/0  # Para o backend
Custom (5173) - 0.0.0.0/0  # Para dev do frontend
```

## 🔧 Passo 2: Configurar Servidor

### 2.1 Conectar via SSH
```bash
chmod 400 sua-chave.pem
ssh -i sua-chave.pem ec2-user@SEU-IP-PUBLICO
```

### 2.2 Instalar Dependências
```bash
# Atualizar sistema
sudo yum update -y

# Instalar Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar Git
sudo yum install -y git

# Instalar nginx
sudo yum install -y nginx
```

### 2.3 Configurar nginx
```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 📦 Passo 3: Deploy da Aplicação

### 3.1 Clonar Repositório
```bash
# Na instância EC2
cd /home/ec2-user
git clone https://github.com/SEU-USUARIO/ps-games-catalog.git
cd ps-games-catalog
```

### 3.2 Configurar Backend
```bash
cd backend
cp env.example .env

# Editar variáveis de ambiente
nano .env
```

**Conteúdo do .env:**
```env
AUTH_USERNAME=seu_email@gmail.com
AUTH_PASSWORD=suaSenhaSegura123
PORT=3000
NODE_ENV=production
```

### 3.3 Instalar Dependências
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
npm run build
```

## 🚀 Passo 4: Configurar Processos

### 4.1 Iniciar Backend com PM2
```bash
cd /home/ec2-user/ps-games-catalog/backend
pm2 start src/server.js --name "ps-games-backend"
pm2 save
pm2 startup
```

### 4.2 Configurar nginx para Frontend
```bash
sudo cp /home/ec2-user/ps-games-catalog/deployment/nginx.conf /etc/nginx/conf.d/ps-games.conf
sudo systemctl reload nginx
```

## 🔄 Deploy Updates

### Método 1: Script Automático (Recomendado)
```bash
# No seu computador local
./deployment/deploy.sh
```

### Método 2: Manual
```bash
# SSH na instância
ssh -i sua-chave.pem ec2-user@SEU-IP

# Atualizar código
cd ps-games-catalog
git pull origin main

# Reinstalar dependências se necessário
cd backend && npm install
cd ../frontend && npm install && npm run build

# Restart aplicação
pm2 restart ps-games-backend
sudo systemctl reload nginx
```

## 🌐 Passo 5: Configurar Domínio (Opcional)

### 5.1 Route 53 (Pago - $0.50/mês)
1. Criar Hosted Zone no Route 53
2. Apontar registros A para IP da EC2
3. Configurar SSL com Let's Encrypt

### 5.2 Acesso Direto por IP (Grátis)
```
Frontend: http://SEU-IP-PUBLICO
Backend API: http://SEU-IP-PUBLICO:3000/api
```

## 🔍 Monitoramento

### Verificar Status
```bash
# Status dos processos
pm2 status
pm2 logs

# Status nginx
sudo systemctl status nginx

# Recursos do sistema
htop
df -h
```

### Logs
```bash
# Logs do backend
pm2 logs ps-games-backend

# Logs do nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 💰 Custos

- **EC2 t2.micro**: $0/mês (Free Tier - 750h)
- **Storage**: $0/mês (Free Tier - 30GB)
- **Data Transfer**: $0/mês (Free Tier - 1GB out)
- **Route 53**: $0.50/mês (opcional)

**Total: $0-0.50/mês** 🎉

## 🆘 Troubleshooting

### Problema: Aplicação não carrega
```bash
# Verificar se o backend está rodando
pm2 status
curl http://localhost:3000

# Verificar nginx
sudo nginx -t
sudo systemctl status nginx
```

### Problema: Sem permissão para portas
```bash
# Verificar Security Group no AWS Console
# Adicionar regras para portas 80, 443, 3000
```

### Problema: Falta de memória
```bash
# Verificar uso de memória
free -h

# Adicionar swap se necessário
sudo dd if=/dev/zero of=/swapfile bs=1024 count=1048576
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
``` 