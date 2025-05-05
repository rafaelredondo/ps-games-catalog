import { useState, useContext } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Divider,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Snackbar,
  IconButton,
  Tooltip,
  AlertTitle
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Papa from 'papaparse';
import axios from 'axios';
import { useGames } from '../contexts/GamesContext';

function CsvPage() {
  const [csvData, setCsvData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importStatus, setImportStatus] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [processingResults, setProcessingResults] = useState({
    total: 0,
    success: 0,
    failed: 0,
    inProgress: false,
    completed: false,
    logs: []
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [apiStatus, setApiStatus] = useState({
    tested: false,
    working: false,
    message: '',
    details: ''
  });
  
  const { games, loadGames } = useGames();
  
  // Configuração para a API RAWG
  const API_KEY = 'eb88977d653e45eb951a54fb21c02a4b'; // Chave de API do RAWG
  const API_URL = 'https://api.rawg.io/api';

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Verificar se é realmente um arquivo CSV
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Por favor, selecione um arquivo CSV válido.');
      setCsvData(null);
      return;
    }
    
    setLoading(true);
    setError('');
    setActiveStep(0);
    setProcessingResults({
      total: 0,
      success: 0,
      failed: 0,
      inProgress: false,
      completed: false,
      logs: []
    });
    
    // Usar PapaParse para processar o CSV
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setCsvData(results.data);
          // Extrair os cabeçalhos das colunas
          setHeaders(results.meta.fields || []);
          setActiveStep(1);
        } else {
          setError('O arquivo CSV parece estar vazio ou mal formatado.');
          setCsvData(null);
        }
        setLoading(false);
      },
      error: (error) => {
        setError(`Erro ao processar o arquivo: ${error.message}`);
        setCsvData(null);
        setLoading(false);
      }
    });
    
    // Limpar o valor do input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
  };
  
  // Função para buscar dados de um jogo na API RAWG
  const fetchGameFromRawg = async (gameName) => {
    try {
      console.log(`Buscando jogo na API RAWG com a nova chave: ${gameName}`);
      
      // Log da URL completa para debug
      const searchUrl = `${API_URL}/games?key=${API_KEY}&search=${encodeURIComponent(gameName)}&search_precise=true&search_exact=true&page_size=5`;
      console.log(`URL de busca: ${searchUrl.replace(API_KEY, 'API_KEY_HIDDEN')}`);
      
      // Verificar se a API está funcionando (baseado no teste anterior)
      if (!apiStatus.working && !apiStatus.tested) {
        // Se ainda não testamos a API, vamos tentar fazer o teste automático
        console.log('API ainda não foi testada. Realizando teste automático...');
        await testRawgApi();
        
        // Se mesmo após o teste a API não estiver funcionando, lançar erro
        if (!apiStatus.working) {
          throw new Error('API RAWG não está respondendo. Realize o teste manual da API primeiro.');
        }
      }
      
      // Se chegamos aqui, temos confirmação que a API está funcionando
      try {
        console.log('Tentando busca direta com axios...');
        const axiosResponse = await axios.get(searchUrl, {
          headers: {
            'Accept': 'application/json'
          },
          timeout: 10000 // 10 segundos de timeout
        });
        
        const responseData = axiosResponse.data;
        console.log('Busca com axios bem-sucedida!');
        
        // Log detalhado da resposta, incluindo status e número de resultados
        console.log(`Resposta da API RAWG para '${gameName}':`, {
          count: responseData.count || 0,
          resultados: responseData.count > 0 ? `${responseData.count} jogos encontrados` : 'Nenhum jogo encontrado',
          next: responseData.next ? 'Tem próxima página' : 'Não tem próxima página',
          primeiroResultado: responseData.results && responseData.results.length > 0 ? 
            responseData.results[0].name : 'Nenhum resultado'
        });
        
        // Se não houver resultados, retornar null imediatamente
        if (!responseData.results || responseData.results.length === 0) {
          console.log(`Nenhum resultado encontrado para '${gameName}' na API RAWG`);
          return null;
        }
        
        if (responseData.results && responseData.results.length > 0) {
          // Listar todos os jogos encontrados para debug
          console.log(`Jogos encontrados para '${gameName}':`);
          responseData.results.forEach((game, index) => {
            console.log(`  ${index + 1}. ${game.name} (ID: ${game.id}, Metacritic: ${game.metacritic || 'N/A'})`);
          });
          
          // Tentar encontrar uma correspondência exata pelo nome (case insensitive)
          let game = responseData.results.find(g => 
            g.name.toLowerCase() === gameName.toLowerCase()
          );
          
          // Se não encontrou correspondência exata, pegar o primeiro resultado
          if (!game) {
            game = responseData.results[0];
            console.log(`Correspondência exata não encontrada. Usando o primeiro resultado: ${game.name}`);
          } else {
            console.log(`Correspondência exata encontrada: ${game.name}`);
          }
          
          // Buscar detalhes adicionais
          console.log(`Buscando detalhes para o jogo ID ${game.id}`);
          
          try {
            const detailsUrl = `${API_URL}/games/${game.id}?key=${API_KEY}`;
            console.log('Tentando obter detalhes com axios...');
            
            const detailsResponse = await axios.get(detailsUrl, {
              headers: {
                'Accept': 'application/json'
              },
              timeout: 10000
            });
            
            const detailsData = detailsResponse.data;
            console.log('Detalhes obtidos com sucesso!');
            
            // Log detalhado para debug
            console.log(`Detalhes obtidos para ${game.name}:`, {
              publishers: detailsData.publishers ? detailsData.publishers.map(p => p.name) : [],
              description: detailsData.description_raw ? 'Presente' : 'Ausente',
              platforms: game.platforms ? game.platforms.map(p => p.platform.name) : []
            });
            
            return {
              rawgId: game.id,
              name: game.name,
              released: game.released || null,
              coverUrl: game.background_image || '',
              description: detailsData.description_raw || '',
              metacritic: game.metacritic || null,
              genres: game.genres ? game.genres.map(g => g.name) : [],
              publishers: detailsData.publishers ? detailsData.publishers.map(p => p.name) : [],
              platforms: game.platforms ? game.platforms.map(p => p.platform.name) : []
            };
          } catch (detailsError) {
            console.error(`Erro ao buscar detalhes para o jogo ${game.name}:`, detailsError);
            console.log(`Status do erro: ${detailsError.response?.status || 'Desconhecido'}`);
            console.log(`Mensagem do erro: ${detailsError.message}`);
            
            // Retornar dados básicos mesmo sem detalhes completos
            return {
              rawgId: game.id,
              name: game.name,
              released: game.released || null,
              coverUrl: game.background_image || '',
              description: '',
              metacritic: game.metacritic || null,
              genres: game.genres ? game.genres.map(g => g.name) : [],
              publishers: [],
              platforms: game.platforms ? game.platforms.map(p => p.platform.name) : []
            };
          }
        }
        
        // Se não encontrou o jogo, tentar criar um objeto com os dados mínimos
        console.log(`Nenhum jogo encontrado para "${gameName}", usando dados mínimos do CSV`);
        return null;
      } catch (axiosError) {
        console.error('Erro na requisição axios:', axiosError);
        
        // Se for erro de CORS, mostrar mensagem clara
        if (axiosError.message && axiosError.message.includes('Network Error')) {
          console.error('Erro de CORS detectado na busca do jogo');
          throw new Error('Bloqueio CORS impedindo acesso à API RAWG. Instale a extensão CORS Unblock ou use o proxy.');
        }
        
        throw axiosError;
      }
    } catch (error) {
      console.error('Erro ao buscar dados do jogo na API RAWG:', error);
      
      // Verificar tipo de erro para mensagens mais específicas
      if (error.response) {
        // Resposta da API com erro
        console.error(`Erro da API (${error.response.status}):`, error.response.data);
      } else if (error.request) {
        // Sem resposta da API
        console.error('Sem resposta da API RAWG. Verifique sua conexão ou se a API está online.');
      } else {
        // Erro de configuração da requisição
        console.error(`Erro: ${error.message}`);
      }
      
      return null;
    }
  };
  
  // Função para mapear campos do CSV para o formato do jogo
  const mapCsvToGameData = (csvRow, rawgData) => {
    // Primeiro, construa o objeto base com os dados do RAWG
    const gameData = {
      name: rawgData.name,
      completed: false,
      mediaTypes: [],
      platforms: rawgData.platforms || [],
      genres: rawgData.genres || [],
      publishers: rawgData.publishers || [],
      description: rawgData.description || '',
      released: rawgData.released || null,
      metacritic: rawgData.metacritic || null,
      coverUrl: rawgData.coverUrl || ''
    };
    
    // Agora, vamos substituir alguns campos com os dados do CSV, se existirem
    if (headers.includes('name') && csvRow.name) {
      gameData.name = csvRow.name;
    }
    
    if (headers.includes('completed')) {
      gameData.completed = csvRow.completed === 'true' || csvRow.completed === 'sim' || csvRow.completed === '1';
    }
    
    if (headers.includes('platforms') && csvRow.platforms) {
      // Normalizar plataformas PlayStation
      let platforms = csvRow.platforms.split(',').map(p => {
        const platform = p.trim();
        
        // Normalização específica para PlayStation
        if (platform === 'PS4') return 'PlayStation 4';
        if (platform === 'PS5') return 'PlayStation 5';
        if (platform === 'PS4/PS5' || platform === 'PS5/PS4') {
          // Este caso será tratado separadamente para retornar um array com ambas plataformas
          return null; // Marcamos como null para filtrar depois
        }
        
        return platform;
      }).filter(Boolean); // Remove valores null
      
      // Verifica se temos PS4/PS5 no texto original e adiciona ambas plataformas
      if (csvRow.platforms.includes('PS4/PS5') || csvRow.platforms.includes('PS5/PS4')) {
        if (!platforms.includes('PlayStation 4')) {
          platforms.push('PlayStation 4');
        }
        if (!platforms.includes('PlayStation 5')) {
          platforms.push('PlayStation 5');
        }
      }
      
      gameData.platforms = platforms;
    }
    
    if (headers.includes('mediaTypes') && csvRow.mediaTypes) {
      gameData.mediaTypes = csvRow.mediaTypes.split(',').map(mt => mt.trim());
    }
    
    if (headers.includes('metacritic') && csvRow.metacritic) {
      gameData.metacritic = parseInt(csvRow.metacritic);
    }
    
    if (headers.includes('released') && csvRow.released) {
      gameData.released = csvRow.released;
    }
    
    // Adicionar tratamento para campos adicionais do CSV que podem substituir dados do RAWG
    if (headers.includes('genres') && csvRow.genres) {
      gameData.genres = csvRow.genres.split(',').map(g => g.trim());
    }
    
    if (headers.includes('publishers') && csvRow.publishers) {
      gameData.publishers = csvRow.publishers.split(',').map(p => p.trim());
    }
    
    if (headers.includes('description') && csvRow.description) {
      gameData.description = csvRow.description;
    }
    
    if (headers.includes('coverUrl') && csvRow.coverUrl) {
      gameData.coverUrl = csvRow.coverUrl;
    }
    
    // Log detalhado dos dados mesclados para debug
    console.log(`Dados mesclados para ${gameData.name}:`, {
      rawgId: rawgData.rawgId,
      platforms: gameData.platforms,
      metacritic: gameData.metacritic,
      coverUrl: gameData.coverUrl ? 'Presente' : 'Ausente',
      fromCSV: {
        name: headers.includes('name') && csvRow.name ? true : false,
        platforms: headers.includes('platforms') && csvRow.platforms ? true : false,
        metacritic: headers.includes('metacritic') && csvRow.metacritic ? true : false,
        genres: headers.includes('genres') && csvRow.genres ? true : false,
        publishers: headers.includes('publishers') && csvRow.publishers ? true : false
      }
    });
    
    return gameData;
  };
  
  // Função para processar o CSV e importar todos os jogos
  const processImport = async () => {
    if (!csvData || csvData.length === 0) {
      setError('Não há dados CSV para importar.');
      return;
    }
    
    // Se a API não foi testada, faça o teste agora
    if (!apiStatus.tested) {
      await testRawgApi();
    }
    
    // Se o teste da API falhou, pare a importação
    if (apiStatus.tested && !apiStatus.working) {
      setError('A importação não pode ser iniciada porque a API RAWG não está respondendo corretamente. Por favor, verifique sua conexão e tente novamente.');
      return;
    }
    
    // Verificar conexão com a API RAWG antes de começar
    try {
      console.log('Testando conexão com a API RAWG...');
      
      // Primeiro teste: verificar se a API está respondendo
      const testResponse = await axios.get(`${API_URL}/games`, {
        params: {
          key: API_KEY,
          page_size: 1
        }
      });
      
      console.log('Teste geral da API RAWG:', {
        status: testResponse.status,
        count: testResponse.data.count,
        resultados: testResponse.data.results?.length || 0
      });
      
      if (testResponse.status !== 200) {
        setError(`Erro ao conectar com a API RAWG. Status: ${testResponse.status}`);
        return;
      }
      
      // Segundo teste: verificar se a busca por um jogo específico funciona
      const popularGame = "The Last of Us";
      console.log(`Testando busca por jogo popular: "${popularGame}"`);
      
      const searchResponse = await axios.get(`${API_URL}/games`, {
        params: {
          key: API_KEY,
          search: popularGame,
          page_size: 5
        }
      });
      
      console.log(`Resultados para "${popularGame}":`, {
        status: searchResponse.status,
        count: searchResponse.data.count || 0,
        resultados: searchResponse.data.results?.length || 0,
        nomes: searchResponse.data.results?.map(game => game.name) || []
      });
      
      if (searchResponse.data.count === 0 || !searchResponse.data.results || searchResponse.data.results.length === 0) {
        console.warn(`Aviso: Busca por "${popularGame}" não retornou resultados. Pode haver um problema com a API.`);
        setError(`Aviso: A API está respondendo, mas a busca por um jogo popular não retornou resultados. Pode haver problemas com a funcionalidade de busca.`);
        return;
      }
    } catch (error) {
      console.error('Erro ao testar conexão com a API RAWG:', error);
      setError('Não foi possível conectar com a API RAWG. Verifique sua conexão com a internet.');
      return;
    }
    
    setActiveStep(2);
    setProcessingResults({
      ...processingResults,
      total: csvData.length,
      inProgress: true,
      logs: []
    });
    
    let successCount = 0;
    let failedCount = 0;
    const logs = [];
    
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      
      // Verificar se temos um nome de jogo para pesquisar
      const gameName = row.name || '';
      if (!gameName) {
        logs.push({
          name: `Registro #${i+1}`,
          status: 'error',
          message: 'Nome do jogo não encontrado no registro CSV'
        });
        failedCount++;
        continue;
      }
      
      // Log para indicar o processamento atual
      console.log(`\n===== Processando jogo ${i+1}/${csvData.length}: ${gameName} =====`);
      
      // Atualizar status
      setProcessingResults(prev => ({
        ...prev,
        success: successCount,
        failed: failedCount,
        logs: [...logs]
      }));
      
      try {
        // Buscar dados do jogo na API RAWG
        console.log(`Iniciando busca RAWG para: ${gameName}`);
        const rawgData = await fetchGameFromRawg(gameName);
        console.log(`Resultado da busca RAWG para ${gameName}: ${rawgData ? 'Encontrado' : 'Não encontrado'}`);
        
        let gameData;
        if (!rawgData) {
          // Se não encontrou na API RAWG, pular este jogo
          console.log(`Jogo não encontrado na API RAWG: ${gameName}. Ignorando importação.`);
          
          logs.push({
            name: gameName,
            status: 'error',
            message: 'Jogo não encontrado na API RAWG. Importação ignorada.'
          });
          
          // Incrementar contador de falhas
          failedCount++;
          
          // Pular para o próximo jogo
          continue;
        } else {
          // Se encontrou na API RAWG, mapear dados do CSV + RAWG
          gameData = mapCsvToGameData(row, rawgData);
          
          // Log para debug
          console.log(`${gameName}: Combinando dados do RAWG com CSV`, {
            rawgName: rawgData.name,
            csvName: row.name,
            final: gameData.name
          });
        }
        
        // Salvar jogo no banco de dados
        try {
          const response = await axios.post('http://localhost:3000/api/games', gameData);
          
          if (response.status === 201) {
            logs.push({
              name: gameData.name,
              status: 'success',
              message: 'Jogo importado com sucesso'
            });
            successCount++;
          } else {
            logs.push({
              name: gameData.name,
              status: 'error',
              message: 'Erro ao salvar o jogo'
            });
            failedCount++;
          }
        } catch (saveError) {
          console.error(`Erro ao salvar o jogo ${gameData.name}:`, saveError);
          logs.push({
            name: gameData.name,
            status: 'error',
            message: `Erro ao salvar: ${saveError.message || 'Erro desconhecido'}`
          });
          failedCount++;
        }
      } catch (error) {
        console.error(`Erro ao processar o jogo ${gameName}:`, error);
        logs.push({
          name: gameName,
          status: 'error',
          message: `Erro: ${error.message || 'Desconhecido'}`
        });
        failedCount++;
      }
      
      // Atualizar status após cada processo
      setProcessingResults({
        total: csvData.length,
        success: successCount,
        failed: failedCount,
        inProgress: true,
        logs: [...logs]
      });
    }
    
    // Finalizar o processo
    setProcessingResults({
      total: csvData.length,
      success: successCount,
      failed: failedCount,
      inProgress: false,
      completed: true,
      logs: [...logs]
    });
    
    // Recarregar lista de jogos
    await loadGames();
    
    setActiveStep(3);
    setSnackbarMessage(`Importação concluída: ${successCount} de ${csvData.length} jogos importados com sucesso`);
    setSnackbarOpen(true);
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  const steps = [
    'Selecionar arquivo CSV',
    'Revisar dados',
    'Importar jogos',
    'Concluído'
  ];

  // Função para testar a conexão com a API RAWG
  const testRawgApi = async () => {
    setApiStatus({
      tested: true,
      working: false,
      message: 'Testando conexão com a API RAWG...',
      details: ''
    });
    
    setError(''); // Limpar mensagens de erro anteriores
    
    try {
      console.log('Testando conexão com a API RAWG com a nova chave...');
      
      // Tentar com modo 'no-cors' para RAWG
      try {
        console.log('Tentando acessar o site do RAWG com no-cors...');
        const response = await fetch('https://rawg.io/', { 
          mode: 'no-cors',
          credentials: 'omit'
        });
        // Se chegamos aqui, não houve exceção mas isso não significa sucesso
        console.log('Resposta no-cors recebida (apenas para verificar conectividade)');
      } catch (e) {
        console.log('Não foi possível acessar o site do RAWG, mesmo com no-cors:', e.message);
      }
      
      // Tentar com axios para a API real - mudando para um endpoint específico
      try {
        console.log('Tentando com axios para um jogo popular...');
        
        // Testando com o jogo "The Last of Us", que é bem conhecido
        const url = `${API_URL}/games?key=${API_KEY}&search=the+last+of+us&page_size=1`;
        console.log('URL da requisição:', url.replace(API_KEY, 'API_KEY_HIDDEN'));
        
        const response = await axios.get(url, {
          timeout: 10000, // 10 segundos
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.status === 200 && response.data && response.data.results) {
          console.log('Conexão com RAWG API bem-sucedida!', {
            count: response.data.count,
            resultados: response.data.results.length
          });
          
          setApiStatus({
            tested: true,
            working: true,
            message: 'API RAWG está funcionando!',
            details: `Encontrados ${response.data.count} resultados para "The Last of Us"`
          });
          
          // Mostrar mensagem de sucesso
          setSnackbarMessage('A nova chave API foi testada com sucesso! Você pode importar jogos agora.');
          setSnackbarOpen(true);
          
          return;
        } else {
          console.warn('Resposta da API sem resultados esperados');
          throw new Error('Resposta da API não contém os dados esperados');
        }
      } catch (axiosError) {
        console.error('Erro na requisição axios:', axiosError);
        
        // Se for erro de CORS, informar claramente
        if (axiosError.message && axiosError.message.includes('Network Error')) {
          console.error('Provável erro de CORS detectado');
          
          setApiStatus({
            tested: true,
            working: false,
            message: 'Erro de CORS ao acessar a API RAWG',
            details: 'Seu navegador está bloqueando requisições para a API RAWG por restrições de segurança cross-origin.'
          });
          
          setError(`Mesmo com a nova chave API, detectamos um problema de CORS ao tentar acessar a API RAWG.
          
Para resolver este problema, tente uma das seguintes opções:
1. Instale uma extensão no navegador que desabilite o CORS (como "CORS Unblock")
2. Configure um proxy CORS no seu backend Node.js
3. Importe os jogos manualmente usando o botão "Adicionar Jogo"`);
          return;
        }
      }
      
      // Se chegamos aqui, todas as tentativas falharam
      setApiStatus({
        tested: true,
        working: false,
        message: 'Não foi possível conectar com a API RAWG',
        details: 'Todas as tentativas de conexão falharam, possivelmente devido a restrições de CORS ou problemas de rede.'
      });
      
      // Notificar o usuário sobre o problema
      setSnackbarMessage('Não foi possível conectar à API RAWG. Verifique as sugestões para resolver o problema.');
      setSnackbarOpen(true);
      
    } catch (error) {
      console.error('Erro ao testar conexão com a API RAWG:', error);
      
      setApiStatus({
        tested: true,
        working: false,
        message: 'Falha na conexão com a API RAWG',
        details: `Erro: ${error.message}. As restrições de CORS provavelmente estão impedindo o acesso à API.`
      });
      
      // Notificar o usuário sobre o problema
      setSnackbarMessage('Ocorreu um erro ao testar a conexão: ' + error.message);
      setSnackbarOpen(true);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, bgcolor: '#222', color: 'white', borderRadius: 2 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Importação CSV
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.7)" sx={{ mb: 3 }}>
            Importe vários jogos de uma só vez usando um arquivo CSV.
          </Typography>
          
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {activeStep === 0 && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Selecione um arquivo CSV contendo informações dos jogos.
                <Tooltip title="O CSV deve conter pelo menos uma coluna 'name' com o nome do jogo. Colunas opcionais: 'platforms' (PS4 será convertido para PlayStation 4, PS5 para PlayStation 5, PS4/PS5 para ambos), 'completed', 'mediaTypes', 'metacritic', 'released'">
                  <IconButton size="small" sx={{ ml: 1, color: 'rgba(255,255,255,0.5)' }}>
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                <Alert severity="success" sx={{ mb: 2, width: '100%', maxWidth: 500 }}>
                  <AlertTitle>Nova chave de API configurada!</AlertTitle>
                  Estamos utilizando uma nova chave API: <strong>eb88977d653e45eb951a54fb21c02a4b</strong>. 
                  Clique no botão abaixo para testar a conexão com a API RAWG.
                </Alert>
              
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  sx={{ 
                    bgcolor: '#0096FF',
                    '&:hover': { bgcolor: '#0077cc' },
                    mb: 1
                  }}
                >
                  Selecionar Arquivo CSV
                  <input
                    type="file"
                    accept=".csv"
                    hidden
                    onChange={handleFileUpload}
                  />
                </Button>
                
                <Button
                  variant="contained"
                  onClick={testRawgApi}
                  startIcon={apiStatus.tested ? (apiStatus.working ? <CheckCircleIcon /> : <ErrorIcon />) : <InfoIcon />}
                  sx={{ 
                    mb: 1, 
                    bgcolor: apiStatus.tested ? (apiStatus.working ? 'success.main' : 'error.main') : 'warning.main',
                    '&:hover': { 
                      bgcolor: apiStatus.tested ? (apiStatus.working ? 'success.dark' : 'error.dark') : 'warning.dark' 
                    },
                    fontWeight: 'bold'
                  }}
                >
                  {apiStatus.tested 
                    ? (apiStatus.working ? 'API RAWG Conectada!' : 'Testar Novamente') 
                    : 'Testar Nova Chave API RAWG'}
                </Button>
                
                {apiStatus.tested && (
                  <Alert 
                    severity={apiStatus.working ? "success" : "error"}
                    sx={{ mb: 3, width: '100%', maxWidth: 500 }}
                  >
                    <AlertTitle>{apiStatus.message}</AlertTitle>
                    {apiStatus.details}
                  </Alert>
                )}
                
                <Alert severity="warning" sx={{ mb: 3, width: '100%', maxWidth: 600, textAlign: 'left' }}>
                  <AlertTitle>Se ocorrer problema de CORS</AlertTitle>
                  <Typography variant="body2">
                    Estamos usando uma nova chave API, mas se ainda houver bloqueio de CORS (Cross-Origin Resource Sharing) ao tentar acessar a API RAWG,
                    você pode usar uma das seguintes soluções:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
                    Soluções possíveis:
                  </Typography>
                  <ol>
                    <li>
                      <strong>Instale uma extensão para desabilitar CORS:</strong><br/>
                      Para Chrome: <a href="https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino" target="_blank" style={{ color: '#0096FF' }}>CORS Unblock</a><br/>
                      Para Firefox: <a href="https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/" target="_blank" style={{ color: '#0096FF' }}>CORS Everywhere</a>
                    </li>
                    <li>
                      <strong>Configure um proxy CORS no backend:</strong><br/>
                      Adicione um endpoint no seu servidor Node.js que faça as requisições para a API RAWG e as repasse para o frontend.
                    </li>
                    <li>
                      <strong>Adicione jogos manualmente:</strong><br/>
                      Use o botão "Adicionar Jogo" na barra de navegação para adicionar jogos um a um.
                    </li>
                  </ol>
                </Alert>
              </Box>
            </Box>
          )}
        </Box>
        
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(211, 47, 47, 0.1)' }}>
            {error}
          </Alert>
        )}
        
        {csvData && headers.length > 0 && activeStep === 1 && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2">
                Dados do Arquivo ({csvData.length} registros)
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={processImport}
                disabled={!apiStatus.working}
                sx={{ 
                  bgcolor: '#0096FF',
                  '&:hover': { bgcolor: '#0077cc' }
                }}
              >
                Importar Jogos Encontrados na API
              </Button>
              {!apiStatus.tested && (
                <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                  Clique em "Testar Conexão com API RAWG" antes de importar
                </Typography>
              )}
              {apiStatus.tested && !apiStatus.working && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                  Não é possível importar porque a API RAWG não está respondendo
                </Typography>
              )}
            </Box>
            
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
              Revise os dados abaixo antes de iniciar a importação. Cada linha será processada e complementada com dados da API RAWG.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(3, 169, 244, 0.1)' }}>
              <Typography variant="body2">
                <strong>Nota sobre plataformas:</strong> Durante a importação, os valores de plataforma serão normalizados:
                <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                  <li>PS4 → PlayStation 4</li>
                  <li>PS5 → PlayStation 5</li>
                  <li>PS4/PS5 → Ambas plataformas (PlayStation 4 e PlayStation 5)</li>
                </ul>
              </Typography>
            </Alert>
            
            <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(3, 169, 244, 0.1)' }}>
              <Typography variant="body2">
                <strong>Sobre a importação:</strong> O sistema só importará jogos que forem encontrados na API RAWG.
                <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                  <li>Se a API RAWG não encontrar o jogo, ele <strong>não</strong> será importado</li>
                  <li>Para melhores resultados, pelo menos a coluna <code>name</code> deve estar presente no CSV</li>
                  <li>Os nomes dos jogos devem corresponder aos nomes oficiais para melhor chance de serem encontrados</li>
                  <li><strong>Importante:</strong> Devido ao bloqueio de CORS, você precisará usar uma extensão de navegador para desabilitar CORS ou configurar um proxy no backend</li>
                </ul>
              </Typography>
            </Alert>
            
            <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(3, 169, 244, 0.1)' }}>
              <Typography variant="body2">
                <strong>Busca na API RAWG:</strong> A API do RAWG será consultada com os parâmetros <code>search_precise</code> e <code>search_exact</code> para obter resultados mais precisos.
                <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                  <li>O sistema tentará encontrar uma correspondência exata pelo nome do jogo</li>
                  <li>Caso não encontre uma correspondência exata, usará o primeiro resultado da lista</li>
                  <li>Os dados do CSV complementarão os dados da API para os jogos encontrados</li>
                  <li><strong>Importante:</strong> Jogos não encontrados na API serão ignorados na importação</li>
                  <li><strong>Nota sobre CORS:</strong> Você precisa resolver o problema de CORS antes de usar esta funcionalidade. Veja as instruções na tela inicial sobre como instalar uma extensão como CORS Unblock.</li>
                </ul>
              </Typography>
            </Alert>
            
            <TableContainer sx={{ maxHeight: 440, bgcolor: '#333', borderRadius: 1, mb: 2 }}>
              <Table stickyHeader aria-label="tabela de dados csv">
                <TableHead>
                  <TableRow>
                    {headers.map((header, index) => (
                      <TableCell 
                        key={index}
                        sx={{ 
                          bgcolor: '#444', 
                          color: 'white',
                          fontWeight: 'bold',
                          borderBottom: '2px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {csvData.slice(0, 100).map((row, rowIndex) => (
                    <TableRow key={rowIndex} sx={{ '&:nth-of-type(odd)': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                      {headers.map((header, cellIndex) => (
                        <TableCell 
                          key={cellIndex}
                          sx={{ 
                            color: 'rgba(255,255,255,0.8)',
                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                          }}
                        >
                          {row[header]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {csvData.length > 100 && (
              <Typography variant="body2" color="rgba(255,255,255,0.6)" sx={{ mt: 1, textAlign: 'center' }}>
                * Mostrando apenas os primeiros 100 registros para melhor desempenho
              </Typography>
            )}
          </Box>
        )}
        
        {activeStep === 2 && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
            <Typography variant="h5" component="h2" gutterBottom>
              Importando jogos...
            </Typography>
            
            <Box sx={{ width: '100%', mb: 3 }}>
              <LinearProgress 
                variant="determinate" 
                value={(processingResults.success + processingResults.failed) / processingResults.total * 100} 
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                  Processados: {processingResults.success + processingResults.failed} de {processingResults.total}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                  {Math.round((processingResults.success + processingResults.failed) / processingResults.total * 100)}%
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography>Sucesso: {processingResults.success}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ErrorIcon sx={{ color: 'error.main', mr: 1 }} />
                <Typography>Falhas: {processingResults.failed}</Typography>
              </Box>
            </Box>
            
            <TableContainer sx={{ maxHeight: 300, bgcolor: '#333', borderRadius: 1 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: '#444', color: 'white', fontWeight: 'bold' }}>Jogo</TableCell>
                    <TableCell sx={{ bgcolor: '#444', color: 'white', fontWeight: 'bold' }} align="center">Status</TableCell>
                    <TableCell sx={{ bgcolor: '#444', color: 'white', fontWeight: 'bold' }}>Mensagem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {processingResults.logs.map((log, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        bgcolor: log.status === 'error' ? 'rgba(211, 47, 47, 0.1)' : 
                                 log.status === 'warning' ? 'rgba(255, 152, 0, 0.1)' : 
                                 'rgba(46, 125, 50, 0.1)',
                        '& td': { 
                          color: 'rgba(255,255,255,0.8)',
                          borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }
                      }}
                    >
                      <TableCell>{log.name}</TableCell>
                      <TableCell align="center">
                        {log.status === 'success' ? 
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.1rem' }} /> : 
                          log.status === 'warning' ?
                          <InfoIcon sx={{ color: 'warning.main', fontSize: '1.1rem' }} /> :
                          <ErrorIcon sx={{ color: 'error.main', fontSize: '1.1rem' }} />
                        }
                      </TableCell>
                      <TableCell>
                        {log.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        
        {activeStep === 3 && processingResults.completed && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Importação Concluída
              </Typography>
              
              <Typography variant="body1" color="rgba(255,255,255,0.9)" sx={{ mb: 1 }}>
                Foram processados {processingResults.total} registros.
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ color: 'success.main', mr: 1, fontSize: '1.5rem' }} />
                  <Typography>Sucesso: {processingResults.success}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ErrorIcon sx={{ color: 'error.main', mr: 1, fontSize: '1.5rem' }} />
                  <Typography>Falhas: {processingResults.failed}</Typography>
                </Box>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.location.href = '/'}
                sx={{ 
                  bgcolor: '#0096FF',
                  '&:hover': { bgcolor: '#0077cc' },
                  mt: 3
                }}
              >
                Ir para o Catálogo
              </Button>
            </Box>
            
            <Divider sx={{ mb: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
            
            <Typography variant="h6" component="h3" gutterBottom>
              Log de Importação
            </Typography>
            
            <TableContainer sx={{ maxHeight: 300, bgcolor: '#333', borderRadius: 1 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: '#444', color: 'white', fontWeight: 'bold' }}>Jogo</TableCell>
                    <TableCell sx={{ bgcolor: '#444', color: 'white', fontWeight: 'bold' }} align="center">Status</TableCell>
                    <TableCell sx={{ bgcolor: '#444', color: 'white', fontWeight: 'bold' }}>Mensagem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {processingResults.logs.map((log, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        bgcolor: log.status === 'error' ? 'rgba(211, 47, 47, 0.1)' : 
                                 log.status === 'warning' ? 'rgba(255, 152, 0, 0.1)' : 
                                 'rgba(46, 125, 50, 0.1)',
                        '& td': { 
                          color: 'rgba(255,255,255,0.8)',
                          borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }
                      }}
                    >
                      <TableCell>{log.name}</TableCell>
                      <TableCell align="center">
                        {log.status === 'success' ? 
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.1rem' }} /> : 
                          log.status === 'warning' ?
                          <InfoIcon sx={{ color: 'warning.main', fontSize: '1.1rem' }} /> :
                          <ErrorIcon sx={{ color: 'error.main', fontSize: '1.1rem' }} />
                        }
                      </TableCell>
                      <TableCell>
                        {log.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
}

export default CsvPage; 