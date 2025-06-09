import React from 'react';
import { 
  Skeleton, 
  Box, 
  Card, 
  CardContent,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';

/**
 * SkeletonLoader Component
 * 
 * Sistema de skeleton loading para melhorar percepção de velocidade
 * Suporta múltiplas variantes pré-configuradas para diferentes contextos
 * 
 * @param {Object} props
 * @param {'card'|'table'|'form'|'list'|'details'|'stats'|'custom'} props.variant - Tipo de skeleton
 * @param {number} props.count - Quantidade de itens a serem renderizados
 * @param {boolean} props.animation - Se deve ter animação (default: true)
 * @param {Object} props.sx - Estilos customizados
 * @param {Object} props.customConfig - Configuração customizada para variant 'custom'
 */
const SkeletonLoader = ({ 
  variant = 'card', 
  count = 1, 
  animation = true,
  sx = {},
  customConfig = {},
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Configurações de skeletons por variante
  const skeletonConfigs = {
    // Skeleton para GameCard
    card: {
      container: {
        display: 'grid',
        gridTemplateColumns: isMobile 
          ? 'repeat(auto-fill, minmax(280px, 1fr))'
          : 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 2,
        ...sx
      },
      render: (index) => (
        <Card key={index} sx={{ bgcolor: '#111', borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            {/* Imagem */}
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={isMobile ? 160 : 180}
              sx={{ borderRadius: 1, mb: 2 }}
              animation={animation ? 'wave' : false}
            />
            
            {/* Título do jogo */}
            <Skeleton 
              variant="text" 
              width="85%" 
              height={28}
              animation={animation ? 'wave' : false}
              sx={{ mb: 1 }}
            />
            
            {/* Plataformas */}
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
              <Skeleton variant="rounded" width={60} height={20} animation={animation ? 'wave' : false} />
              <Skeleton variant="rounded" width={45} height={20} animation={animation ? 'wave' : false} />
              <Skeleton variant="rounded" width={70} height={20} animation={animation ? 'wave' : false} />
            </Box>
            
            {/* Gêneros */}
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
              <Skeleton variant="rounded" width={50} height={20} animation={animation ? 'wave' : false} />
              <Skeleton variant="rounded" width={65} height={20} animation={animation ? 'wave' : false} />
            </Box>
            
            {/* Metacritic e ano */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} animation={animation ? 'wave' : false} />
              <Skeleton variant="text" width={60} height={20} animation={animation ? 'wave' : false} />
            </Box>
            
            {/* Botões */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton 
                variant="rounded" 
                width={isMobile ? 40 : 80} 
                height={isMobile ? 40 : 36}
                animation={animation ? 'wave' : false}
              />
              <Skeleton 
                variant="rounded" 
                width={isMobile ? 40 : 80} 
                height={isMobile ? 40 : 36}
                animation={animation ? 'wave' : false}
              />
            </Box>
          </CardContent>
        </Card>
      )
    },

    // Skeleton para tabela
    table: {
      container: { ...sx },
      render: (index) => (
        <Box key={index} sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Nome do jogo */}
            <Skeleton 
              variant="text" 
              width="25%" 
              height={24}
              animation={animation ? 'wave' : false}
            />
            {/* Plataformas */}
            <Skeleton 
              variant="text" 
              width="20%" 
              height={20}
              animation={animation ? 'wave' : false}
            />
            {/* Gêneros */}
            <Skeleton 
              variant="text" 
              width="15%" 
              height={20}
              animation={animation ? 'wave' : false}
            />
            {/* Ano */}
            <Skeleton 
              variant="text" 
              width="8%" 
              height={20}
              animation={animation ? 'wave' : false}
            />
            {/* Metacritic */}
            <Skeleton 
              variant="circular" 
              width={32} 
              height={32}
              animation={animation ? 'wave' : false}
            />
            {/* Status */}
            <Skeleton 
              variant="rounded" 
              width={80} 
              height={24}
              animation={animation ? 'wave' : false}
            />
            {/* Ações */}
            <Skeleton 
              variant="rounded" 
              width={40} 
              height={32}
              animation={animation ? 'wave' : false}
            />
          </Box>
        </Box>
      )
    },

    // Skeleton para formulários
    form: {
      container: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 3,
        maxWidth: '600px',
        ...sx 
      },
      render: (index) => (
        <Box key={index}>
          {/* Título do formulário */}
          <Skeleton 
            variant="text" 
            width="40%" 
            height={36}
            animation={animation ? 'wave' : false}
            sx={{ mb: 3 }}
          />
          
          {/* Campos do formulário */}
          {[1,2,3,4,5].map((field) => (
            <Box key={field} sx={{ mb: 2 }}>
              <Skeleton 
                variant="text" 
                width="25%" 
                height={20}
                animation={animation ? 'wave' : false}
                sx={{ mb: 1 }}
              />
              <Skeleton 
                variant="rounded" 
                width="100%" 
                height={56}
                animation={animation ? 'wave' : false}
              />
            </Box>
          ))}
          
          {/* Botões */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Skeleton 
              variant="rounded" 
              width={120} 
              height={40}
              animation={animation ? 'wave' : false}
            />
            <Skeleton 
              variant="rounded" 
              width={100} 
              height={40}
              animation={animation ? 'wave' : false}
            />
          </Box>
        </Box>
      )
    },

    // Skeleton para listas
    list: {
      container: { 
        display: 'flex', 
        flexDirection: 'column',
        ...sx 
      },
      render: (index) => (
        <Box 
          key={index} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            p: 2,
            borderBottom: index < count - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
          }}
        >
          <Skeleton 
            variant="circular" 
            width={40} 
            height={40}
            animation={animation ? 'wave' : false}
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton 
              variant="text" 
              width="60%" 
              height={20}
              animation={animation ? 'wave' : false}
              sx={{ mb: 0.5 }}
            />
            <Skeleton 
              variant="text" 
              width="40%" 
              height={16}
              animation={animation ? 'wave' : false}
            />
          </Box>
          <Skeleton 
            variant="rounded" 
            width={80} 
            height={32}
            animation={animation ? 'wave' : false}
          />
        </Box>
      )
    },

    // Skeleton para página de detalhes
    details: {
      container: { ...sx },
      render: (index) => (
        <Box key={index}>
          {/* Header com imagem e informações principais */}
          <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: isMobile ? 'column' : 'row' }}>
            {/* Imagem de capa */}
            <Skeleton 
              variant="rounded" 
              width={isMobile ? '100%' : 300} 
              height={isMobile ? 200 : 400}
              animation={animation ? 'wave' : false}
            />
            
            {/* Informações */}
            <Box sx={{ flex: 1 }}>
              {/* Título */}
              <Skeleton 
                variant="text" 
                width="70%" 
                height={48}
                animation={animation ? 'wave' : false}
                sx={{ mb: 2 }}
              />
              
              {/* Tags */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                {[1,2,3,4].map((tag) => (
                  <Skeleton 
                    key={tag}
                    variant="rounded" 
                    width={60} 
                    height={24}
                    animation={animation ? 'wave' : false}
                  />
                ))}
              </Box>
              
              {/* Descrição */}
              {[1,2,3,4].map((line) => (
                <Skeleton 
                  key={line}
                  variant="text" 
                  width={line === 4 ? '60%' : '100%'} 
                  height={20}
                  animation={animation ? 'wave' : false}
                  sx={{ mb: 1 }}
                />
              ))}
              
              {/* Botões de ação */}
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Skeleton 
                  variant="rounded" 
                  width={100} 
                  height={40}
                  animation={animation ? 'wave' : false}
                />
                <Skeleton 
                  variant="rounded" 
                  width={100} 
                  height={40}
                  animation={animation ? 'wave' : false}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      )
    },

    // Skeleton para estatísticas
    stats: {
      container: { 
        display: 'grid',
        gridTemplateColumns: isMobile 
          ? '1fr'
          : 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 2,
        ...sx 
      },
      render: (index) => (
        <Card key={index} sx={{ bgcolor: '#111', p: 2 }}>
          <CardContent>
            {/* Ícone e título */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Skeleton 
                variant="circular" 
                width={40} 
                height={40}
                animation={animation ? 'wave' : false}
              />
              <Skeleton 
                variant="text" 
                width="60%" 
                height={24}
                animation={animation ? 'wave' : false}
              />
            </Box>
            
            {/* Valor principal */}
            <Skeleton 
              variant="text" 
              width="40%" 
              height={36}
              animation={animation ? 'wave' : false}
              sx={{ mb: 1 }}
            />
            
            {/* Descrição */}
            <Skeleton 
              variant="text" 
              width="80%" 
              height={16}
              animation={animation ? 'wave' : false}
            />
          </CardContent>
        </Card>
      )
    },

    // Skeleton customizado
    custom: {
      container: { ...sx },
      render: (index) => (
        <Box key={index}>
          {customConfig.elements?.map((element, elemIndex) => (
            <Skeleton
              key={elemIndex}
              variant={element.variant || 'text'}
              width={element.width || '100%'}
              height={element.height || 20}
              animation={animation ? 'wave' : false}
              sx={{ mb: element.marginBottom || 1, ...element.sx }}
            />
          )) || (
            <Skeleton 
              variant="text" 
              width="100%" 
              height={20}
              animation={animation ? 'wave' : false}
            />
          )}
        </Box>
      )
    }
  };

  const config = skeletonConfigs[variant] || skeletonConfigs.card;

  return (
    <Box sx={config.container} {...props}>
      {Array.from({ length: count }, (_, index) => config.render(index))}
    </Box>
  );
};

export default SkeletonLoader; 