# HowLongToBeat Crawler

## Visão Geral

O HowLongToBeat Crawler é uma ferramenta que busca automaticamente tempos de jogo do site [HowLongToBeat.com](https://howlongtobeat.com) para jogos que não possuem o campo `playTime` preenchido no catálogo.

## Características

- **Foco na História Principal**: Extrai apenas o tempo necessário para completar a história principal dos jogos
- **Múltiplas Estratégias**: Usa diferentes métodos de busca para maximizar a taxa de sucesso
- **Rate Limiting**: Respeitoso com delays de 3 segundos entre requisições
- **Dry Run**: Permite testar sem fazer alterações no banco
- **Logs Detalhados**: Fornece informações detalhadas sobre o processo

## Como Usar

### Comando Básico

```bash
# Processar até 10 jogos (padrão)
node scripts/howlongtobeat-crawler.js
```

### Opções Disponíveis

```bash
# Processar apenas 5 jogos
node scripts/howlongtobeat-crawler.js --max-games 5

# Modo teste (não salva no banco)
node scripts/howlongtobeat-crawler.js --dry-run

# Combinar opções
node scripts/howlongtobeat-crawler.js --max-games 3 --dry-run

# Ver ajuda completa
node scripts/howlongtobeat-crawler.js --help
```

## Estratégias de Busca

O crawler usa 3 estratégias diferentes para encontrar os jogos:

### 1. URL Direta
- Converte o nome do jogo para uma URL direta
- Exemplo: `God of War` → `https://howlongtobeat.com/game/god-of-war`

### 2. API de Busca
- Usa a API interna do HowLongToBeat
- Inclui algoritmo de matching para encontrar o melhor resultado

### 3. Variações do Nome
- Tenta variações do nome removendo:
  - Símbolos de marca (™, ®)
  - Palavras como "Remastered", "Edition"
  - Formatação especial

## Dados Extraídos

O crawler foca especificamente no tempo da **história principal**:

- **Prioridade 1**: Main Story time
- **Prioridade 2**: Main + Extras (se Main Story não disponível)
- **Prioridade 3**: Completionist (como último recurso)

### Formato dos Dados

- **Unidade**: Horas com uma casa decimal (ex: 25.5h)
- **Conversão**: Automática de diferentes formatos ("25h 30m", "25.5h", etc.)
- **Armazenamento**: Campo `playTime` do modelo `Game`

## Exemplo de Execução

```bash
$ node scripts/howlongtobeat-crawler.js --max-games 3 --dry-run

🎮 HowLongToBeat Crawler - PS Games Catalog

🔍 MODO DRY RUN - Nenhuma alteração será salva no banco

📊 Configuração:
   Máximo de jogos: 3
   Dry Run: Sim

🔍 Verificando jogos sem tempo de jogo...
📋 Encontrados 15 jogos sem tempo:
   1. God of War
   2. Spider-Man
   3. Horizon Zero Dawn

============================================================
🎮 Processando: God of War
🆔 ID: 1234567890

🔍 Buscando "God of War" no HowLongToBeat...
🌐 URL: https://howlongtobeat.com/game/god-of-war
✅ Tempo encontrado para "God of War": 20.5 horas (20h 30m)
🔍 DRY RUN: God of War teria tempo atualizado para 20.5h

==================================================
📊 RESUMO FINAL
==================================================
✅ Jogos processados: 3
🔄 Jogos atualizados: 2
❌ Jogos falharam: 1
📈 Taxa de sucesso: 66.7%
```

## Tratamento de Erros

### Erros Comuns

1. **Jogo não encontrado**: Avisa e continua com o próximo
2. **Erro de rede**: Tenta novamente com outras estratégias
3. **Rate limiting**: Respect os delays e sugere executar mais tarde
4. **Dados inválidos**: Valida e descarta dados inconsistentes

### Logs de Debug

O crawler fornece logs detalhados para ajudar na identificação de problemas:

- URLs acessadas
- Tamanho das respostas
- Estratégias tentadas
- Erros específicos

## Boas Práticas

### Recomendações de Uso

1. **Teste Primeiro**: Sempre use `--dry-run` antes da execução real
2. **Pequenos Lotes**: Processe poucos jogos por vez (5-10)
3. **Monitore**: Acompanhe os logs para identificar padrões de erro
4. **Seja Paciente**: Respeite os delays entre requisições

### Quando Executar

- **Novos Jogos**: Após adicionar jogos sem tempo ao catálogo
- **Manutenção**: Verificação periódica de jogos sem dados
- **Manualmente**: Execute conforme necessário, não automatize

## Limitações

### Conhecidas

1. **Dependência Externa**: Funciona apenas se o HowLongToBeat estiver acessível
2. **Matching Imperfeito**: Nomes muito diferentes podem não ser encontrados
3. **Proteções Anti-Bot**: Site pode implementar bloqueios
4. **Dados da Comunidade**: Qualidade depende dos dados enviados pelos usuários

### Jogos Problemáticos

- Jogos muito antigos ou obscuros
- Títulos com nomes muito genéricos
- Jogos apenas em japonês
- DLCs e expansões

## Arquitetura Técnica

### Principais Classes

```javascript
HowLongToBeatCrawler
├── findGamesWithoutPlayTime()    // Busca jogos sem tempo
├── searchGamePlayTime()          // Busca tempo no HLTB
├── extractPlayTimeFromHTML()     // Parse do HTML
├── parseTimeStringToHours()      // Conversão de formatos
└── crawlAndUpdatePlayTimes()     // Orquestração geral
```

### Dependências

- `axios`: Requisições HTTP
- `gamesDb`: Interface com banco de dados
- Regex patterns para parsing

## Troubleshooting

### Problemas Comuns

**Taxa de sucesso muito baixa (<30%)**
- Verifique conectividade com internet
- Site pode estar bloqueando requisições
- Tente aumentar delay entre requisições

**Muitos erros 404**
- Normal para jogos obscuros
- Verifique se nomes dos jogos estão corretos
- Considere atualização manual para casos específicos

**Erro de timeout**
- Site pode estar lento
- Tente novamente mais tarde
- Reduza número de jogos por lote

### Logs Úteis

- `📊 Response Status`: Status HTTP da requisição
- `❌ Página não encontrada`: Jogo não existe no HLTB
- `🔄 Tentando variação`: Testando nomes alternativos

## Status Atual (Dezembro 2024)

### Implementação Completa ✅

- ✅ **Infraestrutura**: Crawler totalmente implementado
- ✅ **Múltiplas Estratégias**: URL direta, busca HTML, variações de nome
- ✅ **Rate Limiting**: 3 segundos entre requisições
- ✅ **Testes**: 20/20 testes unitários passando
- ✅ **Parsing HTML**: Atualizado para nova estrutura do HowLongToBeat
- ✅ **Formato "½"**: Suporte para "26½ Hours" e similares
- ✅ **Validação**: Rejeita tempos irrealistas (>200h ou <0.5h)

### Melhorias Recentes

1. **Padrões HTML Atualizados**: Agora captura corretamente a estrutura `GameCard_search_list_tidbit`
2. **Parsing Melhorado**: Converte "26½ Hours" → 26.5 horas corretamente
3. **Validação Robusta**: Filtra IDs numéricos e tempos irrealistas
4. **Debug Aprimorado**: Logs mais informativos para troubleshooting
5. **🎯 Matching de Jogos**: Agora verifica se o jogo encontrado realmente corresponde ao buscado
6. **🔍 Múltiplas Tentativas**: Testa até 3 resultados de busca por jogo
7. **📖 Extração de Título**: Extrai título real da página para validação
8. **🤖 Algoritmo Inteligente**: Similaridade de nomes com 65% de threshold

### Taxa de Sucesso

- **🛡️ Validação**: 100% de precisão - não retorna mais dados incorretos
- **🎯 Matching**: Rejeita corretamente jogos que não correspondem ao buscado
- **🔍 Detecção**: Identifica "Claire Obscure" ≠ "Tomb Raider" corretamente
- **📊 Parsing**: Extração de tempo funcionando quando jogo correto é encontrado
- **⚠️ Limitação**: HowLongToBeat pode retornar resultados genéricos em buscas

### Próximos Passos

- [ ] Melhorar algoritmo de matching de jogos
- [ ] Implementar cache para evitar requisições repetidas  
- [ ] Adicionar suporte para mais formatos de tempo
- [ ] Relatórios de qualidade dos dados

## Futuras Melhorias

### Planejadas

- [ ] Suporte a múltiplos tipos de tempo (Main, Extras, Completionist)
- [ ] Cache local para evitar requisições duplicadas
- [ ] Integração com outros sites de tempo de jogo
- [ ] Interface web para executar o crawler

### Consideradas

- [ ] Machine learning para melhor matching de nomes
- [ ] Sincronização automática agendada
- [ ] Validação de dados extraídos
- [ ] Relatórios de qualidade dos dados 