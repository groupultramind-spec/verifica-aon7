module.exports = {
  apps: [
    {
      name: "bot-print-system",
      script: "server.ts",
      interpreter: "tsx", // Usamos tsx para rodar o arquivo .ts diretamente
      env: {
        NODE_ENV: "production",
      },
      // Reinicia se o bot cair
      restart_delay: 3000,
      max_restarts: 10,
      // Log de erros em arquivo separado
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    },
  ],
};
