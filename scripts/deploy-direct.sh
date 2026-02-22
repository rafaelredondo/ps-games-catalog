#!/bin/bash

# Deploy direto - SIMPLES e que FUNCIONA
# Faz build local e envia para o servidor

set -e

echo "🚀 DEPLOY DIRETO - SOLUÇÃO DEFINITIVA"
echo "===================================="

# Verificar se temos as variáveis necessárias
if [ -z "$EC2_HOST" ] || [ -z "$EC2_USER" ] || [ -z "$EC2_KEY" ]; then
    echo "❌ Configurando variáveis..."
    export EC2_HOST="54.156.182.127"
    export EC2_USER="ec2-user"
    export EC2_KEY="~/.ssh/ps-games-deploy.pub"  # Ajuste se necessário
fi

echo "🏗️ 1. FAZENDO BUILD LOCAL do frontend..."
cd frontend
npm run build
echo "✅ Build local concluído!"

echo "📤 2. ENVIANDO arquivos para o servidor..."
# Enviar arquivos diretamente via rsync
rsync -avz --delete \
    -e "ssh -i ~/.ssh/ps-games-deploy -o StrictHostKeyChecking=no" \
    dist/ \
    $EC2_USER@$EC2_HOST:/tmp/new-frontend/

echo "🔧 3. INSTALANDO no servidor..."
ssh -i ~/.ssh/ps-games-deploy -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST << 'EOF'
# Criar diretórios necessários
sudo mkdir -p /var/www/html
sudo rm -rf /var/www/html/*

# Copiar arquivos
sudo cp -r /tmp/new-frontend/* /var/www/html/

# Ajustar permissões
sudo chown -R nginx:nginx /var/www/html
sudo chmod -R 755 /var/www/html

# Reiniciar nginx
sudo systemctl reload nginx

# Limpar temporários
rm -rf /tmp/new-frontend

echo "✅ Frontend instalado com sucesso!"
EOF

echo "🔄 4. ATUALIZANDO backend..."
ssh -i ~/.ssh/ps-games-deploy -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST << 'EOF'
cd /home/ec2-user/ps-games-catalog
git pull origin main
cd backend
npm ci --production
pm2 restart ps-games-backend || pm2 start src/server.js --name ps-games-backend
echo "✅ Backend atualizado!"
EOF

echo ""
echo "🏥 5. VERIFICANDO se funcionou..."
sleep 3

# Verificar frontend
if curl -s -f http://$EC2_HOST/ > /dev/null; then
    echo "✅ Frontend funcionando: http://$EC2_HOST/"
else
    echo "❌ Frontend ainda com problemas"
fi

# Verificar backend
if curl -s -f http://$EC2_HOST:3000/api/health > /dev/null; then
    echo "✅ Backend funcionando: http://$EC2_HOST:3000/api/health"
else
    echo "❌ Backend com problemas"
fi

echo ""
echo "🎉 DEPLOY DIRETO CONCLUÍDO!"
echo "🌐 Acesse: http://$EC2_HOST/"

cd .. 