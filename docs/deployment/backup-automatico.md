# 🔄 Sistema de Backup Automático

## Visão Geral

O PS Games Catalog possui um sistema completo de backup automático que protege seus dados contra perda acidental. O sistema faz backup do arquivo JSON que contém todos os jogos cadastrados.

## 📂 Estrutura de Arquivos

```
/home/ec2-user/
├── backup.sh              # Script de backup
├── restore.sh             # Script de restauração
└── backups/
    ├── ps-games/          # Diretório dos backups
    │   ├── db_backup_YYYYMMDD_HHMMSS.json
    │   └── latest_backup.json -> [link para backup mais recente]
    ├── backup.log         # Log dos backups
    └── cron.log          # Log dos cron jobs
```

## ⚙️ Configuração Automática

### Agenda de Backups
- **Diário**: Todo dia às 3:00 da manhã
- **Histórico**: Mantém os últimos 30 backups
- **Limpeza**: Remove backups antigos automaticamente
- **Logs**: Registra todas as operações

### Verificar Cron Jobs
```bash
sudo crontab -u ec2-user -l
```

### Visualizar Logs
```bash
# Log dos backups
tail -f /home/ec2-user/backups/backup.log

# Log do cron
tail -f /home/ec2-user/backups/cron.log
```

## 🔧 Comandos Manuais

### Fazer Backup Manualmente
```bash
# Conectar ao servidor
ssh -i ~/.ssh/ps-games-key.pem ec2-user@3.85.160.104

# Executar backup
./backup.sh
```

### Restaurar Backup
```bash
# Conectar ao servidor
ssh -i ~/.ssh/ps-games-key.pem ec2-user@3.85.160.104

# Executar restauração (interativo)
./restore.sh
```

## 📊 Informações dos Backups

### Listar Backups Disponíveis
```bash
ls -la /home/ec2-user/backups/ps-games/
```

### Verificar Tamanho Total
```bash
du -sh /home/ec2-user/backups/
```

### Verificar Último Backup
```bash
ls -la /home/ec2-user/backups/ps-games/latest_backup.json
```

## 🎯 Funcionalidades

### Script de Backup (`backup.sh`)
- ✅ Backup timestampado do db.json
- ✅ Link simbólico para backup mais recente
- ✅ Limpeza automática (mantém 30 backups)
- ✅ Logs detalhados com cores
- ✅ Verificação de integridade
- ✅ Cálculo de espaço utilizado

### Script de Restauração (`restore.sh`)
- ✅ Interface interativa para escolha do backup
- ✅ Lista backups por data (mais recente primeiro)
- ✅ Backup de segurança antes da restauração
- ✅ Confirmação dupla para evitar acidentes
- ✅ Reinicialização automática da aplicação
- ✅ Validação de arquivos

## 🚨 Emergência - Restauração Rápida

Se precisar restaurar rapidamente:

```bash
# 1. Conectar ao servidor
ssh -i ~/.ssh/ps-games-key.pem ec2-user@3.85.160.104

# 2. Restaurar último backup
cp /home/ec2-user/backups/ps-games/latest_backup.json \
   /home/ec2-user/ps-games-catalog/backend/db.json

# 3. Reiniciar aplicação
pm2 restart ps-games-backend
```

## 📈 Monitoramento

### Verificar Status dos Backups
```bash
# Último backup executado
tail -1 /home/ec2-user/backups/backup.log

# Quantidade de backups
ls -1 /home/ec2-user/backups/ps-games/db_backup_*.json | wc -l

# Espaço usado pelos backups
du -sh /home/ec2-user/backups/ps-games/
```

### Alertas Automáticos (Opcional)
Para receber alertas em caso de falha nos backups, você pode:

1. **Configurar notificações por email** via AWS SES
2. **Usar AWS CloudWatch** para monitorar logs
3. **Integrar com Slack/Discord** via webhooks

## 🔧 Manutenção

### Alterar Frequência de Backup
```bash
# Editar crontab
sudo crontab -u ec2-user -e

# Exemplos de frequência:
# A cada hora: 0 * * * *
# A cada 2 horas: 0 */2 * * *
# Duas vezes ao dia: 0 6,18 * * *
```

### Alterar Número de Backups Mantidos
Edite o arquivo `backup.sh` e modifique:
```bash
MAX_BACKUPS=30  # Altere para o número desejado
```

### Backup para Cloud (AWS S3)
Para backup adicional na nuvem:

```bash
# Instalar AWS CLI
sudo yum install -y awscli

# Configurar credenciais
aws configure

# Adicionar ao script de backup
aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" s3://meu-bucket-backup/ps-games/
```

## ✅ Verificação de Funcionamento

Para garantir que o sistema está funcionando:

1. **Verificar se o cron está rodando**:
   ```bash
   sudo systemctl status crond
   ```

2. **Testar backup manual**:
   ```bash
   ./backup.sh
   ```

3. **Verificar logs**:
   ```bash
   tail /home/ec2-user/backups/backup.log
   ```

4. **Simular restauração**:
   ```bash
   ./restore.sh
   ```

## 📞 Suporte

Se houver problemas com o sistema de backup:

1. Verifique os logs em `/home/ec2-user/backups/`
2. Confirme se o serviço cron está rodando
3. Teste a execução manual dos scripts
4. Verifique as permissões dos arquivos (`chmod +x`)

O sistema foi projetado para ser robusto e confiável, garantindo que seus dados estejam sempre protegidos! 🛡️ 