export const basicAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  
  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="PS Games Catalog"');
    return res.status(401).json({ 
      error: 'Autenticação necessária',
      message: 'Acesso restrito ao catálogo pessoal' 
    });
  }

  try {
    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString();
    const [username, password] = credentials.split(':');

    // Usar variáveis de ambiente para credenciais
    const validUsername = process.env.AUTH_USERNAME || 'admin';
    const validPassword = process.env.AUTH_PASSWORD || 'admin123';

    if (username === validUsername && password === validPassword) {
      console.log(`[${new Date().toISOString()}] Acesso autorizado para: ${username}`);
      next();
    } else {
      console.log(`[${new Date().toISOString()}] Tentativa de acesso negada para: ${username || 'username vazio'}`);
      res.setHeader('WWW-Authenticate', 'Basic realm="PS Games Catalog"');
      return res.status(401).json({ 
        error: 'Credenciais inválidas',
        message: 'Usuário ou senha incorretos' 
      });
    }
  } catch (error) {
    console.log(`[${new Date().toISOString()}] Erro de autenticação:`, error.message);
    res.setHeader('WWW-Authenticate', 'Basic realm="PS Games Catalog"');
    return res.status(401).json({ 
      error: 'Formato de autenticação inválido',
      message: 'Erro ao processar credenciais' 
    });
  }
}; 