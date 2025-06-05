import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  useMediaQuery,
  useTheme,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress
} from '@mui/material';
import { 
  EmojiEvents as TrophyIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
  Star as StarIcon, 
  Category as CategoryIcon,
  Business as PublisherIcon,
  ArrowBack as ArrowBackIcon,
  Storage as PlatformIcon,
  Album as PhysicalIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  RadioButtonChecked as DotIcon,
  RadioButtonUnchecked as EmptyDotIcon
} from '@mui/icons-material';
import { useGames } from '../contexts/GamesContext';

const COLORS = ['#FF6AD5', '#C774E8', '#AD8CFF', '#4D96FF', '#00C49F', '#FFBB28', '#FF8042', '#6BCB77', '#FFD700', '#F9A825'];

function getMetacriticColor(score) {
  if (!score) return '#888';
  if (score >= 75) return '#6c3';
  if (score >= 50) return '#fc3';
  return '#f00';
}

function formatPlayTime(hours) {
  if (hours === null || hours === undefined) return '?';
  if (hours === 0) return '<1h';
  if (hours === 1) return '1h';
  return `${hours}h`;
}

export default function GameWrapped() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { games, loading, error } = useGames();
  const [stats, setStats] = useState({
    genres: [],
    longestGames: [],
    shortestGames: [],
    topRatedGames: [],
    publishers: [],
    platforms: [],
    format: { physical: 0, digital: 0 }
  });

  // Swipe navigation state
  const [currentSection, setCurrentSection] = useState(0);
  const sectionRefs = useRef([]);
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  const sections = [
    { title: "Top Metacritic", icon: <TrophyIcon /> },
    { title: "Mais Longos", icon: <ScheduleIcon /> },
    { title: "Mais Curtos", icon: <SpeedIcon /> },
    { title: "Gêneros & Publishers", icon: <CategoryIcon /> },
    { title: "Plataformas", icon: <PlatformIcon /> },
    { title: "Físico vs Digital", icon: <PhysicalIcon /> }
  ];

  useEffect(() => {
    if (games.length > 0) calculateStats(games);
  }, [games]);

  // Swipe navigation functions
  const minSwipeDistance = 50;

  const nextSection = () => {
    setCurrentSection(prev => Math.min(prev + 1, sections.length - 1));
  };

  const prevSection = () => {
    setCurrentSection(prev => Math.max(prev - 1, 0));
  };

  const goToSection = (index) => {
    setCurrentSection(index);
  };

  const onTouchStart = (e) => {
    touchEndRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    
    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSection < sections.length - 1) {
      nextSection();
    }
    if (isRightSwipe && currentSection > 0) {
      prevSection();
    }
  };

  function calculateStats(gamesData) {
    const count = (arr, key) => {
      const map = {};
      arr.forEach(game => {
        (game[key] || []).forEach(val => { map[val] = (map[val] || 0) + 1; });
      });
      return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };

    // Count physical vs digital games
    const physical = gamesData.filter(game => game.mediaTypes && game.mediaTypes.includes("Físico")).length;
    const digital = gamesData.filter(game => game.mediaTypes && game.mediaTypes.includes("Digital")).length;

    setStats({
      genres: count(gamesData, 'genres').slice(0, 4),
      longestGames: [...gamesData].filter(g => g.playTime > 0).sort((a, b) => b.playTime - a.playTime).slice(0, 4),
      shortestGames: [...gamesData].filter(g => g.playTime > 0).sort((a, b) => a.playTime - b.playTime).slice(0, 4),
      topRatedGames: [...gamesData].filter(g => g.metacritic != null).sort((a, b) => b.metacritic - a.metacritic).slice(0, 16),
      publishers: count(gamesData, 'publishers').slice(0, 4),
      platforms: count(gamesData, 'platforms'),
      format: { physical, digital }
    });
  }

  // Animated gradient header
  const Header = () => (
    <Paper elevation={3} sx={{
      position: 'relative',
      zIndex: 1,
      textAlign: 'center',
      py: isMobile ? 3 : 4,
      mb: 3,
      background: 'linear-gradient(90deg,#FF6AD5 0%,#C774E8 40%,#AD8CFF 70%,#4D96FF 100%)',
      borderRadius: 4,
      color: 'white',
      overflow: 'hidden',
    }}>
      <Typography variant={isMobile ? 'h3' : 'h2'} sx={{ fontWeight: 900, letterSpacing: 2, textShadow: '0 2px 16px #0008' }}>
        Game Wrapped 🎮
      </Typography>
      <Typography variant="h5" sx={{ mt: 1, fontWeight: 400, opacity: 0.92 }}>
        Uma retrospectiva extravagante da sua coleção!
      </Typography>
    </Paper>
  );

  // Navigation controls for mobile
  const SwipeNavigation = () => (
    <Box sx={{ display: isMobile ? 'block' : 'none', mb: 3 }}>
      {/* Section indicators */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
        {sections.map((_, index) => (
          <IconButton
            key={index}
            size="small"
            onClick={() => goToSection(index)}
            sx={{ 
              color: index === currentSection ? COLORS[index] : '#bbb',
              mx: 0.5,
              transition: 'all 0.3s ease'
            }}
          >
            {index === currentSection ? <DotIcon /> : <EmptyDotIcon />}
          </IconButton>
        ))}
      </Box>

      {/* Navigation controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
        <IconButton 
          onClick={prevSection} 
          disabled={currentSection === 0}
          sx={{ 
            bgcolor: currentSection === 0 ? 'transparent' : 'white',
            color: currentSection === 0 ? '#ccc' : COLORS[currentSection],
            boxShadow: currentSection === 0 ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': { bgcolor: currentSection === 0 ? 'transparent' : 'white' }
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        {/* Current section info */}
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
            {currentSection + 1} de {sections.length}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS[currentSection] }}>
            {sections[currentSection].title}
          </Typography>
        </Box>

        <IconButton 
          onClick={nextSection} 
          disabled={currentSection === sections.length - 1}
          sx={{ 
            bgcolor: currentSection === sections.length - 1 ? 'transparent' : 'white',
            color: currentSection === sections.length - 1 ? '#ccc' : COLORS[currentSection],
            boxShadow: currentSection === sections.length - 1 ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': { bgcolor: currentSection === sections.length - 1 ? 'transparent' : 'white' }
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Progress bar */}
      <Box sx={{ mt: 2, px: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={(currentSection + 1) / sections.length * 100}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              bgcolor: COLORS[currentSection],
              borderRadius: 3,
              transition: 'all 0.4s ease'
            }
          }}
        />
      </Box>
    </Box>
  );

  // Card component with clean design
  const CleanCard = ({ icon, title, children, color, ...props }) => (
    <Paper elevation={2} {...props} sx={{
      borderRadius: 3,
      overflow: 'hidden',
      height: '100%',
      ...props.sx
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5, 
        p: 2,
        bgcolor: color,
        color: 'white'
      }}>
        {icon}
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        {children}
      </Box>
    </Paper>
  );

  if (loading) return <Box minHeight="80vh" display="flex" alignItems="center" justifyContent="center"><CircularProgress size={40} /></Box>;
  if (error) return <Container><Box mt={2}><Typography color="error">{error}</Typography></Box></Container>;

  // Calculate total and percentages for physical/digital
  const totalGames = stats.format.physical + stats.format.digital;
  const physicalPercentage = totalGames ? ((stats.format.physical / totalGames) * 100).toFixed(1) : 0;
  const digitalPercentage = totalGames ? ((stats.format.digital / totalGames) * 100).toFixed(1) : 0;

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', background: '#f5f5f5', py: 4 }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mx: 'auto' }}>
        <Header />
        <SwipeNavigation />
        
        {/* Swipe container for mobile */}
        <Box
          sx={{
            display: isMobile ? 'block' : 'none',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '60vh'
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Box
            sx={{
              display: 'flex',
              width: `${sections.length * 100}%`,
              transform: `translateX(-${currentSection * (100 / sections.length)}%)`,
              transition: 'transform 0.3s ease',
            }}
          >
            {/* Section 0: Top Metacritic */}
            <Box sx={{ width: `${100 / sections.length}%`, px: 1 }}>
              <CleanCard icon={<TrophyIcon />} title="Top Metacritic" color={COLORS[8]}>
                <List disablePadding>
                  {stats.topRatedGames.slice(0, 8).map((game, idx) => (
                    <ListItem key={game.id} divider={idx < 7} disablePadding sx={{ py: 1.5 }}>
                      <Typography sx={{ 
                        fontWeight: 700, 
                        color: COLORS[8], 
                        mr: 2, 
                        fontSize: '1.1rem', 
                        width: 28, 
                        textAlign: 'center',
                        minWidth: 28
                      }}>
                        {idx + 1}
                      </Typography>
                      <ListItemText 
                        primary={
                          <Typography sx={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.3 }}>
                            {game.name}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <StarIcon sx={{ fontSize: 16, color: getMetacriticColor(game.metacritic), mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: getMetacriticColor(game.metacritic), fontWeight: 700 }}>
                              {game.metacritic}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CleanCard>
            </Box>

            {/* Section 1: Mais Longos */}
            <Box sx={{ width: `${100 / sections.length}%`, px: 1 }}>
              <CleanCard icon={<ScheduleIcon />} title="Mais Longos" color={COLORS[5]}>
                <List disablePadding>
                  {stats.longestGames.map((game, idx) => (
                    <ListItem key={game.id} disablePadding sx={{ py: 2, minHeight: 56 }}>
                      <Typography sx={{ 
                        fontWeight: 700, 
                        color: COLORS[5], 
                        mr: 2, 
                        fontSize: '1.1rem', 
                        width: 32, 
                        textAlign: 'center',
                        minWidth: 32
                      }}>
                        {idx + 1}
                      </Typography>
                      <ListItemText 
                        primary={
                          <Typography sx={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.3 }}>
                            {game.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: COLORS[5], fontWeight: 700, mt: 0.5 }}>
                            {formatPlayTime(game.playTime)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CleanCard>
            </Box>

            {/* Section 2: Mais Curtos */}
            <Box sx={{ width: `${100 / sections.length}%`, px: 1 }}>
              <CleanCard icon={<SpeedIcon />} title="Mais Curtos" color={COLORS[6]}>
                <List disablePadding>
                  {stats.shortestGames.map((game, idx) => (
                    <ListItem key={game.id} disablePadding sx={{ py: 2, minHeight: 56 }}>
                      <Typography sx={{ 
                        fontWeight: 700, 
                        color: COLORS[6], 
                        mr: 2, 
                        fontSize: '1.1rem', 
                        width: 32, 
                        textAlign: 'center',
                        minWidth: 32
                      }}>
                        {idx + 1}
                      </Typography>
                      <ListItemText 
                        primary={
                          <Typography sx={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.3 }}>
                            {game.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: COLORS[6], fontWeight: 700, mt: 0.5 }}>
                            {formatPlayTime(game.playTime)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CleanCard>
            </Box>

            {/* Section 3: Gêneros & Publishers */}
            <Box sx={{ width: `${100 / sections.length}%`, px: 1 }}>
              <CleanCard icon={<CategoryIcon />} title="Gêneros & Publishers Favoritos" color={COLORS[0]}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: COLORS[0] }}>
                  🎯 Gêneros Favoritos
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                  {stats.genres.map((genre, idx) => (
                    <Chip
                      key={genre.name}
                      label={`${genre.name} (${genre.value})`}
                      sx={{
                        minHeight: 44,
                        fontSize: '1rem',
                        fontWeight: 600,
                        bgcolor: COLORS[idx % COLORS.length],
                        color: 'white',
                        '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.2s' }
                      }}
                    />
                  ))}
                </Box>
                
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: COLORS[0] }}>
                  🏢 Publishers Favoritos
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {stats.publishers.map((publisher, idx) => (
                    <Chip
                      key={publisher.name}
                      label={`${publisher.name} (${publisher.value})`}
                      sx={{
                        minHeight: 44,
                        fontSize: '1rem',
                        fontWeight: 600,
                        bgcolor: COLORS[(idx + 4) % COLORS.length],
                        color: 'white',
                        '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.2s' }
                      }}
                    />
                  ))}
                </Box>
              </CleanCard>
            </Box>

            {/* Section 4: Plataformas */}
            <Box sx={{ width: `${100 / sections.length}%`, px: 1 }}>
              <CleanCard icon={<PlatformIcon />} title="Número de Jogos por Plataforma" color={COLORS[3]}>
                <List disablePadding>
                  {stats.platforms.map((platform, idx) => {
                    const maxGames = Math.max(...stats.platforms.map(p => p.value));
                    const percentage = (platform.value / maxGames) * 100;
                    
                    return (
                      <ListItem key={platform.name} disablePadding sx={{ py: 1.5, flexDirection: 'column', alignItems: 'stretch' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                          <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
                            {platform.name}
                          </Typography>
                          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: COLORS[3] }}>
                            {platform.value}
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          width: '100%', 
                          height: 8, 
                          bgcolor: '#e0e0e0', 
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}>
                          <Box sx={{ 
                            width: `${percentage}%`, 
                            height: '100%', 
                            bgcolor: COLORS[idx % COLORS.length],
                            transition: 'width 0.6s ease',
                            borderRadius: 4
                          }} />
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              </CleanCard>
            </Box>

            {/* Section 5: Físico vs Digital */}
            <Box sx={{ width: `${100 / sections.length}%`, px: 1 }}>
              <CleanCard icon={<PhysicalIcon />} title="Físico vs Digital" color={COLORS[2]}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Physical Card */}
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: '#f8f9fa' }}>
                    <Typography sx={{ fontSize: '3rem', mb: 1 }}>📀</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS[2], mb: 1 }}>
                      {stats.format.physical}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Jogos Físicos
                    </Typography>
                    <Box sx={{ 
                      width: '100%', 
                      height: 8, 
                      bgcolor: '#e0e0e0', 
                      borderRadius: 4,
                      overflow: 'hidden',
                      mb: 1
                    }}>
                      <Box sx={{ 
                        width: `${physicalPercentage}%`, 
                        height: '100%', 
                        bgcolor: COLORS[2],
                        transition: 'width 0.8s ease',
                        borderRadius: 4
                      }} />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS[2] }}>
                      {physicalPercentage}%
                    </Typography>
                  </Paper>

                  {/* Digital Card */}
                  <Paper elevation={1} sx={{ p: 3, borderRadius: 3, textAlign: 'center', bgcolor: '#f8f9fa' }}>
                    <Typography sx={{ fontSize: '3rem', mb: 1 }}>💾</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS[4], mb: 1 }}>
                      {stats.format.digital}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Jogos Digitais
                    </Typography>
                    <Box sx={{ 
                      width: '100%', 
                      height: 8, 
                      bgcolor: '#e0e0e0', 
                      borderRadius: 4,
                      overflow: 'hidden',
                      mb: 1
                    }}>
                      <Box sx={{ 
                        width: `${digitalPercentage}%`, 
                        height: '100%', 
                        bgcolor: COLORS[4],
                        transition: 'width 0.8s ease',
                        borderRadius: 4
                      }} />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS[4] }}>
                      {digitalPercentage}%
                    </Typography>
                  </Paper>
                </Box>
              </CleanCard>
            </Box>
          </Box>
        </Box>

        {/* Desktop view - Grid layout unchanged */}
        <Grid container spacing={3} justifyContent="center" sx={{ display: isMobile ? 'none' : 'flex' }}>
          {/* Top Metacritic adaptativo */}
          <Grid size={{ xs: 12 }}>
            <CleanCard icon={<TrophyIcon />} title="Top Metacritic" color={COLORS[8]}>
              {isMobile ? (
                // Mobile: Lista vertical simples
                <List disablePadding>
                  {stats.topRatedGames.slice(0, 8).map((game, idx) => (
                    <ListItem key={game.id} divider={idx < 7} disablePadding sx={{ py: 1.5 }}>
                      <Typography sx={{ 
                        fontWeight: 700, 
                        color: COLORS[8], 
                        mr: 2, 
                        fontSize: '1.1rem', 
                        width: 28, 
                        textAlign: 'center',
                        minWidth: 28
                      }}>
                        {idx + 1}
                      </Typography>
                      <ListItemText 
                        primary={
                          <Typography sx={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.3 }}>
                            {game.name}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <StarIcon sx={{ fontSize: 16, color: getMetacriticColor(game.metacritic), mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: getMetacriticColor(game.metacritic), fontWeight: 700 }}>
                              {game.metacritic}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                // Desktop: 4 colunas como antes
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  {/* Primeira coluna - jogos 1-4 */}
                  <Box sx={{ width: '23%' }}>
                    <List disablePadding>
                      {stats.topRatedGames.slice(0, 4).map((game, idx) => (
                        <ListItem key={game.id} divider={idx < 3} disablePadding sx={{ py: 1 }}>
                          <Typography sx={{ fontWeight: 700, color: COLORS[8], mr: 1, fontSize: '0.9rem', width: 18, textAlign: 'center' }}>
                            {idx + 1}
                          </Typography>
                          <ListItemText 
                            primary={
                              <Tooltip title={game.name}>
                                <Typography noWrap sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                  {game.name}
                                </Typography>
                              </Tooltip>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <StarIcon sx={{ fontSize: 14, color: getMetacriticColor(game.metacritic), mr: 0.5 }} />
                                <Typography variant="body2" sx={{ color: getMetacriticColor(game.metacritic), fontWeight: 700 }}>
                                  {game.metacritic}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  
                  {/* Segunda coluna - jogos 5-8 */}
                  <Box sx={{ width: '23%' }}>
                    <List disablePadding>
                      {stats.topRatedGames.slice(4, 8).map((game, idx) => (
                        <ListItem key={game.id} divider={idx < 3} disablePadding sx={{ py: 1 }}>
                          <Typography sx={{ fontWeight: 700, color: COLORS[8], mr: 1, fontSize: '0.9rem', width: 18, textAlign: 'center' }}>
                            {idx + 5}
                          </Typography>
                          <ListItemText 
                            primary={
                              <Tooltip title={game.name}>
                                <Typography noWrap sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                  {game.name}
                                </Typography>
                              </Tooltip>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <StarIcon sx={{ fontSize: 14, color: getMetacriticColor(game.metacritic), mr: 0.5 }} />
                                <Typography variant="body2" sx={{ color: getMetacriticColor(game.metacritic), fontWeight: 700 }}>
                                  {game.metacritic}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  
                  {/* Terceira coluna - jogos 9-12 */}
                  <Box sx={{ width: '23%' }}>
                    <List disablePadding>
                      {stats.topRatedGames.slice(8, 12).map((game, idx) => (
                        <ListItem key={game.id} divider={idx < 3} disablePadding sx={{ py: 1 }}>
                          <Typography sx={{ fontWeight: 700, color: COLORS[8], mr: 1, fontSize: '0.9rem', width: 18, textAlign: 'center' }}>
                            {idx + 9}
                          </Typography>
                          <ListItemText 
                            primary={
                              <Tooltip title={game.name}>
                                <Typography noWrap sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                  {game.name}
                                </Typography>
                              </Tooltip>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <StarIcon sx={{ fontSize: 14, color: getMetacriticColor(game.metacritic), mr: 0.5 }} />
                                <Typography variant="body2" sx={{ color: getMetacriticColor(game.metacritic), fontWeight: 700 }}>
                                  {game.metacritic}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  
                  {/* Quarta coluna - jogos 13-16 */}
                  <Box sx={{ width: '23%' }}>
                    <List disablePadding>
                      {stats.topRatedGames.slice(12, 16).map((game, idx) => (
                        <ListItem key={game.id} divider={idx < 3} disablePadding sx={{ py: 1 }}>
                          <Typography sx={{ fontWeight: 700, color: COLORS[8], mr: 1, fontSize: '0.9rem', width: 18, textAlign: 'center' }}>
                            {idx + 13}
                          </Typography>
                          <ListItemText 
                            primary={
                              <Tooltip title={game.name}>
                                <Typography noWrap sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                  {game.name}
                                </Typography>
                              </Tooltip>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <StarIcon sx={{ fontSize: 14, color: getMetacriticColor(game.metacritic), mr: 0.5 }} />
                                <Typography variant="body2" sx={{ color: getMetacriticColor(game.metacritic), fontWeight: 700 }}>
                                  {game.metacritic}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              )}
            </CleanCard>
          </Grid>

          {/* Mais Longos e Mais Curtos - layout adaptativo */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CleanCard icon={<ScheduleIcon />} title="Mais Longos" color={COLORS[5]}>
              <List disablePadding>
                {stats.longestGames.map((game, idx) => (
                  <ListItem key={game.id} divider={idx < stats.longestGames.length-1} disablePadding sx={{ 
                    py: isMobile ? 2 : 1.5,
                    minHeight: isMobile ? 56 : 'auto'
                  }}>
                    <Typography sx={{ 
                      fontWeight: 700, 
                      color: COLORS[5], 
                      mr: isMobile ? 2 : 1.5, 
                      fontSize: isMobile ? '1.2rem' : '1.1rem', 
                      width: isMobile ? 32 : 24, 
                      textAlign: 'center',
                      minWidth: isMobile ? 32 : 24
                    }}>
                      {idx + 1}
                    </Typography>
                    <ListItemText 
                      primary={
                        isMobile ? (
                          <Typography sx={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.3 }}>
                            {game.name}
                          </Typography>
                        ) : (
                          <Tooltip title={game.name}>
                            <Typography noWrap sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
                              {game.name}
                            </Typography>
                          </Tooltip>
                        )
                      }
                      secondary={formatPlayTime(game.playTime)} 
                      secondaryTypographyProps={{ 
                        color: 'text.secondary', 
                        fontWeight: 'medium',
                        fontSize: isMobile ? '0.9rem' : '0.8rem'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CleanCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CleanCard icon={<SpeedIcon />} title="Mais Curtos" color={COLORS[6]}>
              <List disablePadding>
                {stats.shortestGames.map((game, idx) => (
                  <ListItem key={game.id} divider={idx < stats.shortestGames.length-1} disablePadding sx={{ 
                    py: isMobile ? 2 : 1.5,
                    minHeight: isMobile ? 56 : 'auto'
                  }}>
                    <Typography sx={{ 
                      fontWeight: 700, 
                      color: COLORS[6], 
                      mr: isMobile ? 2 : 1.5, 
                      fontSize: isMobile ? '1.2rem' : '1.1rem', 
                      width: isMobile ? 32 : 24, 
                      textAlign: 'center',
                      minWidth: isMobile ? 32 : 24
                    }}>
                      {idx + 1}
                    </Typography>
                    <ListItemText 
                      primary={
                        isMobile ? (
                          <Typography sx={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.3 }}>
                            {game.name}
                          </Typography>
                        ) : (
                          <Tooltip title={game.name}>
                            <Typography noWrap sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
                              {game.name}
                            </Typography>
                          </Tooltip>
                        )
                      }
                      secondary={formatPlayTime(game.playTime)} 
                      secondaryTypographyProps={{ 
                        color: 'text.secondary', 
                        fontWeight: 'medium',
                        fontSize: isMobile ? '0.9rem' : '0.8rem'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CleanCard>
          </Grid>

          {/* Gêneros e Publishers Favoritos - layout adaptativo */}
          <Grid size={{ xs: 12 }}>
            <CleanCard icon={<CategoryIcon />} title="Gêneros & Publishers Favoritos" color={COLORS[0]}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 2.5 : 3 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ 
                    mb: isMobile ? 1.5 : 1, 
                    fontWeight: 600, 
                    color: 'text.secondary',
                    fontSize: isMobile ? '1.1rem' : '1rem'
                  }}>
                    Gêneros:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 1.5 : 1 }}>
                    {stats.genres.map((genre, idx) => (
                      <Chip 
                        key={genre.name} 
                        label={`${genre.name} (${genre.value})`} 
                        sx={{ 
                          bgcolor: COLORS[idx % COLORS.length], 
                          color: 'white', 
                          fontWeight: 500, 
                          fontSize: isMobile ? '1rem' : '0.9rem',
                          py: isMobile ? 3 : 2.5,
                          px: isMobile ? 1 : 0.5,
                          minHeight: isMobile ? 44 : 'auto',
                          '& .MuiChip-label': {
                            px: isMobile ? 2 : 1
                          }
                        }} 
                      />
                    ))}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ 
                    mb: isMobile ? 1.5 : 1, 
                    fontWeight: 600, 
                    color: 'text.secondary',
                    fontSize: isMobile ? '1.1rem' : '1rem'
                  }}>
                    Publishers:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 1.5 : 1 }}>
                    {stats.publishers.map((publisher, idx) => (
                      <Chip 
                        key={publisher.name} 
                        label={`${publisher.name} (${publisher.value})`} 
                        sx={{ 
                          bgcolor: COLORS[(idx+5) % COLORS.length], 
                          color: 'white', 
                          fontWeight: 500, 
                          fontSize: isMobile ? '1rem' : '0.9rem',
                          py: isMobile ? 3 : 2.5,
                          px: isMobile ? 1 : 0.5,
                          minHeight: isMobile ? 44 : 'auto',
                          '& .MuiChip-label': {
                            px: isMobile ? 2 : 1
                          }
                        }} 
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </CleanCard>
          </Grid>
          
          {/* Número de Jogos por Plataforma - layout adaptativo */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CleanCard icon={<PlatformIcon />} title="Número de Jogos por Plataforma" color={COLORS[3]}>
              {isMobile ? (
                // Mobile: Lista vertical mais touch-friendly
                <List disablePadding>
                  {stats.platforms.map((platform, index) => {
                    const totalGames = stats.platforms.reduce((sum, p) => sum + p.value, 0);
                    const percentage = ((platform.value / totalGames) * 100).toFixed(1);
                    
                    return (
                      <ListItem key={platform.name} divider={index < stats.platforms.length - 1} disablePadding sx={{ py: 2 }}>
                        <ListItemText 
                          primary={
                            <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
                              {platform.name}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {platform.value} jogos
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                  {percentage}%
                                </Typography>
                              </Box>
                              <Box 
                                sx={{ 
                                  height: 8, 
                                  width: '100%',
                                  bgcolor: 'rgba(0,0,0,0.1)',
                                  borderRadius: 2,
                                  overflow: 'hidden'
                                }}
                              >
                                <Box 
                                  sx={{ 
                                    height: '100%', 
                                    width: `${percentage}%`, 
                                    bgcolor: COLORS[index % COLORS.length],
                                    transition: 'width 0.5s ease'
                                  }} 
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                // Desktop: Tabela como antes
                <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'rgba(0,0,0,0.04)' }}>Plataforma</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'rgba(0,0,0,0.04)' }}>Jogos</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'rgba(0,0,0,0.04)' }}>Proporção</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.platforms.map((platform, index) => {
                        const totalGames = stats.platforms.reduce((sum, p) => sum + p.value, 0);
                        const percentage = ((platform.value / totalGames) * 100).toFixed(1);
                        
                        return (
                          <TableRow key={platform.name} hover>
                            <TableCell component="th" scope="row">
                              {platform.name}
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="medium">
                                {platform.value}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box 
                                  sx={{ 
                                    height: 8, 
                                    width: `${Math.min(percentage * 1.8, 100)}%`, 
                                    bgcolor: COLORS[index % COLORS.length],
                                    borderRadius: 2
                                  }} 
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {percentage}%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CleanCard>
          </Grid>

          {/* Físico vs Digital - layout adaptativo */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CleanCard icon={<PhysicalIcon />} title="Físico vs Digital" color={COLORS[2]}>
              {isMobile ? (
                // Mobile: Cards visuais em vez de tabela
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { name: 'Físico', value: stats.format.physical, color: COLORS[0], emoji: '📀' },
                    { name: 'Digital', value: stats.format.digital, color: COLORS[1], emoji: '💾' }
                  ].map((format) => {
                    const percentage = totalGames ? ((format.value / totalGames) * 100).toFixed(1) : 0;
                    
                    return (
                      <Box key={format.name} sx={{ 
                        p: 2.5, 
                        bgcolor: 'rgba(0,0,0,0.03)', 
                        borderRadius: 2,
                        border: `2px solid ${format.color}20`
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                          <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {format.emoji} {format.name}
                          </Typography>
                          <Typography variant="h6" sx={{ color: format.color, fontWeight: 700 }}>
                            {format.value}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1 }}>
                          <Box 
                            sx={{ 
                              height: 12, 
                              width: '100%',
                              bgcolor: 'rgba(0,0,0,0.1)',
                              borderRadius: 2,
                              overflow: 'hidden'
                            }}
                          >
                            <Box 
                              sx={{ 
                                height: '100%', 
                                width: `${percentage}%`, 
                                bgcolor: format.color,
                                transition: 'width 0.8s ease',
                                borderRadius: 2
                              }} 
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" textAlign="center" fontWeight="medium">
                          {percentage}% da coleção
                        </Typography>
                      </Box>
                    );
                  })}
                  <Box sx={{ textAlign: 'center', mt: 1, p: 1.5, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                      Total: {totalGames} jogos
                    </Typography>
                  </Box>
                </Box>
              ) : (
                // Desktop: Tabela como antes
                <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'rgba(0,0,0,0.04)' }}>Formato</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'rgba(0,0,0,0.04)' }}>Jogos</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'rgba(0,0,0,0.04)' }}>Proporção</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { name: 'Físico', value: stats.format.physical, color: COLORS[0] },
                        { name: 'Digital', value: stats.format.digital, color: COLORS[1] }
                      ].map((format, index) => {
                        const percentage = totalGames ? ((format.value / totalGames) * 100).toFixed(1) : 0;
                        
                        return (
                          <TableRow key={format.name} hover>
                            <TableCell component="th" scope="row">
                              {format.name}
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="medium">
                                {format.value}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box 
                                  sx={{ 
                                    height: 8, 
                                    width: `${Math.min(percentage * 1.8, 100)}%`, 
                                    bgcolor: format.color,
                                    borderRadius: 2
                                  }} 
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {percentage}%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{totalGames}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CleanCard>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/')} 
            sx={{ 
              fontWeight: 600, 
              borderRadius: 2, 
              px: isMobile ? 4 : 3,
              py: isMobile ? 1.5 : 1,
              fontSize: isMobile ? '1.1rem' : '1rem',
              minHeight: isMobile ? 52 : 'auto'
            }}
          >
            Voltar para o Catálogo
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 