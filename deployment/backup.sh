#!/bin/bash

# PS Games Catalog - Backup Automático
# Faz backup do banco de dados JSON e mantém histórico

# Configurações
BACKUP_DIR="/home/ec2-user/backups/ps-games"
DB_FILE="/home/ec2-user/ps-games-catalog/backend/db.json"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="db_backup_${TIMESTAMP}.json"
LOG_FILE="/home/ec2-user/backups/backup.log"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

echo "🔄 PS Games Catalog - Backup Iniciado"
log "=== BACKUP INICIADO ==="

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

# Fazer backup
log_color "Fazendo backup do banco de dados..." "$YELLOW"
if cp "$DB_FILE" "$BACKUP_DIR/$BACKUP_FILE"; then
    # Calcular tamanho do arquivo
    SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    log_color "✅ Backup realizado com sucesso: $BACKUP_FILE ($SIZE)" "$GREEN"
    
    # Criar link simbólico para o backup mais recente
    ln -sf "$BACKUP_FILE" "$BACKUP_DIR/latest_backup.json"
    log "Link simbólico atualizado para backup mais recente"
else
    log_color "❌ ERRO: Falha ao fazer backup" "$RED"
    exit 1
fi

# Contar backups existentes
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/db_backup_*.json 2>/dev/null | wc -l)
log "Total de backups existentes: $BACKUP_COUNT"

# Limpeza automática - manter apenas os últimos 30 backups
MAX_BACKUPS=30
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    log_color "Limpando backups antigos (mantendo últimos $MAX_BACKUPS)..." "$YELLOW"
    cd "$BACKUP_DIR"
    ls -1t db_backup_*.json | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm
    REMOVED=$((BACKUP_COUNT - MAX_BACKUPS))
    log_color "🗑️  Removidos $REMOVED backups antigos" "$GREEN"
fi

# Estatísticas finais
FINAL_COUNT=$(ls -1 "$BACKUP_DIR"/db_backup_*.json 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

log_color "📊 Estatísticas do Backup:" "$GREEN"
log "- Backups mantidos: $FINAL_COUNT"
log "- Espaço total usado: $TOTAL_SIZE"
log "- Último backup: $BACKUP_FILE"

log "=== BACKUP CONCLUÍDO ==="
echo "✅ Backup concluído com sucesso!" 