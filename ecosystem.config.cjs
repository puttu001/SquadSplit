module.exports = {
  apps: [
    {
      name: 'squadsplit-backend',
      script: './apps/backend/dist/server.js',
      cwd: '/home/ubuntu/squadsplit',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: './logs/backend-error.log',
      out_file:   './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
