<div align="center">
<img width="1200" height="475" alt="Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Sistema de Verificação de E-mail

Este projeto é um sistema de verificação de e-mails profissional, com validação de domínios brasileiros e integração com Telegram para notificações.

## Funcionalidades

- Validação rigorosa de domínios (Gmail, Hotmail, etc.) e domínios .br.
- Bloqueio de e-mails temporários/descartáveis.
- Painel de controle via Telegram para alteração dinâmica da fachada do site (OLXPAY, Mercado Livre, Facebook, Enjoei).
- Captura de prints (Mobile/PC) via Puppeteer.
- Integração com Telegram Bot para logs e verificações.

## Como Rodar Localmente

**Pré-requisitos:** Node.js instalado.

1. Instale as dependências:
   `npm install`

2. Configure o arquivo `.env` com suas credenciais do Telegram:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`

3. Inicie o servidor:
   `npm run dev`

4. O sistema estará disponível em `http://localhost:3000`.
