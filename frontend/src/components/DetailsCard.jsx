import React from 'react';
import { Paper, Box, Typography, Container } from '@mui/material';

/**
 * DetailsCard Component
 * 
 * Standardized card component for displaying detailed information with header image
 * 
 * @param {Object} props
 * @param {string} props.title - Main title to display
 * @param {string} props.subtitle - Optional subtitle (e.g., year)
 * @param {string} props.imageUrl - Header image URL
 * @param {string} props.imageAlt - Alt text for header image
 * @param {React.ReactNode} props.children - Content to display below header
 * @param {string} props.maxWidth - Container max width (xs, sm, md, lg, xl)
 * @param {object} props.imageHeight - Height for header image
 * @param {boolean} props.darkTheme - Whether to use dark theme styling
 * @param {Object} props.sx - Additional styles to override defaults
 * @param {Object} props.containerSx - Additional styles for container
 */
const DetailsCard = ({ 
  title,
  subtitle,
  imageUrl,
  imageAlt,
  children,
  maxWidth = 'md',
  imageHeight = { xs: '180px', sm: '250px' },
  darkTheme = true,
  sx = {},
  containerSx = {},
  ...props 
}) => {
  const defaultImageUrl = 'https://via.placeholder.com/1200x500?text=No+Cover';

  return (
    <Container 
      maxWidth={maxWidth} 
      sx={{ 
        py: 4,
        ...containerSx 
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          bgcolor: darkTheme ? '#222' : 'background.paper',
          color: darkTheme ? 'white' : 'text.primary',
          borderRadius: 2,
          boxShadow: darkTheme 
            ? '0 4px 8px rgba(0,0,0,0.3)' 
            : '0 4px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          maxWidth: { sm: '650px', md: '750px' },
          mx: 'auto',
          ...sx
        }}
        {...props}
      >
        {/* Header Image Area */}
        <Box sx={{ position: 'relative', width: '100%' }}>
          <Box
            component="img"
            src={imageUrl || defaultImageUrl}
            alt={imageAlt || title}
            sx={{
              width: '100%',
              height: imageHeight,
              objectFit: 'cover',
              filter: 'brightness(0.85)',
            }}
          />
          
          {/* Title Overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)',
            }}
          >
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {title}
              {subtitle && (
                <Typography 
                  component="span" 
                  variant="subtitle1" 
                  sx={{ 
                    opacity: 0.8,
                    fontWeight: 'normal',
                    color: 'white'
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Typography>
          </Box>
        </Box>
        
        {/* Content Area */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      </Paper>
    </Container>
  );
};

export default DetailsCard; 