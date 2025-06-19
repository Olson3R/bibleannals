module.exports = {
  apps: [
    {
      name: 'bible-annals-dev',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
      },
      watch: false, // Let Next.js handle file watching
      ignore_watch: [
        'node_modules',
        '.next',
        '.git',
        'out',
        '*.log'
      ],
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      autorestart: true,
      max_memory_restart: '1G',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true
    }
  ]
};