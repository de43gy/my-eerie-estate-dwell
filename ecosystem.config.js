module.exports = {
  apps: [{
    name: 'my-eerie-estate-dwell',
    script: 'server.js',
    cwd: '/opt/webapps/my-eerie-estate-dwell',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    error_file: '/var/log/pm2/eerie-estate-error.log',
    out_file: '/var/log/pm2/eerie-estate-out.log',
    log_file: '/var/log/pm2/eerie-estate.log',
    time: true,
    max_memory_restart: '500M',
    restart_delay: 5000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};