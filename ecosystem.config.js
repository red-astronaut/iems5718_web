module.exports = {
    apps: [{
      name: "web_server",
      script: "./server_azure.js",
      watch: false,  // 禁用文件监视
      env: {
        "NODE_ENV": "production",
        "PORT": 5000
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 3
    }]
  }


  