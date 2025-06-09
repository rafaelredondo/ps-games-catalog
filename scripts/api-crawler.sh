#!/bin/bash

# 🌐 Script para Executar Crawler via API em Produção
# 
# Uso:
#   ./scripts/api-crawler.sh [opções]
#
# Configuração:
#   Crie um arquivo .env.crawler com:
#   API_URL=https://gamescatalog.net
#   API_USER=admin
#   API_PASS=sua_senha

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações padrão
DRY_RUN=false
MAX_GAMES=5
ENV_FILE=".env.crawler"

# Carregar configurações do arquivo .env.crawler
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
else
    echo -e "${RED}❌ Arquivo $ENV_FILE não encontrado!${NC}"
    echo -e "${YELLOW}📝 Crie o arquivo com:${NC}"
    echo "API_URL=https://gamescatalog.net"
    echo "API_USER=admin"
    echo "API_PASS=sua_senha"
    exit 1
fi

# Verificar variáveis obrigatórias
if [ -z "$API_URL" ] || [ -z "$API_USER" ] || [ -z "$API_PASS" ]; then
    echo -e "${RED}❌ Variáveis obrigatórias não configuradas no $ENV_FILE${NC}"
    exit 1
fi

# Processar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --max-games)
            MAX_GAMES="$2"
            shift 2
            ;;
        --help)
            echo -e "${BLUE}🌐 Crawler via API - Produção${NC}"
            echo ""
            echo "Uso: ./scripts/api-crawler.sh [opções]"
            echo ""
            echo "Opções:"
            echo "  --dry-run       Simula execução"
            echo "  --max-games N   Máximo de jogos (padrão: 5)"
            echo "  --help          Esta ajuda"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opção desconhecida: $1${NC}"
            exit 1
            ;;
    esac
done

# Função para fazer requisição
api_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    
    local auth=$(echo -n "$API_USER:$API_PASS" | base64)
    
    if [ -n "$data" ]; then
        curl -s -X "$method" \
             -H "Content-Type: application/json" \
             -H "Authorization: Basic $auth" \
             -d "$data" \
             "$API_URL/api/metacritic$endpoint"
    else
        curl -s -X "$method" \
             -H "Authorization: Basic $auth" \
             "$API_URL/api/metacritic$endpoint"
    fi
}

echo -e "${BLUE}"
echo "=========================================="
echo "🌐 Crawler via API - Produção"
echo "=========================================="
echo -e "${NC}"

echo -e "${YELLOW}📊 Configuração:${NC}"
echo "   URL: $API_URL"
echo "   Usuário: $API_USER"
echo "   Modo: $([ "$DRY_RUN" = true ] && echo "DRY RUN" || echo "REAL")"
echo "   Máximo de jogos: $MAX_GAMES"
echo ""

# 1. Verificar status
echo -e "${BLUE}🔍 Verificando status...${NC}"
status_response=$(api_request "GET" "/status")

if echo "$status_response" | jq -e '.success' > /dev/null 2>&1; then
    games_count=$(echo "$status_response" | jq -r '.data.gamesWithoutScores')
    echo -e "${GREEN}✅ Jogos sem nota Metacritic: $games_count${NC}"
    
    if [ "$games_count" -eq 0 ]; then
        echo -e "${GREEN}🎉 Todos os jogos já possuem notas!${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ Erro ao verificar status${NC}"
    echo "$status_response"
    exit 1
fi

# 2. Confirmação
if [ "$DRY_RUN" = false ]; then
    echo -e "${YELLOW}⚠️  ATENÇÃO: Irá alterar o banco de produção!${NC}"
    read -p "Continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}📝 Cancelado${NC}"
        exit 0
    fi
fi

# 3. Executar crawler
echo -e "${BLUE}🚀 Executando crawler...${NC}"

crawl_data=$(cat <<EOF
{
    "maxGames": $MAX_GAMES,
    "dryRun": $DRY_RUN
}
EOF
)

crawl_response=$(api_request "POST" "/crawl" "$crawl_data")

if echo "$crawl_response" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Crawler executado com sucesso!${NC}"
    echo ""
    
    # Mostrar resultados
    processed=$(echo "$crawl_response" | jq -r '.data.processed')
    updated=$(echo "$crawl_response" | jq -r '.data.updated')
    failed=$(echo "$crawl_response" | jq -r '.data.failed')
    success_rate=$(echo "$crawl_response" | jq -r '.data.successRate')
    
    echo -e "${YELLOW}📊 Resultados:${NC}"
    echo "   Processados: $processed"
    echo "   Atualizados: $updated"
    echo "   Falharam: $failed"
    echo "   Taxa de sucesso: $success_rate%"
    
    # Mostrar erros se houver
    errors=$(echo "$crawl_response" | jq -r '.data.errors[]?' 2>/dev/null || echo "")
    if [ -n "$errors" ]; then
        echo ""
        echo -e "${YELLOW}⚠️  Erros:${NC}"
        echo "$crawl_response" | jq -r '.data.errors[]?' | while read -r error; do
            echo "   - $error"
        done
    fi
    
else
    echo -e "${RED}❌ Erro ao executar crawler${NC}"
    echo "$crawl_response"
    exit 1
fi

echo ""
echo -e "${BLUE}"
echo "=========================================="
echo "🎯 Finalizado!"
echo "=========================================="
echo -e "${NC}" 