import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

/**
 * SearchInput Component
 * 
 * Standardized search input component with search icon and consistent styling
 * 
 * @param {Object} props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Input label text
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.size - Size variant (small, medium)
 * @param {boolean} props.fullWidth - Whether to take full width
 * @param {Object} props.sx - Additional styles
 * @param {Object} props.InputProps - Additional input props
 * @param {Object} props.startAdornment - Custom start adornment (overrides search icon)
 */
const SearchInput = ({
  value,
  onChange,
  label = "Buscar",
  placeholder,
  size = "small",
  fullWidth = true,
  sx = {},
  InputProps = {},
  startAdornment,
  ...props
}) => {
  const defaultStartAdornment = startAdornment || (
    <InputAdornment position="start">
      <SearchIcon fontSize="small" />
    </InputAdornment>
  );

  return (
    <TextField
      fullWidth={fullWidth}
      size={size}
      label={label}
      placeholder={placeholder}
      variant="outlined"
      value={value}
      onChange={onChange}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 1,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
          },
        },
        ...sx
      }}
      InputProps={{
        startAdornment: defaultStartAdornment,
        ...InputProps,
      }}
      {...props}
    />
  );
};

export default SearchInput; 