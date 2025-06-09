import React from 'react';
import { TextField } from '@mui/material';

/**
 * FormField Component
 * 
 * Standardized text input component for forms with consistent styling and validation
 * 
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.name - Field name
 * @param {string|number} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.type - Input type (text, email, password, number, date, etc.)
 * @param {boolean} props.required - Whether field is required
 * @param {boolean} props.fullWidth - Whether to take full width
 * @param {string} props.margin - Margin variant (none, dense, normal)
 * @param {string} props.variant - Input variant (outlined, filled, standard)
 * @param {string} props.size - Size variant (small, medium)
 * @param {boolean} props.multiline - Whether field is multiline
 * @param {number} props.rows - Number of rows if multiline
 * @param {string} props.helperText - Helper text below field
 * @param {boolean} props.error - Whether field has error
 * @param {string} props.placeholder - Placeholder text
 * @param {Object} props.inputProps - Additional input props (min, max, etc.)
 * @param {Object} props.InputProps - Input component props
 * @param {Object} props.InputLabelProps - Input label props
 * @param {Object} props.sx - Additional styles
 */
const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  fullWidth = true,
  margin = "normal",
  variant = "outlined",
  size = "medium",
  multiline = false,
  rows,
  helperText,
  error = false,
  placeholder,
  inputProps = {},
  InputProps = {},
  InputLabelProps = {},
  sx = {},
  ...props
}) => {
  // Enhanced styling for consistent form appearance
  const fieldSx = {
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
    ...sx
  };

  // Handle date input label behavior
  const labelProps = type === 'date' 
    ? { shrink: true, ...InputLabelProps }
    : InputLabelProps;

  // Handle number input props
  const numberInputProps = type === 'number' 
    ? { 
        inputMode: 'numeric',
        pattern: '[0-9]*',
        ...inputProps 
      }
    : inputProps;

  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      required={required}
      fullWidth={fullWidth}
      margin={margin}
      variant={variant}
      size={size}
      multiline={multiline}
      rows={multiline ? (rows || 4) : undefined}
      helperText={helperText}
      error={error}
      placeholder={placeholder}
      inputProps={numberInputProps}
      InputProps={InputProps}
      InputLabelProps={labelProps}
      sx={fieldSx}
      {...props}
    />
  );
};

export default FormField; 