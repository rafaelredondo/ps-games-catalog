import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

/**
 * StatsCard Component
 * 
 * Standardized card component for displaying statistics with colored header and animations
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon to display in header
 * @param {string} props.title - Title text for the card header  
 * @param {string} props.color - Background color for the header
 * @param {React.ReactNode} props.children - Content to display in card body
 * @param {number} props.cardIndex - Index for staggered animations (default: 0)
 * @param {boolean} props.isVisible - Whether card should be visible (for animations)
 * @param {Object} props.sx - Additional styles to override defaults
 */
const StatsCard = ({ 
  icon, 
  title, 
  color, 
  children, 
  cardIndex = 0, 
  isVisible = true,
  sx = {},
  ...props 
}) => {
  return (
    <Paper 
      elevation={2} 
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        height: '100%',
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: isVisible ? 'translateY(-8px) scale(1.02)' : 'translateY(30px) scale(0.95)',
          boxShadow: isVisible ? '0 12px 24px rgba(0,0,0,0.15)' : 'none',
          transition: 'all 0.3s ease'
        },
        ...sx
      }}
      {...props}
    >
      {/* Header with Icon and Title */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          p: 2,
          bgcolor: color,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'left 0.8s ease',
            left: isVisible ? '100%' : '-100%'
          }
        }}
      >
        <Box 
          sx={{ 
            transform: isVisible ? 'rotate(0deg) scale(1)' : 'rotate(-10deg) scale(0.8)',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
          }}
        >
          {icon}
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s'
          }}
        >
          {title}
        </Typography>
      </Box>
      
      {/* Content Body */}
      <Box 
        sx={{ 
          p: 2,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s'
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

export default StatsCard; 