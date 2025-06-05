#!/bin/bash

# PS Games Catalog - Restauração de Backup (Local + S3)
# Restaura o banco de dados a partir de backups locais ou S3

# Configurações
BACKUP_DIR="/home/ec2-user/backups/ps-games"
DB_FILE="/home/ec2-user/ps-games-catalog/backend/db.json"
DB_BACKUP="${DB_FILE}.backup_$(date +%Y%m%d_%H%M%S)"
S3_CONFIG_FILE="$HOME/.ps-games-s3-config"
TEMP_DIR="/tmp/ps-games-restore"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 PS Games Catalog - Restauração de Backup (Local + S3)${NC}"
echo

# Carregar configurações do S3
S3_ENABLED=false
if [ -f "$S3_CONFIG_FILE" ]; then
    source "$S3_CONFIG_FILE"
    if [ -n "$S3_BUCKET_NAME" ] && aws sts get-caller-identity >/dev/null 2>&1; then
        S3_ENABLED=true
        echo -e "${GREEN}✅ S3 configurado: $S3_BUCKET_NAME${NC}"
    else
        echo -e "${YELLOW}⚠️  S3 configurado mas sem acesso${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  S3 não configurado - apenas backups locais${NC}"
fi

# Verificar se o diretório de backup local existe
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ ERRO: Diretório de backup local não encontrado: $BACKUP_DIR${NC}"
    if [ "$S3_ENABLED" = "false" ]; then
        exit 1
    fi
fi

# Criar diretório temporário
mkdir -p "$TEMP_DIR"

