import React from 'react';
import { 
  Autocomplete, 
  TextField, 
  Chip, 
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

/**
 * ChipSelect Component
 * 
 * Standardized component for multiple selection with chips display.
 * Supports both simple Select (for fixed options) and Autocomplete (for dynamic/freeSolo)
 * 
 * @param {Object} props
 * @param {Array} props.value - Selected values array
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Available options array
 * @param {string} props.label - Field label
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.freeSolo - Allow free text input (uses Autocomplete)
 * @param {boolean} props.required - Whether field is required
 * @param {boolean} props.fullWidth - Whether to take full width
 * @param {string} props.margin - Margin variant (none, dense, normal)
 * @param {string} props.variant - Input variant (outlined, filled, standard)
 * @param {string} props.size - Size variant (small, medium)
 * @param {string} props.helperText - Helper text below field
 * @param {boolean} props.error - Whether field has error
 * @param {Function} props.onBlur - Blur handler
 * @param {string} props.chipVariant - Chip variant (filled, outlined)
 * @param {string} props.chipColor - Chip color (default, primary, secondary)
 * @param {Object} props.sx - Additional styles
 * @param {Object} props.ChipProps - Additional chip props
 * @param {Object} props.TextFieldProps - Additional TextField props
 */
const ChipSelect = ({
  value = [],
  onChange,
  options = [],
  label,
  placeholder,
  freeSolo = false,
  required = false,
  fullWidth = true,
  margin = "normal",
  variant = "outlined",
  size = "medium",
  helperText,
  error = false,
  onBlur,
  chipVariant = "outlined",
  chipColor = "default",
  sx = {},
  ChipProps = {},
  TextFieldProps = {},
  ...props
}) => {
  // Generate label ID for accessibility
  const labelId = label ? `${label.toLowerCase().replace(/\s+/g, '-')}-select-label` : 'chip-select-label';

  // Enhanced styling
  const componentSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        borderColor: error ? 'error.main' : 'primary.main',
      },
      '&.Mui-focused': {
        boxShadow: error 
          ? '0 0 0 2px rgba(244, 67, 54, 0.2)'
          : '0 0 0 2px rgba(25, 118, 210, 0.2)',
      },
      '&.Mui-error': {
        borderColor: 'error.main',
      },
    },
    '& .MuiChip-root': {
      borderRadius: 1,
      fontSize: '0.875rem',
      height: 28,
    },
    ...sx
  };

  // For freeSolo mode, use Autocomplete
  if (freeSolo) {
    return (
      <Autocomplete
        multiple
        freeSolo
        options={options}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        fullWidth={fullWidth}
        size={size}
        sx={componentSx}
        renderTags={(selectedValues, getTagProps) =>
          selectedValues.map((option, index) => (
            <Chip 
              variant={chipVariant}
              color={chipColor}
              label={option} 
              {...getTagProps({ index })}
              {...ChipProps}
              key={`${option}-${index}`}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            margin={margin}
            variant={variant}
            required={required}
            helperText={helperText}
            error={error}
            sx={{
              '& .MuiInputLabel-root': {
                fontSize: size === 'small' ? '0.875rem' : '1rem',
                '&.Mui-focused': {
                  color: error ? 'error.main' : 'primary.main',
                },
              },
              '& .MuiFormHelperText-root': {
                fontSize: '0.75rem',
                marginLeft: 1,
                marginRight: 1,
              },
            }}
            {...TextFieldProps}
          />
        )}
        {...props}
      />
    );
  }

  // For fixed options, use Select with chips
  return (
    <FormControl 
      fullWidth={fullWidth} 
      variant={variant} 
      size={size}
      required={required}
      margin={margin}
      error={error}
      sx={componentSx}
      {...props}
    >
      <InputLabel id={labelId} error={error}>
        {label}
      </InputLabel>
      <Select
        labelId={labelId}
        multiple
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        label={label}
        error={error}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((selectedValue) => (
              <Chip 
                key={selectedValue} 
                label={selectedValue} 
                variant={chipVariant}
                color={chipColor}
                size={size === 'small' ? 'small' : 'medium'}
                {...ChipProps}
              />
            ))}
          </Box>
        )}
        sx={{
          borderRadius: 1,
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <Box sx={{ 
          fontSize: '0.75rem', 
          color: error ? 'error.main' : 'text.secondary',
          mt: 0.5,
          mx: 1.5,
          lineHeight: 1.66
        }}>
          {helperText}
        </Box>
      )}
    </FormControl>
  );
};

export default ChipSelect; 