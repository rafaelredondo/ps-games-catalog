module.exports = {
  apps: [
    {
      name: 'ps-games-backend',
      script: './src/server.js',
      cwd: '/home/ec2-user/ps-games-catalog/backend',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // Auto restart
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      
      // Logs
      log_file: '/home/ec2-user/logs/ps-games-combined.log',
      out_file: '/home/ec2-user/logs/ps-games-out.log',
      error_file: '/home/ec2-user/logs/ps-games-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Restart policies
      min_uptime: '10s',
      max_restarts: 10,
      
      // Advanced settings
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000,
      
      // Instance variables
      instance_var: 'INSTANCE_ID'
    }
  ]
}; 