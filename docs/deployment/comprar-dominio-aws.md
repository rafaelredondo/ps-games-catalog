# 🛒 Comprar Domínio na AWS - Passo a Passo

## 🎯 Objetivo
Comprar domínio novo na AWS Route 53 e configurar para sua aplicação PS Games Catalog.

## 💰 Custos
- **Domínio .com**: ~$12-15/ano  
- **Hosted Zone**: $0.50/mês
- **SSL**: $0 (Let's Encrypt)
- **Total**: ~$18/ano

---

## 🛒 Passo 1: Comprar Domínio

### **1.1 Acessar Route 53**
1. [AWS Console](https://console.aws.amazon.com) → Route 53
2. No painel, clique **"Register domains"**

### **1.2 Buscar Domínio Disponível**

```
🔍 Sugestões para PS Games Catalog:
┌─────────────────────────────────┐
│ meusgames.com                   │
│ gamespy.com                     │  
│ pscatalog.com                   │
│ mygameslib.com                  │
│ psthek.com                      │
│ jogosp.com                      │
│ cataloggames.com                │
└─────────────────────────────────┘
```

**Digite sua opção** na barra de busca.

### **1.3 Verificar Disponibilidade**

```
🟢 meusgames.com - Available ($12/year)
🔴 games.com - Not available  
🟡 meusgames.net - Available ($12/year)
```

### **1.4 Adicionar ao Carrinho**
1. Clique **"Add to cart"** no domínio escolhido
2. **Duration**: 1 year (pode renovar depois)
3. **Auto-renew**: ✅ (recomendado)

### **1.5 Preencher Informações de Contato**

```
Contact Information:
┌─────────────────────────────────┐
│ First name: Seu Nome            │
│ Last name: Seu Sobrenome        │
│ Email: seu_email@gmail.com      │
│ Phone: +55 11 99999-9999        │
│ Address: Seu endereço           │
│ City: Sua cidade                │
│ State: SP                       │
│ Postal code: 00000-000          │
│ Country: Brazil                 │
└─────────────────────────────────┘
```

### **1.6 Configurações Avançadas**

```
Domain settings:
┌─────────────────────────────────┐
│ ✅ Privacy protection           │
│ ✅ Auto-renew                   │
│ ❌ Transfer lock (opcional)     │
└─────────────────────────────────┘
```

### **1.7 Finalizar Compra**
1. **Review & purchase**
2. **Accept terms**
3. **Complete purchase**

**⏱️ Processamento**: 5-15 minutos

---

## 🔧 Passo 2: Configurar DNS

### **2.1 Verificar Hosted Zone**
Após compra, Route 53 **automaticamente** cria a Hosted Zone.

1. Route 53 → **"Hosted zones"**
2. Deve aparecer: `meusgames.com`

### **2.2 Adicionar Registros A**

Na Hosted Zone `meusgames.com`:

#### **Registro Principal:**
```
Record name: (deixe vazio)
Record type: A
Value: 54.156.182.127  # SEU IP EC2
TTL: 300
```

#### **Registro WWW:**
```
Record name: www
Record type: A
Value: 54.156.182.127  # SEU IP EC2  
TTL: 300
```

### **2.3 Criar os Registros**
1. **"Create record"**
2. Preencha conforme acima
3. **"Create records"**

---

## 🔒 Passo 3: Configurar SSL na EC2

### **3.1 SSH na EC2**
```bash
ssh -i ~/.ssh/ps-games-key.pem ec2-user@54.156.182.127
```

### **3.2 Aguardar Propagação DNS (15-60 min)**
```bash
# Testar se DNS está funcionando
nslookup meusgames.com
```

**Deve retornar:** `54.156.182.127`

### **3.3 Instalar Certbot**
```bash
# Instalar dependências
sudo yum install -y python3-pip

# Instalar Certbot
sudo pip3 install certbot certbot-nginx

# Ou alternativa:
sudo amazon-linux-extras install epel -y
sudo yum install -y certbot python3-certbot-nginx
```

### **3.4 Obter Certificado SSL**
```bash
# Substituir pelo SEU domínio
sudo certbot --nginx -d meusgames.com -d www.meusgames.com
```

**Responder às perguntas:**
```
Email: seu_email@gmail.com
Terms: Y
Share email: N
```

### **3.5 Configurar Renovação Automática**
```bash
# Editar crontab
sudo crontab -e

# Adicionar linha (pressionar 'i' para inserir):
0 12 * * * /usr/local/bin/certbot renew --quiet

# Salvar: ESC, :wq, ENTER
```

---

## ✅ Passo 4: Atualizar Configurações

### **4.1 Verificar nginx**
```bash
sudo cat /etc/nginx/conf.d/ps-games.conf
```

**Certbot automaticamente adiciona:**
- ✅ Redirecionamento HTTP → HTTPS
- ✅ Configuração SSL
- ✅ Security headers

### **4.2 Atualizar Script de Deploy**
```bash
# No seu computador local
nano deployment/deploy.sh

# Trocar:
EC2_HOST="54.156.182.127"

# Por:
EC2_HOST="meusgames.com"
```

### **4.3 Teste Final**
```bash
# Testar HTTPS
curl -I https://meusgames.com

# Deve retornar: HTTP/2 200
```

---

## 🎉 Resultado Final

### **URLs Funcionando:**
- ✅ `https://meusgames.com`
- ✅ `https://www.meusgames.com`  
- ✅ `http://meusgames.com` → redireciona para HTTPS

### **Verificações:**
- 🔒 **Cadeado verde** no navegador
- 🚀 **SSL A+** rating
- 🔄 **Auto-renewal** configurado
- 📱 **Mobile-friendly**

### **Deploy Atualizado:**
```bash
./deployment/deploy.sh deploy
# Agora usa domínio!
```

---

## 🚨 Troubleshooting

### **DNS não resolve:**
```bash
# Aguardar até 1 hora
# Testar:
dig meusgames.com
nslookup meusgames.com
```

### **SSL falha:**
```bash
# Verificar se DNS resolve primeiro
nslookup meusgames.com

# Tentar novamente:
sudo certbot --nginx -d meusgames.com -d www.meusgames.com
```

### **Domínio não carrega:**
- Verificar Security Group (portas 80, 443)
- Verificar nginx: `sudo systemctl status nginx`
- Verificar backend: `pm2 status`

---

## 📋 Checklist Completo

### **☑️ Compra do Domínio:**
- [ ] Domínio comprado na AWS
- [ ] Hosted Zone criada automaticamente
- [ ] Informações de contato corretas

### **☑️ Configuração DNS:**
- [ ] Registro A para domínio principal
- [ ] Registro A para www
- [ ] DNS propagado (teste: `nslookup`)

### **☑️ Configuração SSL:**
- [ ] Certbot instalado
- [ ] Certificados obtidos
- [ ] Renovação automática configurada
- [ ] nginx configurado para HTTPS

### **☑️ Testes Finais:**
- [ ] `https://meusgames.com` carrega
- [ ] `https://www.meusgames.com` carrega
- [ ] Cadeado verde aparece
- [ ] HTTP redireciona para HTTPS
- [ ] Login funciona no domínio
- [ ] Deploy script atualizado

---

## 💡 Próximos Passos Opcionais

### **Performance:**
- CloudFront CDN (acelerar global)
- Gzip compression (já configurado)
- Cache headers otimizados

### **Monitoramento:**
- CloudWatch logs
- Uptime monitoring
- SSL monitoring

### **Backup:**
- Route 53 backup
- EC2 snapshots automáticos
- Database backup

---

**🎯 Parabéns! Sua aplicação agora tem domínio profissional com HTTPS!**

**De:** `http://54.156.182.127`  
**Para:** `https://meusgames.com` 🌟 