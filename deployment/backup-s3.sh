#!/bin/bash

# PS Games Catalog - Backup Automático com AWS S3
# Faz backup local e sincroniza com AWS S3

# Configurações
BACKUP_DIR="/home/ec2-user/backups/ps-games"
DB_FILE="/home/ec2-user/ps-games-catalog/backend/db.json"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="db_backup_${TIMESTAMP}.json"
LOG_FILE="/home/ec2-user/backups/backup.log"
S3_CONFIG_FILE="$HOME/.ps-games-s3-config"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Função para log colorido no terminal
log_color() {
    echo -e "${2}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

echo "🔄 PS Games Catalog - Backup com S3"
log "=== BACKUP S3 INICIADO ==="

# Carregar configurações do S3
if [ -f "$S3_CONFIG_FILE" ]; then
    source "$S3_CONFIG_FILE"
    log_color "✅ Configuração S3 carregada: $S3_BUCKET_NAME" "$GREEN"
else
    log_color "⚠️  Configuração S3 não encontrada. Executando apenas backup local..." "$YELLOW"
    S3_ENABLED=false
fi

# Criar diretório de backup se não existir
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    log_color "Diretório de backup criado: $BACKUP_DIR" "$GREEN"
fi

# Verificar se o arquivo de banco existe
if [ ! -f "$DB_FILE" ]; then
    log_color "ERRO: Arquivo de banco não encontrado: $DB_FILE" "$RED"
    exit 1
fi

# === BACKUP LOCAL ===
log_color "📁 Fazendo backup local..." "$YELLOW"
if cp "$DB_FILE" "$BACKUP_DIR/$BACKUP_FILE"; then
    # Calcular tamanho do arquivo
    SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    log_color "✅ Backup local realizado: $BACKUP_FILE ($SIZE)" "$GREEN"
    
    # Criar link simbólico para o backup mais recente
    ln -sf "$BACKUP_FILE" "$BACKUP_DIR/latest_backup.json"
    log "Link simbólico atualizado para backup mais recente"
else
    log_color "❌ ERRO: Falha ao fazer backup local" "$RED"
    exit 1
fi

# === BACKUP S3 ===
if [ "$S3_ENABLED" != "false" ] && [ -n "$S3_BUCKET_NAME" ]; then
    log_color "🌥️  Fazendo backup para AWS S3..." "$BLUE"
    
    # Verificar conectividade com AWS
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        log_color "❌ ERRO: AWS CLI não configurado ou sem acesso" "$RED"
        log_color "⚠️  Backup local realizado, mas S3 falhou" "$YELLOW"
    else
        # Upload do backup atual para S3
        S3_PATH="s3://$S3_BUCKET_NAME/${S3_PREFIX}$BACKUP_FILE"
        
        if aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" "$S3_PATH"; then
            log_color "✅ Backup enviado para S3: $S3_PATH" "$GREEN"
            
            # Atualizar link do backup mais recente no S3
            LATEST_S3_PATH="s3://$S3_BUCKET_NAME/${S3_PREFIX}latest_backup.json"
            if aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" "$LATEST_S3_PATH"; then
                log "✅ Link mais recente atualizado no S3"
            fi
            
            # Sincronizar histórico de backups (últimos 10)
            log_color "🔄 Sincronizando histórico com S3..." "$BLUE"
            cd "$BACKUP_DIR"
            RECENT_BACKUPS=$(ls -1t db_backup_*.json | head -10)
            
            for backup in $RECENT_BACKUPS; do
                S3_BACKUP_PATH="s3://$S3_BUCKET_NAME/${S3_PREFIX}$backup"
                if ! aws s3 ls "$S3_BACKUP_PATH" >/dev/null 2>&1; then
                    if aws s3 cp "$backup" "$S3_BACKUP_PATH"; then
                        log "📤 Backup histórico enviado: $backup"
                    fi
                fi
            done
            
        else
            log_color "❌ ERRO: Falha ao enviar para S3" "$RED"
            log_color "⚠️  Backup local realizado, mas S3 falhou" "$YELLOW"
        fi
    fi
else
    log_color "⚠️  S3 não configurado - apenas backup local" "$YELLOW"
fi

# === LIMPEZA LOCAL ===
# Contar backups existentes
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/db_backup_*.json 2>/dev/null | wc -l)
log "Total de backups locais: $BACKUP_COUNT"

# Limpeza automática - manter apenas os últimos 30 backups locais
MAX_BACKUPS=30
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    log_color "🗑️  Limpando backups locais antigos (mantendo últimos $MAX_BACKUPS)..." "$YELLOW"
    cd "$BACKUP_DIR"
    ls -1t db_backup_*.json | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm
    REMOVED=$((BACKUP_COUNT - MAX_BACKUPS))
    log_color "🗑️  Removidos $REMOVED backups locais antigos" "$GREEN"
fi

# === LIMPEZA S3 ===
if [ "$S3_ENABLED" != "false" ] && [ -n "$S3_BUCKET_NAME" ]; then
    log_color "🌥️  Verificando limpeza S3..." "$BLUE"
    
    # Listar backups no S3 e manter apenas os últimos 90
    S3_BACKUPS=$(aws s3 ls "s3://$S3_BUCKET_NAME/${S3_PREFIX}" --recursive | grep "db_backup_" | wc -l)
    log "Total de backups no S3: $S3_BACKUPS"
    
    if [ "$S3_BACKUPS" -gt 90 ]; then
        log_color "🗑️  Limpeza automática S3 (lifecycle policy ativa)" "$YELLOW"
    fi
fi

# === ESTATÍSTICAS FINAIS ===
FINAL_COUNT=$(ls -1 "$BACKUP_DIR"/db_backup_*.json 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

log_color "📊 Estatísticas do Backup:" "$GREEN"
log "- Backups locais: $FINAL_COUNT"
log "- Espaço local: $TOTAL_SIZE"
log "- Último backup: $BACKUP_FILE"

if [ "$S3_ENABLED" != "false" ] && [ -n "$S3_BUCKET_NAME" ]; then
    # Verificar tamanho total no S3
    S3_SIZE=$(aws s3 ls "s3://$S3_BUCKET_NAME/${S3_PREFIX}" --recursive --summarize | grep "Total Size" | awk '{print $3}')
    if [ -n "$S3_SIZE" ]; then
        S3_SIZE_MB=$((S3_SIZE / 1024 / 1024))
        log "- Backups S3: ~${S3_SIZE_MB}MB no bucket $S3_BUCKET_NAME"
    fi
fi

log "=== BACKUP S3 CONCLUÍDO ==="
echo "✅ Backup concluído com sucesso!"

# Verificar se há alertas de custo (opcional)
if [ "$S3_ENABLED" != "false" ] && [ -n "$S3_BUCKET_NAME" ]; then
    echo -e "${BLUE}💰 Custo estimado S3: ~\$0.01-0.05/mês para backups${NC}"
fi 