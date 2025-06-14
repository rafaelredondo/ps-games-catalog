import React from 'react';
import { SvgIcon } from '@mui/material';

const PsPlusIcon = ({ fontSize = 'medium', sx = {}, ...props }) => {
  return (
    <SvgIcon 
      fontSize={fontSize} 
      sx={{ 
        ...sx 
      }} 
      {...props}
      viewBox="0 0 24 24"
    >
      {/* Cruz dourada do PlayStation Plus */}
      <g fill="#FFD700">
        {/* Barra horizontal da cruz */}
        <rect x="6" y="10.5" width="12" height="3" rx="1.5"/>
        {/* Barra vertical da cruz */}
        <rect x="10.5" y="6" width="3" height="12" rx="1.5"/>
      </g>
      
      {/* Brilho sutil para dar destaque */}
      <g fill="#FFFF00" opacity="0.4">
        <rect x="6" y="10.5" width="12" height="1" rx="0.5"/>
        <rect x="10.5" y="6" width="1" height="12" rx="0.5"/>
      </g>
    </SvgIcon>
  );
};

export default PsPlusIcon; 