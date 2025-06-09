import axios from 'axios';
import { writeFileSync } from 'fs';

async function debugMetacriticHTML() {
  try {
    const url = 'https://www.metacritic.com/game/pc/alan-wake-remastered/';
    
    console.log(`🔍 Buscando HTML de: ${url}`);
    
    const config = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
      },
      timeout: 15000,
      maxRedirects: 5
    };

    const response = await axios.get(url, config);
    const html = response.data;
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📏 Tamanho: ${html.length} caracteres`);
    
    // Salvar HTML para inspeção
    writeFileSync('debug-metacritic.html', html);
    console.log('💾 HTML salvo em: debug-metacritic.html');
    
    // Buscar por score patterns
    console.log('\n🔍 Procurando por padrões de score...');
    
    const patterns = [
      /"score":\s*(\d+)/gi,
      /metaScore['"]\s*:\s*(\d+)/gi,
      /"metascore"\s*:\s*(\d+)/gi,
      /<span[^>]*class="[^"]*score[^"]*"[^>]*>(\d+)<\/span>/gi,
      /<div[^>]*class="[^"]*metascore[^"]*"[^>]*>(\d+)<\/div>/gi,
      /<div[^>]*data-score="(\d+)"/gi,
      /\\"metascore\\":\s*(\d+)/gi,
      /score['"]\s*:\s*['"]*(\d+)['"]/gi,
      /Alan\s*Wake.*?(\d{2})/gi,
      /(\d{2,3})\s*out\s*of\s*100/gi
    ];
    
    let found = false;
    patterns.forEach((pattern, index) => {
      const matches = [...html.matchAll(pattern)];
      if (matches.length > 0) {
        console.log(`✅ Padrão ${index + 1} encontrou:`, matches.map(m => m[1] || m[0]));
        found = true;
      }
    });
    
    if (!found) {
      console.log('❌ Nenhum padrão de score encontrado');
      
      // Mostrar algumas partes relevantes do HTML
      console.log('\n📄 Buscando "score" no HTML...');
      const scoreLines = html.split('\n').filter(line => 
        line.toLowerCase().includes('score') || 
        line.toLowerCase().includes('metascore') ||
        line.toLowerCase().includes('alan wake')
      );
      
      scoreLines.slice(0, 10).forEach((line, i) => {
        console.log(`${i + 1}: ${line.trim()}`);
      });
    }
    
    // Verificar se é uma página válida do jogo
    if (html.includes('Alan Wake')) {
      console.log('✅ Página contém "Alan Wake"');
    } else {
      console.log('❌ Página NÃO contém "Alan Wake"');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

debugMetacriticHTML().catch(console.error); 