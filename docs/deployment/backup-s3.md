# 🌥️ Backup AWS S3 - Redundância na Nuvem

## Visão Geral

Sistema de backup redundante que combina backup local com AWS S3, garantindo proteção total dos dados mesmo em caso de falha do servidor EC2.

## 🎯 Benefícios do S3

### ✅ **Vantagens**
- **Redundância**: Dados seguros mesmo se EC2 falhar
- **Durabilidade**: 99.999999999% (11 9's) de durabilidade
- **Automatização**: Backup automático para nuvem
- **Custo baixo**: ~$0.01-0.05/mês para backups
- **Versionamento**: Múltiplas versões dos backups
- **Lifecycle**: Redução automática de custos ao longo do tempo

### 💰 **Otimização de Custos**
- **30 dias**: Standard → Standard-IA (50% menor custo)
- **90 dias**: Standard-IA → Glacier (80% menor custo)
- **365 dias**: Glacier → Deep Archive (95% menor custo)
- **7 anos**: Remoção automática

## 🚀 Configuração Inicial

### 1. Configurar AWS CLI (Primeira vez)

```bash
# Conectar ao servidor
ssh -i ~/.ssh/ps-games-key.pem ec2-user@54.156.182.127

# Configurar AWS CLI
aws configure
```

**Você precisará:**
1. **Access Key ID**: Criar no AWS IAM
2. **Secret Access Key**: Gerado junto com Access Key
3. **Default region**: `us-east-1` (região gratuita)
4. **Default output format**: `json`

### 2. Criar usuário IAM para backup

1. Acesse: https://console.aws.amazon.com/iam/home#/users
2. Clique em "Add users"
3. Nome: `ps-games-backup`
4. Tipo: **Programmatic access**
5. Permissões: **AmazonS3FullAccess** (ou política customizada)
6. Gere e salve as credenciais

### 3. Executar configuração inicial

```bash
# No servidor EC2
./setup-s3-backup.sh
```

Este script irá:
- ✅ Criar bucket S3 único
- ✅ Configurar lifecycle para reduzir custos
- ✅ Habilitar versionamento
- ✅ Testar conectividade
- ✅ Salvar configurações

## 📂 Estrutura dos Backups

### Local
```
/home/ec2-user/backups/ps-games/
├── db_backup_20250605_143000.json
├── db_backup_20250604_143000.json
└── latest_backup.json -> [link para mais recente]
```

### AWS S3
```
s3://ps-games-backup-[timestamp]/
└── backups/
    ├── db_backup_20250605_143000.json
    ├── db_backup_20250604_143000.json
    └── latest_backup.json
```

## 🔧 Comandos Principais

### Backup Manual com S3
```bash
# Conectar ao servidor
ssh -i ~/.ssh/ps-games-key.pem ec2-user@54.156.182.127

# Executar backup com S3
./backup-s3.sh
```

### Restaurar Backup (Local ou S3)
```bash
# Conectar ao servidor
ssh -i ~/.ssh/ps-games-key.pem ec2-user@54.156.182.127

# Executar restauração interativa
./restore-s3.sh
```

### Listar Backups no S3
```bash
# Verificar configuração
cat ~/.ps-games-s3-config

# Listar backups no S3
source ~/.ps-games-s3-config
aws s3 ls s3://$S3_BUCKET_NAME/backups/
```

## 🤖 Automação

### Atualizar Cron para usar S3
```bash
# Editar cron
sudo crontab -u ec2-user -e

# Alterar linha para usar backup-s3.sh
0 3 * * * /home/ec2-user/backup-s3.sh >> /home/ec2-user/backups/cron.log 2>&1
```

### Verificar Status do Backup Automático
```bash
# Verificar último backup
tail -10 /home/ec2-user/backups/backup.log

# Verificar logs do cron
tail -10 /home/ec2-user/backups/cron.log
```

## 📊 Monitoramento

### Verificar Espaço Usado no S3
```bash
# Carregar configuração
source ~/.ps-games-s3-config

# Tamanho total no S3
aws s3 ls s3://$S3_BUCKET_NAME/backups/ --recursive --summarize

# Custo estimado (aproximado)
echo "Custo estimado: ~$0.01-0.05/mês"
```

### Verificar Último Backup
```bash
# Local
ls -la /home/ec2-user/backups/ps-games/latest_backup.json

# S3
source ~/.ps-games-s3-config
aws s3 ls s3://$S3_BUCKET_NAME/backups/latest_backup.json
```

## 🔄 Políticas de Retenção

### Local (30 backups)
- Mantém últimos 30 backups
- Remove automaticamente os mais antigos
- ~20MB de espaço total

### S3 (Lifecycle configurado)
- **0-30 dias**: Standard ($0.023/GB/mês)
- **30-90 dias**: Standard-IA ($0.0125/GB/mês)
- **90-365 dias**: Glacier ($0.004/GB/mês)
- **365+ dias**: Deep Archive ($0.00099/GB/mês)
- **7 anos**: Remoção automática

## 🚨 Recuperação de Desastres

### Cenário 1: Servidor EC2 foi perdido
```bash
# 1. Criar nova instância EC2
# 2. Instalar aplicação (usar deploy.sh)
# 3. Configurar AWS CLI
aws configure

# 4. Baixar último backup do S3
aws s3 cp s3://[bucket-name]/backups/latest_backup.json ~/db.json

# 5. Restaurar aplicação
cp ~/db.json /home/ec2-user/ps-games-catalog/backend/db.json
pm2 restart ps-games-backend
```

### Cenário 2: Dados corrompidos
```bash
# Usar script de restauração
./restore-s3.sh

# Escolher backup S3 mais recente íntegro
```

## 🔧 Troubleshooting

### AWS CLI não configurado
```bash
# Verificar configuração
aws sts get-caller-identity

# Se erro, reconfigurar
aws configure
```

### Erro de permissões S3
```bash
# Verificar permissões IAM
aws s3 ls

# Adicionar política S3FullAccess ao usuário IAM
```

### Backup S3 falhando
```bash
# Verificar logs
tail -20 /home/ec2-user/backups/backup.log

# Testar conectividade
aws s3 ls s3://[bucket-name]/
```

### Bucket não encontrado
```bash
# Verificar configuração
cat ~/.ps-games-s3-config

# Recriar bucket se necessário
./setup-s3-backup.sh
```

## 💡 Dicas Avançadas

### Backup para múltiplas regiões
```bash
# Configurar replicação cross-region no AWS Console
# S3 → Bucket → Management → Replication rules
```

### Alertas de falha via SNS
```bash
# Criar tópico SNS
aws sns create-topic --name ps-games-backup-alerts

# Modificar backup script para enviar alertas
```

### Compressão para reduzir custos
```bash
# Comprimir backup antes do upload
gzip backup_file.json
aws s3 cp backup_file.json.gz s3://bucket/backups/
```

### Criptografia adicional
```bash
# Upload com criptografia KMS
aws s3 cp file.json s3://bucket/file.json --sse aws:kms --sse-kms-key-id alias/aws/s3
```

## 📈 Estimativa de Custos

### Cenário Típico (672KB por backup, 1 backup/dia)
- **Armazenamento anual**: ~245MB
- **Custo Standard (primeiros 30 dias)**: ~$0.006/mês
- **Custo Standard-IA (30-90 dias)**: ~$0.003/mês  
- **Custo Glacier (90-365 dias)**: ~$0.001/mês
- **Custo Deep Archive (365+ dias)**: ~$0.0002/mês

**Total estimado anual: $0.12-0.60 (~R$ 0,60-3,00/ano)**

## ✅ Checklist de Verificação

- [ ] AWS CLI configurado
- [ ] Usuário IAM com permissões S3
- [ ] Bucket S3 criado e testado
- [ ] Lifecycle policy configurada
- [ ] Script de backup executando sem erros
- [ ] Cron job atualizado para usar backup-s3.sh
- [ ] Teste de restauração realizado
- [ ] Monitoramento de custos configurado

**Agora seus dados estão protegidos com redundância na nuvem! ☁️🛡️** 