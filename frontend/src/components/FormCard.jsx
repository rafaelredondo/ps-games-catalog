import React from 'react';
import { Paper, Container } from '@mui/material';

/**
 * FormCard Component
 * 
 * Standardized container component for forms with consistent styling
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Form content to display
 * @param {string} props.maxWidth - Maximum width constraint (xs, sm, md, lg, xl)
 * @param {number|object} props.elevation - Paper elevation (shadow depth)
 * @param {boolean} props.centered - Whether to center the form in viewport
 * @param {Object} props.sx - Additional styles to override defaults
 * @param {Object} props.containerSx - Additional styles for the container
 */
const FormCard = ({ 
  children,
  maxWidth = 'md',
  elevation = 3,
  centered = true,
  sx = {},
  containerSx = {},
  ...props 
}) => {
  const FormContainer = ({ children: containerChildren }) => {
    if (maxWidth === false || maxWidth === 'none') {
      // No container wrapper, direct Paper
      return containerChildren;
    }
    
    return (
      <Container 
        maxWidth={maxWidth} 
        sx={{ 
          py: centered ? 4 : 2,
          ...containerSx 
        }}
      >
        {containerChildren}
      </Container>
    );
  };

  return (
    <FormContainer>
      <Paper 
        elevation={elevation}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          ...sx
        }}
        {...props}
      >
        {children}
      </Paper>
    </FormContainer>
  );
};

export default FormCard; 