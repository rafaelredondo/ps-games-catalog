# 🌐 Configurar Domínio Próprio + SSL Gratuito

## 🎯 Objetivo
Configurar domínio personalizado (ex: `meusgames.com`) com **HTTPS gratuito** para sua aplicação.

## 💰 Custo
- **Route 53 Hosted Zone**: $0.50/mês
- **SSL Certificate**: $0 (Let's Encrypt)
- **Total**: $0.50/mês

---

## 🚀 Passo a Passo

### **Etapa 1: Registrar/Configurar Domínio**

#### **Opção A: Comprar domínio na AWS**
1. Acesse [Route 53 Console](https://console.aws.amazon.com/route53/)
2. Clique em **"Register domain"**
3. Escolha seu domínio (ex: `meusgames.com`)
4. Complete a compra ($12-15/ano)

#### **Opção B: Usar domínio existente**
Se já tem domínio em outro lugar (GoDaddy, Namecheap, etc.), pode configurar DNS para AWS.

### **Etapa 2: Criar Hosted Zone no Route 53**

1. No **Route 53 Console**, clique em **"Hosted zones"**
2. Clique em **"Create hosted zone"**

```
Domain name: meusgames.com
Type: ✅ Public hosted zone
Comment: PS Games Catalog Domain
```

3. Clique **"Create hosted zone"**

### **Etapa 3: Configurar Registros DNS**

Na sua **Hosted Zone**, você verá registros NS e SOA. Adicione:

#### **Registro A (Principal):**
```
Record name: (deixe vazio ou @)
Record type: A
Value: 3.85.160.104  # SEU IP DA EC2
TTL: 300
```

#### **Registro A (WWW):**
```
Record name: www
Record type: A  
Value: 3.85.160.104  # SEU IP DA EC2
TTL: 300
```

#### **Criar os registros:**
1. Clique **"Create record"**
2. Configure conforme acima
3. Clique **"Create records"**

### **Etapa 4: Atualizar Name Servers (se domínio externo)**

Se comprou domínio fora da AWS:
1. Copie os **4 Name Servers** da Hosted Zone
2. Configure no seu registrador de domínio

**Aguarde 24-48h para propagação DNS**

---

## 🔒 Configurar SSL (HTTPS) Gratuito

### **Etapa 5: Instalar Certbot na EC2**

```bash
# SSH na sua EC2
ssh -i ~/.ssh/ps-games-key.pem ec2-user@3.85.160.104

# Instalar Certbot
sudo yum install -y python3-pip
sudo pip3 install certbot certbot-nginx

# Ou via Amazon Linux Extras
sudo amazon-linux-extras install epel -y
sudo yum install -y certbot python3-certbot-nginx
```

### **Etapa 6: Obter Certificado SSL**

```bash
# Substituir meusgames.com pelo SEU domínio
sudo certbot --nginx -d meusgames.com -d www.meusgames.com
```

**Durante a configuração:**
```
Email: seu_email@gmail.com
Terms: Y
Share email: N (opcional)
```

### **Etapa 7: Teste do SSL**

Acesse: `https://meusgames.com`

Deve aparecer **cadeado verde** 🔒

### **Etapa 8: Configurar Renovação Automática**

```bash
# Adicionar cron job para renovação
sudo crontab -e

# Adicionar esta linha:
0 12 * * * /usr/local/bin/certbot renew --quiet
```

---

## 🔧 Configuração nginx para HTTPS

### **Configuração gerada pelo Certbot:**

O Certbot **automaticamente** modifica o nginx para:
- ✅ Redirecionar HTTP → HTTPS
- ✅ Configurar certificados SSL
- ✅ Headers de segurança

### **Verificar configuração:**

```bash
sudo cat /etc/nginx/conf.d/ps-games.conf
```

Deve ter algo como:
```nginx
server {
    listen 80;
    server_name meusgames.com www.meusgames.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name meusgames.com www.meusgames.com;
    
    ssl_certificate /etc/letsencrypt/live/meusgames.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/meusgames.com/privkey.pem;
    
    # Resto da configuração...
}
```

---

## ✅ Verificação Final

### **1. Teste DNS:**
```bash
# No seu computador
nslookup meusgames.com
dig meusgames.com
```

### **2. Teste HTTPS:**
```bash
curl -I https://meusgames.com
```

### **3. Teste SSL Grade:**
Acesse: [SSL Labs Test](https://www.ssllabs.com/ssltest/)

### **4. Verificar no navegador:**
- ✅ `https://meusgames.com` carrega
- ✅ Cadeado verde aparece
- ✅ `http://meusgames.com` redireciona para HTTPS

---

## 🔄 Atualizar Script de Deploy

### **Atualizar deploy.sh:**

```bash
# No seu computador local
nano deployment/deploy.sh

# Trocar:
EC2_HOST="3.85.160.104"

# Por:
EC2_HOST="meusgames.com"
```

Agora pode fazer deploy usando domínio:
```bash
./deployment/deploy.sh deploy
```

---

## 🚨 Troubleshooting

### **DNS não resolve:**
- Aguardar 24-48h propagação
- Verificar Name Servers no registrador
- Testar: `dig +trace meusgames.com`

### **SSL não funciona:**
```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew --dry-run

# Verificar nginx
sudo nginx -t
sudo systemctl reload nginx
```

### **Erro 502/504:**
- Backend deve estar rodando
- Verificar: `pm2 status`
- Verificar firewall EC2 (Security Group)

---

## 🎉 Resultado Final

Após configuração completa:

### **URLs funcionando:**
- ✅ `https://meusgames.com`
- ✅ `https://www.meusgames.com`
- ✅ `http://meusgames.com` → redireciona para HTTPS

### **Características:**
- 🔒 **SSL A+** (Let's Encrypt)
- 🚀 **Performance** otimizada
- 🛡️ **Security headers**
- 🔄 **Auto-renewal** SSL
- 💰 **Custo**: $0.50/mês

### **Deploy atualizado:**
```bash
./deployment/deploy.sh deploy
# Agora usa domínio em vez de IP!
```

---

**🎯 Sua aplicação agora é 100% profissional com domínio próprio e HTTPS!** 