# === LISTAR BACKUPS LOCAIS ===
echo -e "${YELLOW}📋 Verificando backups locais...${NC}"
LOCAL_BACKUPS=()
if [ -d "$BACKUP_DIR" ]; then
    cd "$BACKUP_DIR"
    LOCAL_BACKUPS=($(ls -1t db_backup_*.json 2>/dev/null))
    if [ ${#LOCAL_BACKUPS[@]} -gt 0 ]; then
        echo -e "${GREEN}✅ Encontrados ${#LOCAL_BACKUPS[@]} backups locais${NC}"
    else
        echo -e "${YELLOW}⚠️  Nenhum backup local encontrado${NC}"
    fi
fi

# === LISTAR BACKUPS S3 ===
S3_BACKUPS=()
if [ "$S3_ENABLED" = "true" ]; then
    echo -e "${CYAN}🌥️  Verificando backups no S3...${NC}"
    S3_LIST=$(aws s3 ls "s3://$S3_BUCKET_NAME/${S3_PREFIX}" | grep "db_backup_" | awk '{print $4}' | sort -r)
    if [ -n "$S3_LIST" ]; then
        while IFS= read -r line; do
            S3_BACKUPS+=("$line")
        done <<< "$S3_LIST"
        echo -e "${GREEN}✅ Encontrados ${#S3_BACKUPS[@]} backups no S3${NC}"
    else
        echo -e "${YELLOW}⚠️  Nenhum backup encontrado no S3${NC}"
    fi
fi

# Verificar se há backups disponíveis
TOTAL_BACKUPS=$((${#LOCAL_BACKUPS[@]} + ${#S3_BACKUPS[@]}))
if [ "$TOTAL_BACKUPS" -eq 0 ]; then
    echo -e "${RED}❌ Nenhum backup encontrado!${NC}"
    exit 1
fi

# === MOSTRAR MENU DE OPÇÕES ===
echo
echo -e "${BLUE}📋 Backups disponíveis:${NC}"
echo

option=1

# Mostrar backups locais
if [ ${#LOCAL_BACKUPS[@]} -gt 0 ]; then
    echo -e "${GREEN}=== BACKUPS LOCAIS ===${NC}"
    for i in "${!LOCAL_BACKUPS[@]}"; do
        BACKUP_FILE="${LOCAL_BACKUPS[$i]}"
        SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" 2>/dev/null | cut -f1 || echo "?")
        DATE=$(echo "$BACKUP_FILE" | sed 's/db_backup_\([0-9]\{8\}\)_\([0-9]\{6\}\).json/\1 \2/' | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\) \([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\3\/\2\/\1 \4:\5:\6/')
        
        if [ "$i" -eq 0 ]; then
            echo -e "${GREEN}$option) [LOCAL] $BACKUP_FILE ($SIZE) - $DATE [MAIS RECENTE]${NC}"
        else
            echo "$option) [LOCAL] $BACKUP_FILE ($SIZE) - $DATE"
        fi
        ((option++))
    done
fi

# Mostrar backups S3
if [ ${#S3_BACKUPS[@]} -gt 0 ]; then
    echo -e "${CYAN}=== BACKUPS S3 (NUVEM) ===${NC}"
    for i in "${!S3_BACKUPS[@]}"; do
        BACKUP_FILE="${S3_BACKUPS[$i]}"
        DATE=$(echo "$BACKUP_FILE" | sed 's/db_backup_\([0-9]\{8\}\)_\([0-9]\{6\}\).json/\1 \2/' | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\) \([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\3\/\2\/\1 \4:\5:\6/')
        
        if [ "$i" -eq 0 ] && [ ${#LOCAL_BACKUPS[@]} -eq 0 ]; then
            echo -e "${CYAN}$option) [S3] $BACKUP_FILE - $DATE [MAIS RECENTE]${NC}"
        else
            echo "$option) [S3] $BACKUP_FILE - $DATE"
        fi
        ((option++))
    done
fi

echo
echo -e "${BLUE}0) Cancelar${NC}"
echo

# === SOLICITAR ESCOLHA ===
while true; do
    read -p "Escolha o backup para restaurar (0-$((option-1))): " choice
    
    if [ "$choice" = "0" ]; then
        echo -e "${YELLOW}Operação cancelada.${NC}"
        rm -rf "$TEMP_DIR"
        exit 0
    elif [ "$choice" -ge 1 ] && [ "$choice" -lt "$option" ]; then
        break
    else
        echo -e "${RED}Opção inválida. Escolha entre 0 e $((option-1)).${NC}"
    fi
done

# === DETERMINAR ORIGEM DO BACKUP ===
if [ "$choice" -le "${#LOCAL_BACKUPS[@]}" ]; then
    # Backup local
    SELECTED_BACKUP="${LOCAL_BACKUPS[$((choice-1))]}"
    BACKUP_SOURCE="LOCAL"
    BACKUP_PATH="$BACKUP_DIR/$SELECTED_BACKUP"
else
    # Backup S3
    S3_INDEX=$((choice - ${#LOCAL_BACKUPS[@]} - 1))
    SELECTED_BACKUP="${S3_BACKUPS[$S3_INDEX]}"
    BACKUP_SOURCE="S3"
    BACKUP_PATH="$TEMP_DIR/$SELECTED_BACKUP"
fi

echo
echo -e "${YELLOW}⚠️  ATENÇÃO: Esta operação irá substituir o banco de dados atual!${NC}"
echo -e "${BLUE}Backup selecionado: [$BACKUP_SOURCE] $SELECTED_BACKUP${NC}"
echo

# === CONFIRMAÇÃO FINAL ===
while true; do
    read -p "Tem certeza que deseja continuar? (s/N): " confirm
    case $confirm in
        [Ss]* ) break;;
        [Nn]* | "" ) 
            echo -e "${YELLOW}Operação cancelada.${NC}"
            rm -rf "$TEMP_DIR"
            exit 0;;
        * ) echo "Digite 's' para sim ou 'n' para não.";;
    esac
done

echo
echo -e "${YELLOW}🔄 Iniciando restauração...${NC}"

# === BAIXAR DO S3 SE NECESSÁRIO ===
if [ "$BACKUP_SOURCE" = "S3" ]; then
    echo -e "${CYAN}☁️  Baixando backup do S3...${NC}"
    S3_PATH="s3://$S3_BUCKET_NAME/${S3_PREFIX}$SELECTED_BACKUP"
    
    if aws s3 cp "$S3_PATH" "$BACKUP_PATH"; then
        echo -e "${GREEN}✅ Backup baixado do S3 com sucesso${NC}"
    else
        echo -e "${RED}❌ ERRO: Falha ao baixar backup do S3${NC}"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
fi

# === BACKUP DO ARQUIVO ATUAL ===
if [ -f "$DB_FILE" ]; then
    echo "📁 Fazendo backup do arquivo atual..."
    if cp "$DB_FILE" "$DB_BACKUP"; then
        echo -e "${GREEN}✅ Backup atual salvo em: $DB_BACKUP${NC}"
    else
        echo -e "${RED}❌ ERRO: Falha ao fazer backup do arquivo atual${NC}"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
fi

# === RESTAURAR O BACKUP ===
echo "📥 Restaurando backup..."
if cp "$BACKUP_PATH" "$DB_FILE"; then
    echo -e "${GREEN}✅ Backup restaurado com sucesso!${NC}"
    echo
    
    # === REINICIAR APLICAÇÃO ===
    echo -e "${YELLOW}🔄 Reiniciando aplicação...${NC}"
    if pm2 restart ps-games-backend > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Aplicação reiniciada com sucesso!${NC}"
    else
        echo -e "${YELLOW}⚠️  Aviso: Não foi possível reiniciar automaticamente.${NC}"
        echo "Execute manualmente: pm2 restart ps-games-backend"
    fi
    
    # === CRIAR BACKUP LOCAL SE VEIO DO S3 ===
    if [ "$BACKUP_SOURCE" = "S3" ] && [ -d "$BACKUP_DIR" ]; then
        echo -e "${CYAN}💾 Salvando cópia local do backup S3...${NC}"
        cp "$BACKUP_PATH" "$BACKUP_DIR/$SELECTED_BACKUP"
        echo -e "${GREEN}✅ Cópia local criada${NC}"
    fi
    
    echo
    echo -e "${GREEN}🎉 Restauração concluída com sucesso!${NC}"
    echo -e "${BLUE}Origem: [$BACKUP_SOURCE] $SELECTED_BACKUP${NC}"
    echo -e "${BLUE}Backup do arquivo anterior: $DB_BACKUP${NC}"
    
else
    echo -e "${RED}❌ ERRO: Falha ao restaurar backup${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Limpeza
rm -rf "$TEMP_DIR" 