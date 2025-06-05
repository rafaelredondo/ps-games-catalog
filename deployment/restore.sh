#!/bin/bash

# PS Games Catalog - Restauração de Backup
# Restaura o banco de dados a partir de um backup

# Configurações
BACKUP_DIR="/home/ec2-user/backups/ps-games"
DB_FILE="/home/ec2-user/ps-games-catalog/backend/db.json"
DB_BACKUP="${DB_FILE}.backup_$(date +%Y%m%d_%H%M%S)"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 PS Games Catalog - Restauração de Backup${NC}"
echo

# Verificar se o diretório de backup existe
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ ERRO: Diretório de backup não encontrado: $BACKUP_DIR${NC}"
    exit 1
fi

# Listar backups disponíveis
echo -e "${YELLOW}📋 Backups disponíveis:${NC}"
echo
cd "$BACKUP_DIR"
BACKUPS=($(ls -1t db_backup_*.json 2>/dev/null))

if [ ${#BACKUPS[@]} -eq 0 ]; then
    echo -e "${RED}❌ Nenhum backup encontrado!${NC}"
    exit 1
fi

# Mostrar lista de backups
for i in "${!BACKUPS[@]}"; do
    BACKUP_FILE="${BACKUPS[$i]}"
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    DATE=$(echo "$BACKUP_FILE" | sed 's/db_backup_\([0-9]\{8\}\)_\([0-9]\{6\}\).json/\1 \2/' | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\) \([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\3\/\2\/\1 \4:\5:\6/')
    
    if [ "$i" -eq 0 ]; then
        echo -e "${GREEN}$((i+1))) $BACKUP_FILE ($SIZE) - $DATE [MAIS RECENTE]${NC}"
    else
        echo "$((i+1))) $BACKUP_FILE ($SIZE) - $DATE"
    fi
done

echo
echo -e "${BLUE}0) Cancelar${NC}"
echo

# Solicitar escolha do usuário
while true; do
    read -p "Escolha o backup para restaurar (0-${#BACKUPS[@]}): " choice
    
    if [ "$choice" = "0" ]; then
        echo -e "${YELLOW}Operação cancelada.${NC}"
        exit 0
    elif [ "$choice" -ge 1 ] && [ "$choice" -le "${#BACKUPS[@]}" ]; then
        SELECTED_BACKUP="${BACKUPS[$((choice-1))]}"
        break
    else
        echo -e "${RED}Opção inválida. Escolha entre 0 e ${#BACKUPS[@]}.${NC}"
    fi
done

echo
echo -e "${YELLOW}⚠️  ATENÇÃO: Esta operação irá substituir o banco de dados atual!${NC}"
echo -e "${BLUE}Backup selecionado: $SELECTED_BACKUP${NC}"
echo

# Confirmação final
while true; do
    read -p "Tem certeza que deseja continuar? (s/N): " confirm
    case $confirm in
        [Ss]* ) break;;
        [Nn]* | "" ) 
            echo -e "${YELLOW}Operação cancelada.${NC}"
            exit 0;;
        * ) echo "Digite 's' para sim ou 'n' para não.";;
    esac
done

echo
echo -e "${YELLOW}🔄 Iniciando restauração...${NC}"

# Fazer backup do arquivo atual antes de restaurar
if [ -f "$DB_FILE" ]; then
    echo "📁 Fazendo backup do arquivo atual..."
    if cp "$DB_FILE" "$DB_BACKUP"; then
        echo -e "${GREEN}✅ Backup atual salvo em: $DB_BACKUP${NC}"
    else
        echo -e "${RED}❌ ERRO: Falha ao fazer backup do arquivo atual${NC}"
        exit 1
    fi
fi

# Restaurar o backup selecionado
echo "📥 Restaurando backup..."
if cp "$BACKUP_DIR/$SELECTED_BACKUP" "$DB_FILE"; then
    echo -e "${GREEN}✅ Backup restaurado com sucesso!${NC}"
    echo
    
    # Verificar se precisa reiniciar o serviço
    echo -e "${YELLOW}🔄 Reiniciando aplicação...${NC}"
    if pm2 restart ps-games-backend > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Aplicação reiniciada com sucesso!${NC}"
    else
        echo -e "${YELLOW}⚠️  Aviso: Não foi possível reiniciar automaticamente.${NC}"
        echo "Execute manualmente: pm2 restart ps-games-backend"
    fi
    
    echo
    echo -e "${GREEN}🎉 Restauração concluída com sucesso!${NC}"
    echo -e "${BLUE}Backup do arquivo anterior: $DB_BACKUP${NC}"
    
else
    echo -e "${RED}❌ ERRO: Falha ao restaurar backup${NC}"
    exit 1
fi 