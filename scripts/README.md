# 🚀 Scripts de Deploy

## 📋 Scripts Disponíveis

### **1. `deploy-direct.sh` - Deploy Direto (Recomendado para desenvolvimento)**
```bash
./scripts/deploy-direct.sh
```

**O que faz:**
- ✅ Build local do frontend
- ✅ Upload direto via rsync 
- ✅ Atualização do backend
- ✅ Verificação de saúde

**Quando usar:**
- 🔧 Desenvolvimento ativo
- ⚡ Deploy rápido (2-3 minutos)
- 🎯 Testes de mudanças

---

### **2. `github-deploy.sh` - Deploy via GitHub Actions**
```bash
./scripts/github-deploy.sh
```

**O que faz:**
- ✅ Dispara workflow manual no GitHub Actions
- ✅ Build no GitHub (7GB RAM)
- ✅ Deploy automático no servidor

**Quando usar:**
- 🎯 Releases importantes
- 👥 Deploy para produção
- 📊 Quando quer logs centralizados

---

## 🎯 **Uso Recomendado**

### **Durante desenvolvimento:**
```bash
./scripts/deploy-direct.sh
```

### **Para releases:**
```bash
./scripts/github-deploy.sh
```

### **Deploy automático:**
Qualquer `git push origin main` dispara GitHub Actions automaticamente.

---

## 🌐 **URLs da Aplicação**

- **Frontend**: http://54.84.52.202/
- **Backend**: http://54.84.52.202:3000/api/health
- **GitHub Actions**: https://github.com/rafaelredondo/ps-games-catalog/actions 