import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

/**
 * FilterSelect Component
 * 
 * Standardized select component for filters with consistent styling
 * 
 * @param {Object} props
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Select label
 * @param {string} props.name - Field name for forms
 * @param {Array} props.options - Array of options {value, label} or strings
 * @param {string} props.allOptionValue - Value for "all" option (default: "all")
 * @param {string} props.allOptionLabel - Label for "all" option
 * @param {string} props.size - Size variant (small, medium)
 * @param {boolean} props.fullWidth - Whether to take full width
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.variant - Input variant (outlined, filled, standard)
 * @param {Object} props.sx - Additional styles for FormControl
 * @param {Object} props.SelectProps - Additional props for Select component
 */
const FilterSelect = ({
  value,
  onChange,
  label,
  name,
  options = [],
  allOptionValue = "all",
  allOptionLabel,
  size = "small",
  fullWidth = true,
  required = false,
  variant = "outlined",
  sx = {},
  SelectProps = {},
  ...props
}) => {
  // Generate label ID for accessibility
  const labelId = label ? `${label.toLowerCase().replace(/\s+/g, '-')}-select-label` : 'filter-select-label';
  
  // Determine if options are objects or strings
  const isOptionObjects = options.length > 0 && typeof options[0] === 'object';
  
  // Default "all" option label if not provided
  const defaultAllLabel = allOptionLabel || 
    (label?.startsWith('Plataforma') ? 'Todas as Plataformas' :
     label?.startsWith('Gênero') ? 'Todos os Gêneros' :
     label?.startsWith('Status') ? 'Todos' :
     label?.startsWith('Publisher') ? 'Todos os Publishers' :
     `Todos os ${label || 'itens'}`);

  return (
    <FormControl 
      fullWidth={fullWidth} 
      variant={variant} 
      size={size}
      required={required}
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
      {...props}
    >
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        value={value}
        label={label}
        name={name}
        onChange={onChange}
        sx={{
          borderRadius: 1,
        }}
        {...SelectProps}
      >
        {/* All option */}
        <MenuItem value={allOptionValue}>
          {defaultAllLabel}
        </MenuItem>
        
        {/* Dynamic options */}
        {options.map((option) => {
          const optionValue = isOptionObjects ? option.value : option;
          const optionLabel = isOptionObjects ? option.label : option;
          
          return (
            <MenuItem key={optionValue} value={optionValue}>
              {optionLabel}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default FilterSelect; 