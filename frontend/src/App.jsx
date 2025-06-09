import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GamesProvider } from './contexts/GamesContext';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { DropdownCacheProvider } from './contexts/DropdownCacheContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ConnectionErrorBoundary from './components/ConnectionErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import AddGame from './pages/AddGame';
import EditGame from './pages/EditGame';
import GameDetails from './pages/GameDetails';
import CsvPage from './pages/CsvPage';
import GameWrapped from './pages/GameWrapped';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';


// Creating a custom theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0070cc', // PlayStation color
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontSize: '1.6rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    body2: {
      fontSize: '0.85rem',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 500,
          cursor: 'pointer',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px',
          '&:last-child': {
            paddingBottom: 8,
          },
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: {
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          cursor: 'pointer',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 4,
          height: 24,
          fontSize: '0.84rem',
          cursor: 'pointer',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary 
      showErrorDetails={import.meta.env.DEV}
      onError={(error, errorInfo) => {
        // Log em produção para monitoring
        console.error('🚨 App Error:', error, errorInfo);
      }}
    >
      <AuthProvider>
        <SettingsProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <NotificationProvider>
              <ConnectionErrorBoundary>
                <DropdownCacheProvider>
                  <GamesProvider>
                    <Router>
                      <ScrollToTop />
                      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                        <ProtectedRoute>
                          <Navbar />
                          <main style={{ flex: 1 }}>
                            <ErrorBoundary>
                              <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/add" element={<AddGame />} />
                                <Route path="/edit/:id" element={<EditGame />} />
                                <Route path="/game/:id" element={<GameDetails />} />
                                <Route path="/csv" element={<CsvPage />} />
                                <Route path="/wrapped" element={<GameWrapped />} />
                              </Routes>
                            </ErrorBoundary>
                          </main>
                        </ProtectedRoute>
                      </div>
                    </Router>
                  </GamesProvider>
                </DropdownCacheProvider>
              </ConnectionErrorBoundary>
            </NotificationProvider>
          </ThemeProvider>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
