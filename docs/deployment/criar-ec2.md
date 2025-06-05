# 🏗️ Como Criar Instância EC2 - Passo a Passo

## 🎯 Objetivo
Criar uma instância EC2 t2.micro (Free Tier) para hospedar o PS Games Catalog.

## 🚀 Passo a Passo

### **Etapa 1: Acessar AWS Console**

1. Acesse [AWS Console](https://aws.amazon.com/console/)
2. Faça login com sua conta AWS
3. Na barra de busca, digite "EC2" e selecione **EC2**

### **Etapa 2: Iniciar Criação da Instância**

1. No painel EC2, clique em **"Launch Instance"** (botão laranja)
2. Você verá a tela "Launch an instance"

### **Etapa 3: Configurar Nome e Tags**

```
Nome e tags:
┌─────────────────────────────────────┐
│ Name: ps-games-catalog              │
│                                     │
│ ✅ Add additional tags (opcional)   │
└─────────────────────────────────────┘
```

### **Etapa 4: Escolher Sistema Operacional**

```
Application and OS Images (Amazon Machine Image):
┌─────────────────────────────────────┐
│ ✅ Amazon Linux                     │
│    Amazon Linux 2023 AMI            │
│    🏷️ Free tier eligible            │
│                                     │
│    64-bit (x86)                     │
└─────────────────────────────────────┘
```

**❗ IMPORTANTE**: Certifique-se que está selecionado **Amazon Linux 2023** e tem o selo **"Free tier eligible"**

### **Etapa 5: Escolher Tipo de Instância**

```
Instance type:
┌─────────────────────────────────────┐
│ ✅ t2.micro                         │
│    1 vCPU, 1 GiB Memory             │
│    🏷️ Free tier eligible            │
│                                     │
│    [ ] Include instance types beyond │
│        the free tier                │
└─────────────────────────────────────┘
```

### **Etapa 6: Configurar Chave SSH (KEY PAIR)**

```
Key pair (login):
┌─────────────────────────────────────┐
│ Opção A - Criar Nova:               │
│ ⭕ Create new key pair              │
│    Name: ps-games-key               │
│    Type: RSA                        │
│    Format: .pem                     │
│    [Create key pair]                │
│                                     │
│ Opção B - Usar Existente:          │
│ ⭕ Choose existing key pair         │
│    [Dropdown com suas chaves]       │
└─────────────────────────────────────┘
```

**💾 SE CRIAR NOVA**: O arquivo `.pem` será baixado automaticamente. **GUARDE-O COM SEGURANÇA!**

### **Etapa 7: Configurar Security Group (FIREWALL)**

```
Network settings:
┌─────────────────────────────────────┐
│ ✅ Create security group            │
│                                     │
│ Security group name:                │
│ ps-games-catalog-sg                 │
│                                     │
│ Description:                        │
│ Security group for PS Games Catalog │
│                                     │
│ Inbound security group rules:       │
│ ┌─────────────────────────────────┐ │
│ │ Type    │ Port  │ Source        │ │
│ │ SSH     │ 22    │ My IP         │ │
│ │ HTTP    │ 80    │ 0.0.0.0/0     │ │
│ │ HTTPS   │ 443   │ 0.0.0.0/0     │ │
│ │ Custom  │ 3000  │ 0.0.0.0/0     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**🔒 ADICIONAR REGRAS EXTRAS**:
1. Clique em **"Add security group rule"** para adicionar a porta 3000
2. Configure: Type: `Custom TCP`, Port: `3000`, Source: `0.0.0.0/0`

### **Etapa 8: Configurar Armazenamento**

```
Configure storage:
┌─────────────────────────────────────┐
│ Volume 1 (Root)                     │
│ ✅ gp3                              │
│    Size: 8 GiB                      │
│    🏷️ Free tier: 30 GiB available  │
│                                     │
│ ❌ Delete on termination            │
│ ❌ Encrypted                        │
└─────────────────────────────────────┘
```

**💡 RECOMENDAÇÃO**: Deixe 8 GiB (suficiente) ou aumente até 30 GiB (máximo free tier)

### **Etapa 9: Revisão Final**

```
Summary:
┌─────────────────────────────────────┐
│ Number of instances: 1              │
│                                     │
│ Software Image (AMI):               │
│ Amazon Linux 2023 AMI               │
│                                     │
│ Instance type: t2.micro             │
│ 🏷️ Free tier eligible               │
│                                     │
│ Key pair name: ps-games-key         │
│                                     │
│ Security groups: ps-games-catalog-sg│
│                                     │
│ Storage: 8 GiB gp3                  │
│ 🏷️ Free tier eligible               │
└─────────────────────────────────────┘
```

### **Etapa 10: Lançar Instância**

1. Clique em **"Launch instance"** (botão laranja)
2. Aguarde a mensagem de sucesso
3. Clique em **"View all instances"**

## ✅ Verificar se Funcionou

### **No Painel EC2:**
```
Instances:
┌────────────────────────────────────────────────┐
│ ✅ ps-games-catalog                            │
│    Instance State: Running                     │
│    Instance Type: t2.micro                     │
│    Public IPv4: 54.123.456.789 (exemplo)      │
│    Key pair name: ps-games-key                 │
└────────────────────────────────────────────────┘
```

### **Aguardar Status Checks:**
- **Instance State**: `Running` ✅
- **Status Check**: `2/2 checks passed` ✅

## 📝 Informações Importantes

### **Anotar Estas Informações:**
```
✅ IP Público: ________________
✅ Chave SSH: ________________.pem
✅ Security Group: ps-games-catalog-sg
✅ Instance ID: i-xxxxxxxxxx
```

### **Onde Encontrar IP Público:**
1. Selecione sua instância
2. Na aba **"Details"** embaixo
3. Procure por **"Public IPv4 address"**

## 🔑 Configurar Chave SSH

### **No macOS/Linux:**
```bash
# Mover chave para local seguro
mkdir -p ~/.ssh
mv ~/Downloads/ps-games-key.pem ~/.ssh/
chmod 400 ~/.ssh/ps-games-key.pem
```

### **No Windows:**
```cmd
# Usar PuTTY ou WSL
# Converter .pem para .ppk se necessário
```

## 🧪 Testar Conexão

```bash
# Substituir pelo SEU IP público
ssh -i ~/.ssh/ps-games-key.pem ec2-user@54.123.456.789
```

**Se conectou:** ✅ EC2 criada com sucesso!
**Se deu erro:** ❌ Verificar Security Group e chave SSH

## 💰 Verificar Free Tier

### **No AWS Console:**
1. Acesse **"Billing and Cost Management"**
2. Clique em **"Free Tier"**
3. Verifique se EC2 está sendo usado corretamente

```
✅ Amazon EC2 t2.micro Instance: 750 Hours
   Used: 24 Hours (exemplo)
   Remaining: 726 Hours
```

## 🚨 Dicas Importantes

### **❌ Não Fazer:**
- Escolher instância maior que t2.micro
- Esquecer de configurar Security Group
- Perder o arquivo .pem

### **✅ Fazer:**
- Sempre verificar "Free tier eligible"
- Guardar chave SSH em local seguro
- Anotar IP público da instância
- Configurar Security Group corretamente

## 🔄 Próximos Passos

Depois de criar a EC2:

1. **Configurar servidor**: Execute o [script de setup](./quick-start.md#2-configurar-servidor-5-min)
2. **Clonar projeto**: Baixar código na instância
3. **Deploy**: Usar script automático

---

🎉 **Parabéns!** Sua instância EC2 está pronta para receber o PS Games Catalog! 