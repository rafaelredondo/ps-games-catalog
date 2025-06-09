import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  Box,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

/**
 * DataTable Component
 * 
 * Componente de tabela padronizado e reutilizável com funcionalidades avançadas:
 * - Ordenação automática
 * - Seleção múltipla 
 * - Estados de loading e empty
 * - Responsivo
 * - Ações por linha
 * - Customização completa
 * 
 * @param {Object} props
 * @param {Array} props.data - Array de dados para a tabela
 * @param {Array} props.columns - Configuração das colunas
 * @param {boolean} props.loading - Estado de carregamento
 * @param {boolean} props.selectable - Se permite seleção múltipla
 * @param {Function} props.onSelectionChange - Callback para mudança de seleção
 * @param {Function} props.onRowClick - Callback para click na linha
 * @param {Function} props.onSort - Callback para ordenação
 * @param {string} props.orderBy - Campo atual de ordenação
 * @param {string} props.order - Direção da ordenação (asc/desc)
 * @param {Object} props.emptyState - Configuração do estado vazio
 * @param {boolean} props.stickyHeader - Header fixo
 * @param {string} props.size - Tamanho da tabela (small/medium)
 * @param {number} props.maxHeight - Altura máxima da tabela
 * @param {Object} props.sx - Estilos customizados
 */
const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  selectable = false,
  onSelectionChange,
  onRowClick,
  onSort,
  orderBy = '',
  order = 'asc',
  emptyState = {},
  stickyHeader = false,
  size = 'medium',
  maxHeight,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [selected, setSelected] = useState(new Set());

  // Função para ordenação
  const handleSort = (columnId) => {
    if (onSort) {
      const newOrder = orderBy === columnId && order === 'asc' ? 'desc' : 'asc';
      onSort(columnId, newOrder);
    }
  };

  // Função para seleção de item
  const handleSelectItem = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelected));
    }
  };

  // Função para seleção de todos
  const handleSelectAll = () => {
    if (selected.size === data.length) {
      setSelected(new Set());
      if (onSelectionChange) onSelectionChange([]);
    } else {
      const allIds = new Set(data.map(item => item.id));
      setSelected(allIds);
      if (onSelectionChange) onSelectionChange(Array.from(allIds));
    }
  };

  // Função para renderizar valor da célula
  const renderCellValue = (item, column) => {
    if (column.render) {
      return column.render(item, item[column.id]);
    }
    
    const value = item[column.id];
    
    // Tratamento especial para arrays (como platforms, genres)
    if (Array.isArray(value)) {
      return column.separator ? value.join(column.separator) : value.join(', ');
    }
    
    return value || '';
  };

  // Filtrar colunas visíveis em mobile
  const visibleColumns = useMemo(() => {
    if (!isMobile) return columns;
    return columns.filter(col => !col.hideOnMobile);
  }, [columns, isMobile]);

  // Estado de loading
  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <LoadingSpinner variant="inline" />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Carregando dados...
        </Typography>
      </Box>
    );
  }

  // Estado vazio
  if (data.length === 0) {
    return (
      <EmptyState
        type={emptyState.type || 'catalog'}
        title={emptyState.title}
        message={emptyState.message}
        icon={emptyState.icon}
        action={emptyState.action}
      />
    );
  }

  const isSelected = (id) => selected.has(id);
  const isAllSelected = data.length > 0 && selected.size === data.length;
  const isIndeterminate = selected.size > 0 && selected.size < data.length;

  return (
    <TableContainer 
      component={Paper} 
      sx={{
        bgcolor: '#111',
        borderRadius: 2,
        maxHeight,
        ...sx
      }}
      {...props}
    >
      <Table stickyHeader={stickyHeader} size={size}>
        <TableHead>
          <TableRow sx={{ '& th': { borderBottom: '2px solid rgba(255,255,255,0.1)' } }}>
            {/* Coluna de seleção */}
            {selectable && (
              <TableCell padding="checkbox" sx={{ color: 'white' }}>
                <Checkbox
                  color="primary"
                  indeterminate={isIndeterminate}
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                />
              </TableCell>
            )}
            
            {/* Colunas de dados */}
            {visibleColumns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  width: column.width,
                  minWidth: column.minWidth,
                  ...(column.sx || {})
                }}
              >
                {column.sortable && onSort ? (
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
                    onClick={() => handleSort(column.id)}
                    sx={{
                      color: 'white !important',
                      '&.MuiTableSortLabel-active': {
                        color: 'white !important',
                      },
                      '& .MuiTableSortLabel-icon': {
                        color: 'white !important',
                      },
                    }}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}


          </TableRow>
        </TableHead>
        
        <TableBody>
          {data.map((item, index) => {
            const isItemSelected = isSelected(item.id);
            
            return (
              <TableRow
                key={item.id || index}
                id={`game-card-${item.id}`}
                hover
                selected={isItemSelected}
                onClick={() => onRowClick && onRowClick(item)}
                sx={{
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                  '& td': { 
                    color: 'rgba(255,255,255,0.8)', 
                    borderBottom: '1px solid rgba(255,255,255,0.1)' 
                  },
                  cursor: onRowClick ? 'pointer' : 'default',
                  ...(isItemSelected && {
                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                  })
                }}
              >
                {/* Coluna de seleção */}
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onChange={() => handleSelectItem(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ color: 'rgba(255,255,255,0.7)' }}
                    />
                  </TableCell>
                )}

                {/* Colunas de dados */}
                {visibleColumns.map((column) => {
                  if (column.id === 'actions') {
                    return (
                      <TableCell
                        key={column.id}
                        align="center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {column.render ? column.render(item) : (
                          <Tooltip title="Mais opções">
                            <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      sx={column.cellSx || {}}
                    >
                      {renderCellValue(item, column)}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable; 