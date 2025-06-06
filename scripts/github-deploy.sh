#!/bin/bash

# Script para forçar deploy manual com rebuild completo
# Uso: ./scripts/force-deploy.sh

echo "🔥 FORÇANDO DEPLOY MANUAL COMPLETO"
echo "=================================="
echo ""
echo "Este script vai:"
echo "✅ Forçar rebuild do frontend no GitHub Actions"
echo "✅ Atualizar backend mesmo sem mudanças"
echo "✅ Ignorar detecção inteligente de mudanças"
echo ""

read -p "❓ Confirma o deploy manual? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deploy cancelado pelo usuário"
    exit 1
fi

echo ""
echo "🚀 Disparando workflow manual..."

# Verificar se gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não está instalado"
    echo "💡 Instale com: brew install gh (macOS) ou siga: https://cli.github.com/"
    echo ""
    echo "🔗 Alternativamente, acesse:"
    echo "   https://github.com/rafaelredondo/ps-games-catalog/actions/workflows/deploy.yml"
    echo "   e clique em 'Run workflow'"
    exit 1
fi

# Verificar se está autenticado
if ! gh auth status &> /dev/null; then
    echo "❌ Não está autenticado no GitHub CLI"
    echo "💡 Execute: gh auth login"
    exit 1
fi

# Disparar workflow manual
echo "📤 Disparando deploy manual via GitHub Actions..."
gh workflow run deploy.yml

echo ""
echo "✅ Deploy manual disparado!"
echo "🔗 Acompanhe em: https://github.com/rafaelredondo/ps-games-catalog/actions"
echo ""
echo "⏱️  O deploy deve levar cerca de 3-4 minutos"
echo "📊 Frontend será buildado no GitHub Actions (7GB RAM)"
echo "🖥️  EC2 t2.micro receberá apenas os arquivos prontos" 