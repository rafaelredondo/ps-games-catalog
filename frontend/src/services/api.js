import axios from 'axios';

const api = axios.create({
  baseURL: 'https://gamescatalog.net/api'
});

export default api; 