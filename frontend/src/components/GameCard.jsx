import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { VideogameAsset as VideogameAssetIcon } from '@mui/icons-material';
import { getMetacriticColor } from '../utils/metacriticUtils';

/**
 * GameCard Component
 * 
 * Standardized card component for displaying game information
 * 
 * @param {Object} props
 * @param {Object} props.game - Game object with data
 * @param {Function} props.onClick - Click handler for card interaction
 * @param {boolean} props.isAlphabetNavigationActive - Whether alphabet navigation is active (affects metacritic chip position)
 * @param {Object} props.sx - Additional styles to override defaults
 */
const GameCard = ({ 
  game, 
  onClick, 
  isAlphabetNavigationActive = false,
  sx = {},
  ...props 
}) => {
  return (
    <Card 
      id={`game-card-${game.id}`}
      sx={{ 
        bgcolor: '#222',
        color: 'white',
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 6px 12px rgba(0,0,0,0.5)',
          transform: 'translateY(-2px)',
        },
        ...sx
      }}
      onClick={onClick}
      {...props}
    >
      {/* Metacritic Score Badge */}
      {game.metacritic && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: isAlphabetNavigationActive ? 32 : 8,
            bgcolor: getMetacriticColor(game.metacritic),
            color: 'white',
            minWidth: 40,
            height: 28,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            zIndex: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
            px: 1,
            transition: 'right 0.3s ease',
          }}
        >
          {game.metacritic}
        </Box>
      )}
      
      {/* Game Cover Image */}
      <CardMedia
        component="img"
        image={game.coverUrl || 'https://via.placeholder.com/300x200?text=No+Cover'}
        alt={game.name}
        sx={{ 
          height: { xs: 180, sm: 150, md: 160 },
          width: '100%',
          objectFit: 'cover',
          display: 'block',
          flexShrink: 0
        }}
      />
      
      {/* Card Content */}
      <CardContent sx={{ 
        py: { xs: 1.5, sm: 1.5 }, 
        px: { xs: 2, sm: 1.5 }, 
        flex: 1,
        display: 'flex', 
        flexDirection: 'column',
        minWidth: 0,
        overflow: { xs: 'visible', sm: 'hidden' },
        width: '100%'
      }}>
        {/* Game Title */}
        <Typography
          variant="h6"
          component="h2"
          sx={{ 
            fontWeight: 'bold', 
            fontSize: { xs: '1.1rem', sm: '1rem' },
            mb: { xs: 0.5, sm: 0.75 },
            lineHeight: 1.3,
            height: { xs: 'auto', sm: '2.4em' },
            minHeight: { xs: '1.3em', sm: '2.4em' },
            maxHeight: { xs: 'none', sm: '2.4em' },
            overflow: { xs: 'visible', sm: 'hidden' },
            textOverflow: { xs: 'unset', sm: 'ellipsis' },
            display: { xs: 'block', sm: '-webkit-box' },
            WebkitLineClamp: { xs: 'unset', sm: 2 },
            WebkitBoxOrient: { xs: 'unset', sm: 'vertical' },
            width: '100%',
            wordBreak: 'break-word'
          }}
        >
          {game.name} {game.released && `(${new Date(game.released).getFullYear()})`}
        </Typography>
        
        {/* Platforms Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.25, sm: 0.5 } }}>
          <VideogameAssetIcon 
            fontSize="small" 
            sx={{ 
              mr: 0.5, 
              color: 'rgba(255,255,255,0.7)', 
              fontSize: { xs: '0.85rem', sm: '0.95rem' }
            }} 
          />
          <Typography 
            sx={{ 
              fontSize: { xs: '0.95rem', sm: '0.94rem' }, 
              color: 'rgba(255,255,255,0.7)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              flex: 1,
              width: '100%'
            }}
          >
            {game.platforms && game.platforms.join(', ')}
          </Typography>
        </Box>
        
        {/* Genres Chips */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: { xs: 0.25, sm: 0.5 }, 
            mt: { xs: 0.25, sm: 0.5 },
            overflow: 'hidden',
            maxHeight: { xs: '50px', sm: '60px' }
          }}
        >
          {game.genres && game.genres.slice(0, 3).map(genre => (
            <Chip
              key={genre}
              label={genre}
              size="small"
              sx={{ 
                mb: { xs: 0.5, sm: 0.5 },
                bgcolor: 'rgba(100, 100, 100, 0.5)', 
                color: 'white',
                fontWeight: 'bold',
                fontSize: { xs: '0.85rem', sm: '0.84rem' },
                height: { xs: '28px', sm: '24px' }
              }}
            />
          ))}
          {game.genres && game.genres.length > 3 && (
            <Chip
              label={`+${game.genres.length - 3}`}
              size="small"
              sx={{ 
                mb: { xs: 0.5, sm: 0.5 },
                bgcolor: 'rgba(150, 150, 150, 0.5)', 
                color: 'white',
                fontWeight: 'bold',
                fontSize: { xs: '0.85rem', sm: '0.84rem' },
                height: { xs: '28px', sm: '24px' }
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default GameCard; 