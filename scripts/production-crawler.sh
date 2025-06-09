#!/bin/bash

# 🕷️ Script para Executar Crawler do Metacritic em Produção
# 
# Uso:
#   ./scripts/production-crawler.sh [opções]
#
# Opções:
#   --dry-run       : Apenas simula, não altera o banco
#   --max-games N   : Máximo de jogos (padrão: 5)
#   --backup        : Faz backup antes de executar
#   --help          : Mostra esta ajuda

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações padrão
DRY_RUN=false
MAX_GAMES=5
BACKUP=false
PROJECT_DIR="/home/ubuntu/ps-games-catalog"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Função para mostrar ajuda
show_help() {
    echo -e "${BLUE}🕷️ Crawler do Metacritic - Produção${NC}"
    echo ""
    echo "Uso:"
    echo "  ./scripts/production-crawler.sh [opções]"
    echo ""
    echo "Opções:"
    echo "  --dry-run       Apenas simula, não altera o banco"
    echo "  --max-games N   Máximo de jogos (padrão: 5, máx: 20)"
    echo "  --backup        Faz backup do banco antes de executar"
    echo "  --help          Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  ./scripts/production-crawler.sh --dry-run"
    echo "  ./scripts/production-crawler.sh --max-games 10 --backup"
    echo "  ./scripts/production-crawler.sh --backup --max-games 20"
}

# Função para fazer backup
make_backup() {
    echo -e "${YELLOW}📦 Fazendo backup do banco de dados...${NC}"
    
    if [ -f "$PROJECT_DIR/backend/db.json" ]; then
        cp "$PROJECT_DIR/backend/db.json" "$PROJECT_DIR/backend/db.backup.$TIMESTAMP.json"
        echo -e "${GREEN}✅ Backup criado: db.backup.$TIMESTAMP.json${NC}"
    else
        echo -e "${RED}❌ Arquivo de banco não encontrado!${NC}"
        exit 1
    fi
}

# Função para verificar ambiente
check_environment() {
    echo -e "${BLUE}🔍 Verificando ambiente...${NC}"
    
    # Verificar se estamos no servidor correto
    if [ ! -d "$PROJECT_DIR" ]; then
        echo -e "${RED}❌ Diretório do projeto não encontrado: $PROJECT_DIR${NC}"
        exit 1
    fi
    
    # Verificar se o banco existe
    if [ ! -f "$PROJECT_DIR/backend/db.json" ]; then
        echo -e "${RED}❌ Banco de dados não encontrado!${NC}"
        exit 1
    fi
    
    # Verificar se o Node.js está disponível
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js não encontrado!${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Ambiente verificado${NC}"
}

# Processar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --max-games)
            MAX_GAMES="$2"
            if [[ $MAX_GAMES -gt 20 ]]; then
                echo -e "${RED}❌ Máximo permitido: 20 jogos por execução${NC}"
                exit 1
            fi
            shift 2
            ;;
        --backup)
            BACKUP=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opção desconhecida: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Cabeçalho
echo -e "${BLUE}"
echo "=========================================="
echo "🕷️ Crawler do Metacritic - Produção"
echo "=========================================="
echo -e "${NC}"

# Verificar ambiente
check_environment

# Mostrar configuração
echo -e "${YELLOW}📊 Configuração:${NC}"
echo "   Modo: $([ "$DRY_RUN" = true ] && echo "DRY RUN (simulação)" || echo "REAL (alterará o banco)")"
echo "   Máximo de jogos: $MAX_GAMES"
echo "   Backup: $([ "$BACKUP" = true ] && echo "Sim" || echo "Não")"
echo "   Timestamp: $TIMESTAMP"
echo ""

# Confirmação para modo real
if [ "$DRY_RUN" = false ]; then
    echo -e "${YELLOW}⚠️  ATENÇÃO: Modo REAL irá alterar o banco de dados de produção!${NC}"
    read -p "Tem certeza que deseja continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}📝 Operação cancelada pelo usuário${NC}"
        exit 0
    fi
fi

# Fazer backup se solicitado
if [ "$BACKUP" = true ]; then
    make_backup
fi

# Ir para o diretório do projeto
cd "$PROJECT_DIR"

# Construir comando
CRAWLER_CMD="npm run crawler"
if [ "$DRY_RUN" = true ]; then
    CRAWLER_CMD="npm run crawler:dry"
fi
CRAWLER_CMD="$CRAWLER_CMD -- --max-games $MAX_GAMES"

# Executar crawler
echo -e "${BLUE}🚀 Executando crawler...${NC}"
echo "Comando: $CRAWLER_CMD"
echo ""

# Salvar log
LOG_FILE="logs/crawler_$TIMESTAMP.log"
mkdir -p logs

if eval "$CRAWLER_CMD" 2>&1 | tee "$LOG_FILE"; then
    echo ""
    echo -e "${GREEN}✅ Crawler executado com sucesso!${NC}"
    echo -e "${BLUE}📝 Log salvo em: $LOG_FILE${NC}"
    
    if [ "$BACKUP" = true ]; then
        echo -e "${BLUE}📦 Backup disponível em: backend/db.backup.$TIMESTAMP.json${NC}"
    fi
else
    echo ""
    echo -e "${RED}❌ Erro durante execução do crawler${NC}"
    echo -e "${BLUE}📝 Verifique o log: $LOG_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}"
echo "=========================================="
echo "🎯 Crawler finalizado!"
echo "=========================================="
echo -e "${NC}" 