# 🕷️ Como Funciona o Crawler do Metacritic

## 📝 **Processo Passo a Passo**

### 1. **Recebe o Nome do Jogo**
```javascript
// Exemplo: "Alan Wake Remastered"
const gameName = "Alan Wake Remastered";
```

### 2. **Sanitiza o Nome para URL**
```javascript
// Remove caracteres especiais e converte para formato de URL
const urlName = gameName
  .toLowerCase()                    // "alan wake remastered"
  .replace(/[™®]/g, '')            // Remove símbolos de marca
  .replace(/[^a-z0-9]/g, '-')      // Substitui espaços por hífens: "alan-wake-remastered"
  .replace(/-+/g, '-')             // Remove hífens duplicados
  .replace(/^-|-$/g, '');          // Remove hífens no início/fim
```

### 3. **Tenta Diferentes Estratégias de Busca**

#### **Estratégia 1: URL Direta**
```
https://www.metacritic.com/game/alan-wake-remastered/
```

#### **Estratégia 2: URLs com Plataforma**
```
https://www.metacritic.com/game/playstation-5/alan-wake-remastered/
https://www.metacritic.com/game/playstation-4/alan-wake-remastered/
https://www.metacritic.com/game/pc/alan-wake-remastered/
```

#### **Estratégia 3: Variações do Nome**
```
"Alan Wake Remastered" → "Alan Wake"
"Alan Wake Remastered" → "alan-wake"
"Alan Wake Remastered" → "Alan Wake PlayStation"
```

### 4. **Faz Requisição HTTP**
```javascript
const config = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
  },
  timeout: 15000,
  maxRedirects: 5
};

const response = await axios.get(url, config);
```

### 5. **Extrai a Nota do HTML**

O Metacritic mudou sua estrutura em 2024. O crawler procura por vários padrões:

```javascript
const scorePatterns = [
  // JSON embutido no JavaScript da página
  /"score":\s*(\d+)/i,
  /metaScore['"]\s*:\s*(\d+)/i,
  /"metascore"\s*:\s*(\d+)/i,
  
  // Elementos HTML
  /<span[^>]*class="[^"]*score[^"]*"[^>]*>(\d+)<\/span>/i,
  /<div[^>]*class="[^"]*metascore[^"]*"[^>]*>(\d+)<\/div>/i,
  /<div[^>]*data-score="(\d+)"/i,
  
  // Formatos específicos
  /\\"metascore\\":\s*(\d+)/i,
  /score['"]\s*:\s*['"]*(\d+)['"]/i
];
```

### 6. **Valida a Nota**
```javascript
const score = parseInt(match[1], 10);
if (score >= 0 && score <= 100) {
  console.log(`✅ Nota encontrada: ${score}`);
  return score;
}
```

### 7. **Rate Limiting Respeitoso**
```javascript
// Aguarda 2 segundos entre requisições
await this.sleep(2000);
```

## 🧪 **Exemplo Real: Alan Wake Remastered**

Vamos testar especificamente o Alan Wake: 