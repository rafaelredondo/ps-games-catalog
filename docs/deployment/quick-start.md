# ⚡ Quick Start - Deploy AWS EC2

## 🚀 Deploy em 10 Minutos

### 1. Criar EC2 (3 min)

**📖 GUIA DETALHADO:** [Como criar EC2 passo-a-passo](./criar-ec2.md)

**CONFIGURAÇÃO RÁPIDA:**
```
AWS Console → EC2 → Launch Instance
- Name: ps-games-catalog
- OS: Amazon Linux 2023 (Free tier)
- Type: t2.micro (Free tier)
- Key pair: Sua chave SSH
- Security Group: SSH(22), HTTP(80), HTTPS(443), Custom(3000)
- Storage: 8 GB (Free tier)
```

**📝 ANOTAR:**
- ✅ IP Público: `_______________`
- ✅ Chave SSH: `_______________`

### 2. Configurar Servidor (5 min)
```bash
# SSH na instância
ssh -i sua-chave.pem ec2-user@SEU-IP-PUBLICO

# Baixar e executar script de setup
curl -fsSL https://raw.githubusercontent.com/SEU-USUARIO/ps-games-catalog/main/deployment/server-setup.sh | bash

# Clonar repositório
cd /home/ec2-user
git clone https://github.com/SEU-USUARIO/ps-games-catalog.git
cd ps-games-catalog

# Configurar backend
cd backend
cp env.example .env
nano .env  # Editar com suas credenciais

# Instalar dependências
npm install

# Frontend
cd ../frontend
npm install
npm run build

# Configurar nginx
sudo cp ../deployment/nginx.conf /etc/nginx/conf.d/ps-games.conf
sudo systemctl reload nginx

# Iniciar backend
pm2 start ../deployment/pm2.config.js
pm2 save
```

### 3. Deploy Automático (1 min)
```bash
# No seu computador local
# Editar deployment/deploy.sh com IP e chave
nano deployment/deploy.sh

# Configurar:
EC2_HOST="SEU-IP-PUBLICO"
KEY_PATH="~/.ssh/ps-games-key.pem"

# Fazer deploy
./deployment/deploy.sh deploy
```

## 🎯 Acessar Aplicação
```
http://SEU-IP-PUBLICO
```

## 🔄 Atualizações Futuras
```bash
# Apenas um comando
./deployment/deploy.sh deploy
```

## 💰 Custo: $0/mês (Free Tier)

## 🆘 Problemas Comuns

### Erro de Conexão SSH:
```bash
# Verificar permissões da chave
chmod 400 ~/.ssh/ps-games-key.pem

# Verificar Security Group permite SSH
```

### Aplicação não carrega:
```bash
# Verificar se backend está rodando
ssh -i sua-chave.pem ec2-user@SEU-IP
pm2 status
```

### Porta 3000 não acessível:
- Verificar Security Group permite porta 3000
- Source deve ser `0.0.0.0/0` 