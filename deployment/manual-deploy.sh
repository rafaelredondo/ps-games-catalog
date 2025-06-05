#!/bin/bash

# Script para deploy manual direto no servidor
# Use quando GitHub Actions estiver com problemas

set -e

echo "🚀 DEPLOY MANUAL - PS Games Catalog"
echo "=================================="

# Verificar se temos as chaves SSH
if [ ! -f ~/.ssh/ps-games-key.pem ]; then
    echo "❌ Erro: Chave SSH não encontrada em ~/.ssh/ps-games-key.pem"
    exit 1
fi

# Configurações
SERVER="gamescatalog.net"
USER="ec2-user"
KEY="~/.ssh/ps-games-key.pem"

echo "📡 Conectando ao servidor..."

# Fazer deploy
ssh -i $KEY $USER@$SERVER << 'EOF'
    echo "📥 Atualizando código..."
    cd /home/ec2-user/ps-games-catalog
    git pull origin main
    
    echo "🔧 Executando deploy forçado..."
    chmod +x deployment/*.sh
    ./deployment/deploy-ci.sh --force
    
    echo "✅ Deploy manual concluído!"
EOF

echo ""
echo "🏥 Verificando saúde da aplicação..."
sleep 5

if curl -s -f --connect-timeout 10 https://gamescatalog.net > /dev/null; then
    echo "✅ Aplicação está respondendo!"
    echo "🌐 Acesse: https://gamescatalog.net"
else
    echo "⚠️  Aplicação pode não estar respondendo ainda"
    echo "🔍 Verifique os logs no servidor"
fi

echo "🎉 Deploy manual finalizado!" 