#!/bin/bash

# Script para verificar status dos GitHub Actions

echo "🔍 STATUS GITHUB ACTIONS"
echo "======================="

# Verificar se temos gh CLI instalado
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI não instalado"
    echo "📥 Instale com: brew install gh"
    echo "🔐 Autentique com: gh auth login"
    exit 1
fi

echo "📊 Verificando workflows em execução..."
gh run list --limit 10

echo ""
echo "🔄 Status dos últimos deploys:"
gh run list --workflow="deploy.yml" --limit 5

echo ""
echo "📋 Comandos úteis:"
echo "  gh run list                    # Listar runs"
echo "  gh run watch                   # Assistir run em tempo real"
echo "  gh run cancel <run-id>         # Cancelar run"
echo "  gh workflow enable deploy.yml  # Habilitar workflow"
echo "  gh workflow disable deploy.yml # Desabilitar workflow"

echo ""
echo "💡 Se Actions estiver travado:"
echo "  1. Cancele runs pendentes: gh run cancel <run-id>"
echo "  2. Use deploy manual: ./deployment/manual-deploy.sh"
echo "  3. Force novo trigger: git commit --allow-empty -m 'trigger deploy' && git push" 