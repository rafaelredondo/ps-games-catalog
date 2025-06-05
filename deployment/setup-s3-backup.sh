#!/bin/bash

# PS Games Catalog - Configuração AWS S3 para Backup
# Script para criar bucket S3 e configurar credenciais

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌥️  PS Games Catalog - Configuração AWS S3${NC}"
echo

# Gerar nome único para o bucket
TIMESTAMP=$(date +%s)
BUCKET_NAME="ps-games-backup-${TIMESTAMP}"
REGION="us-east-1"  # Região gratuita

echo -e "${YELLOW}📋 Configurações:${NC}"
echo "- Bucket Name: $BUCKET_NAME"
echo "- Região: $REGION"
echo

# Verificar se AWS CLI está configurado
echo -e "${YELLOW}🔍 Verificando configuração AWS...${NC}"
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo -e "${RED}❌ AWS CLI não está configurado!${NC}"
    echo
    echo -e "${YELLOW}Para configurar o AWS CLI:${NC}"
    echo "1. Acesse: https://console.aws.amazon.com/iam/home#/users"
    echo "2. Crie um usuário para backup com as permissões:"
    echo "   - AmazonS3FullAccess (ou política customizada)"
    echo "3. Gere Access Key ID e Secret Access Key"
    echo "4. Execute: aws configure"
    echo
    exit 1
fi

# Obter informações da conta
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS configurado - Account ID: $ACCOUNT_ID${NC}"

# Criar bucket S3
echo -e "${YELLOW}🪣 Criando bucket S3...${NC}"
if aws s3 mb s3://$BUCKET_NAME --region $REGION; then
    echo -e "${GREEN}✅ Bucket criado com sucesso: $BUCKET_NAME${NC}"
else
    echo -e "${RED}❌ Erro ao criar bucket. Tentando com nome alternativo...${NC}"
    BUCKET_NAME="ps-games-backup-$(uuidgen | tr '[:upper:]' '[:lower:]' | cut -d'-' -f1)"
    if aws s3 mb s3://$BUCKET_NAME --region $REGION; then
        echo -e "${GREEN}✅ Bucket criado com sucesso: $BUCKET_NAME${NC}"
    else
        echo -e "${RED}❌ Erro ao criar bucket S3${NC}"
        exit 1
    fi
fi

# Configurar lifecycle para otimizar custos
echo -e "${YELLOW}♻️  Configurando lifecycle para reduzir custos...${NC}"
cat > lifecycle.json << EOF
{
    "Rules": [
        {
            "ID": "ps-games-backup-lifecycle",
            "Status": "Enabled",
            "Filter": {
                "Prefix": "backups/"
            },
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "STANDARD_IA"
                },
                {
                    "Days": 90,
                    "StorageClass": "GLACIER"
                },
                {
                    "Days": 365,
                    "StorageClass": "DEEP_ARCHIVE"
                }
            ],
            "Expiration": {
                "Days": 2555
            }
        }
    ]
}
EOF

if aws s3api put-bucket-lifecycle-configuration --bucket $BUCKET_NAME --lifecycle-configuration file://lifecycle.json; then
    echo -e "${GREEN}✅ Lifecycle configurado (otimização de custos)${NC}"
    rm lifecycle.json
else
    echo -e "${YELLOW}⚠️  Aviso: Não foi possível configurar lifecycle${NC}"
    rm -f lifecycle.json
fi

# Configurar versionamento (opcional, para recuperação de versões)
echo -e "${YELLOW}📝 Configurando versionamento...${NC}"
if aws s3api put-bucket-versioning --bucket $BUCKET_NAME --versioning-configuration Status=Enabled; then
    echo -e "${GREEN}✅ Versionamento habilitado${NC}"
else
    echo -e "${YELLOW}⚠️  Aviso: Não foi possível habilitar versionamento${NC}"
fi

# Salvar configurações
echo -e "${YELLOW}💾 Salvando configurações...${NC}"
cat > ~/.ps-games-s3-config << EOF
# PS Games Catalog - Configuração S3
S3_BUCKET_NAME="$BUCKET_NAME"
S3_REGION="$REGION"
S3_PREFIX="backups/"
AWS_ACCOUNT_ID="$ACCOUNT_ID"
CREATED_DATE="$(date)"
EOF

echo -e "${GREEN}✅ Configurações salvas em ~/.ps-games-s3-config${NC}"

# Teste de conectividade
echo -e "${YELLOW}🧪 Testando conectividade...${NC}"
echo "Teste de conectividade - $(date)" > test-file.txt
if aws s3 cp test-file.txt s3://$BUCKET_NAME/test/test-file.txt; then
    echo -e "${GREEN}✅ Teste de upload bem-sucedido${NC}"
    aws s3 rm s3://$BUCKET_NAME/test/test-file.txt
    echo -e "${GREEN}✅ Teste de remoção bem-sucedido${NC}"
    rm test-file.txt
else
    echo -e "${RED}❌ Erro no teste de conectividade${NC}"
    rm -f test-file.txt
    exit 1
fi

echo
echo -e "${GREEN}🎉 Configuração S3 concluída com sucesso!${NC}"
echo
echo -e "${BLUE}📋 Informações importantes:${NC}"
echo "- Bucket Name: $BUCKET_NAME"
echo "- Região: $REGION"
echo "- Configuração salva em: ~/.ps-games-s3-config"
echo
echo -e "${YELLOW}💰 Otimizações de Custo Configuradas:${NC}"
echo "- Após 30 dias: Move para Standard-IA (menor custo)"
echo "- Após 90 dias: Move para Glacier (muito menor custo)"
echo "- Após 365 dias: Move para Deep Archive (custo mínimo)"
echo "- Após 7 anos: Remove automaticamente"
echo
echo -e "${GREEN}✅ Agora você pode executar o backup-s3.sh!${NC}" 