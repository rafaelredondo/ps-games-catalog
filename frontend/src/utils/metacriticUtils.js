/**
 * Utilities para handling de Metacritic scores
 */

/**
 * Retorna a cor apropriada baseada na pontuação do Metacritic
 * @param {number} score - Pontuação do Metacritic (0-100)
 * @returns {string} - Código de cor hexadecimal
 */
export const getMetacriticColor = (score) => {
  if (!score) return '#666';           // Cinza - Sem avaliação
  if (score >= 95) return '#9c27b0';   // Roxo - Obra-Prima (GOTY level)
  if (score >= 85) return '#2196f3';   // Azul - Épico (AAA quality)
  if (score >= 75) return '#4caf50';   // Verde - Bom (Muito bom)
  if (score >= 60) return '#ff9800';   // Laranja - Mediano (Vale a pena)
  if (score >= 40) return '#ffc107';   // Amarelo - Ruim (Meh...)
  return '#f44336';                    // Vermelho - Péssimo (Broken)
};

/**
 * Retorna a classificação baseada na pontuação do Metacritic
 * @param {number} score - Pontuação do Metacritic (0-100)
 * @returns {string} - Texto da classificação
 */
export const getMetacriticClassification = (score) => {
  if (!score) return '❓ Sem Avaliação';
  if (score >= 95) return '🏆 Obra-Prima';    // 95+ (GOTY level)
  if (score >= 85) return '⭐ Épico';         // 85-94 (AAA quality)
  if (score >= 75) return '🎮 Bom';           // 75-84 (Muito bom)
  if (score >= 60) return '👍 Mediano';       // 60-74 (Vale a pena)
  if (score >= 40) return '😐 Ruim';          // 40-59 (Meh...)
  return '💀 Péssimo';                        // 0-39 (Broken)
};

 