import type { Category, OfficialAccount } from "../hooks/database.types";

export interface TrendData {
  title: string;
  description: string;
  category: string;
  lang: string;
  source: string;
  image: string | null;
}

interface Personality {
  tone: string;
  emoji: string[];
  formats: {
    es: ((t: TrendData) => string)[];
    en: ((t: TrendData) => string)[];
  };
}

const PERSONALITIES: Record<OfficialAccount, Personality> = {
  "@news": {
    tone: "professional",
    emoji: ["📰", "🔴", "⚡", "🌐", "📡"],
    formats: {
      es: [
        (t) => `🔴 ÚLTIMA HORA\n\n${t.title}\n\n${t.description}\n\nVía ${t.source}\n\n¿Qué opinan? Comenten abajo 👇`,
        (t) => `📰 ${t.title}\n\n${t.description}\n\nEsto es relevante porque marca un cambio importante en cómo entendemos el panorama actual. Los próximos días serán clave.\n\n🔗 Fuente: ${t.source}`,
        (t) => `⚡ BREAKING\n\n${t.title}\n\n${t.description}\n\nSeguiremos actualizando conforme se desarrolle la historia. Activen notificaciones 🔔`,
        (t) => `🌐 Lo que necesitas saber hoy:\n\n▸ ${t.title}\n▸ ${t.description}\n\nEl contexto importa. No te quedes solo con el titular.\n\n📡 ${t.source}`,
      ],
      en: [
        (t) => `🔴 BREAKING NEWS\n\n${t.title}\n\n${t.description}\n\nVia ${t.source}\n\nWhat do you think? Drop your thoughts below 👇`,
        (t) => `📰 ${t.title}\n\n${t.description}\n\nThis matters because it signals a significant shift in the current landscape. The next few days will be crucial.\n\n🔗 Source: ${t.source}`,
        (t) => `⚡ JUST IN\n\n${t.title}\n\n${t.description}\n\nWe'll keep updating as this story develops. Turn on notifications 🔔`,
        (t) => `🌐 What you need to know today:\n\n▸ ${t.title}\n▸ ${t.description}\n\nContext matters. Don't just read the headline.\n\n📡 ${t.source}`,
      ],
    },
  },

  "@crypto": {
    tone: "analytical",
    emoji: ["₿", "📊", "🚀", "💎", "🔥"],
    formats: {
      es: [
        (t) => `₿ CRYPTO UPDATE\n\n${t.title}\n\n${t.description}\n\nAnálisis rápido: este movimiento puede impactar directamente en los portafolios de largo plazo. Los que están acumulando saben.\n\n💎 DYOR — ${t.source}`,
        (t) => `🔥 ${t.title}\n\n${t.description}\n\nPuntos clave:\n• El volumen confirma la tendencia\n• Los institucionales están observando\n• Nivel de soporte clave a monitorear\n\nNo es consejo financiero. Hagan su propia investigación.\n\n📊 ${t.source}`,
        (t) => `🚀 TRENDING EN CRYPTO\n\n${t.title}\n\n${t.description}\n\nEl mercado crypto no duerme. ¿Están preparados para lo que viene?\n\n#crypto #blockchain #DeFi`,
        (t) => `📊 MARKET INSIGHT\n\n${t.title}\n\n${t.description}\n\nLo que vemos:\n→ Presión compradora aumentando\n→ Métricas on-chain positivas\n→ Sentimiento del mercado: cautamente optimista\n\nSiempre DYOR 🧠`,
      ],
      en: [
        (t) => `₿ CRYPTO UPDATE\n\n${t.title}\n\n${t.description}\n\nQuick analysis: this move could directly impact long-term portfolios. Those accumulating know the game.\n\n💎 DYOR — ${t.source}`,
        (t) => `🔥 ${t.title}\n\n${t.description}\n\nKey takeaways:\n• Volume confirms the trend\n• Institutions are watching closely\n• Key support level to monitor\n\nNot financial advice. Always DYOR.\n\n📊 ${t.source}`,
        (t) => `🚀 TRENDING IN CRYPTO\n\n${t.title}\n\n${t.description}\n\nThe crypto market never sleeps. Are you ready for what's next?\n\n#crypto #blockchain #DeFi`,
        (t) => `📊 MARKET INSIGHT\n\n${t.title}\n\n${t.description}\n\nWhat we see:\n→ Buying pressure increasing\n→ On-chain metrics looking positive\n→ Market sentiment: cautiously optimistic\n\nAlways DYOR 🧠`,
      ],
    },
  },

  "@trading": {
    tone: "direct",
    emoji: ["📈", "📉", "💰", "⚠️", "🎯"],
    formats: {
      es: [
        (t) => `📈 SEÑAL DE TRADING\n\n${t.title}\n\n${t.description}\n\nNiveles a observar:\n🟢 Soporte clave\n🔴 Resistencia próxima\n🎯 Objetivo de precio\n\n⚠️ Gestionen su riesgo. Esto no es consejo financiero.`,
        (t) => `📉 ALERTA DE MERCADO\n\n${t.title}\n\n${t.description}\n\nEl mercado habla, nosotros escuchamos. La paciencia es la mejor estrategia en momentos de incertidumbre.\n\n💰 #trading #markets`,
        (t) => `🎯 ANÁLISIS TÉCNICO\n\n${t.title}\n\n${t.description}\n\nPatrones observados:\n▸ Divergencia en RSI\n▸ Volumen decreciente\n▸ Posible cambio de tendencia\n\nOperen con precaución. Stop loss siempre. 📊`,
      ],
      en: [
        (t) => `📈 TRADING SIGNAL\n\n${t.title}\n\n${t.description}\n\nLevels to watch:\n🟢 Key support\n🔴 Next resistance\n🎯 Price target\n\n⚠️ Manage your risk. This is not financial advice.`,
        (t) => `📉 MARKET ALERT\n\n${t.title}\n\n${t.description}\n\nThe market speaks, we listen. Patience is the best strategy during uncertain times.\n\n💰 #trading #markets`,
        (t) => `🎯 TECHNICAL ANALYSIS\n\n${t.title}\n\n${t.description}\n\nPatterns observed:\n▸ RSI divergence\n▸ Decreasing volume\n▸ Possible trend reversal\n\nTrade with caution. Always use stop loss. 📊`,
      ],
    },
  },

  "@memes": {
    tone: "casual",
    emoji: ["😂", "🐸", "💀", "🤣", "🔥"],
    formats: {
      es: [
        (t) => `🐸 No puedo ser el único que vio esto...\n\n"${t.title}"\n\nY yo acá viendo cómo el mercado hace lo que le da la gana 💀\n\nSi esto no es la definición de 2026, no sé qué es 😂`,
        (t) => `💀 JAJAJA esto es demasiado real:\n\n${t.title}\n\n${t.description}\n\nCuando piensas que ya viste todo... la vida te sorprende. RT si te identificas 🤣`,
        (t) => `🔥 POV: Estás leyendo "${t.title}" mientras tu portafolio hace -15%\n\nPero bueno, al menos tenemos memes 🐸\n\n#memecoin #crypto #humor`,
      ],
      en: [
        (t) => `🐸 Can't be the only one who saw this...\n\n"${t.title}"\n\nAnd here I am watching the market do whatever it wants 💀\n\nIf this isn't the definition of 2026, I don't know what is 😂`,
        (t) => `💀 LMAOOO this is too real:\n\n${t.title}\n\n${t.description}\n\nJust when you thought you'd seen it all... life hits different. RT if you relate 🤣`,
        (t) => `🔥 POV: You're reading "${t.title}" while your portfolio does -15%\n\nBut hey, at least we have memes 🐸\n\n#memecoin #crypto #humor`,
      ],
    },
  },

  "@builders": {
    tone: "technical",
    emoji: ["🛠️", "⚙️", "💻", "🧱", "🔧"],
    formats: {
      es: [
        (t) => `🛠️ PARA BUILDERS\n\n${t.title}\n\n${t.description}\n\nLo que esto significa para el ecosistema:\n→ Nuevas herramientas disponibles\n→ Oportunidades de integración\n→ El stack sigue evolucionando\n\nSigan construyendo 🧱`,
        (t) => `💻 DEV UPDATE\n\n${t.title}\n\n${t.description}\n\nPerspectiva técnica: esto abre puertas para aplicaciones más robustas y escalables. Los developers que se adapten primero tendrán ventaja.\n\n⚙️ #web3 #builders`,
        (t) => `🔧 BUILD IN PUBLIC\n\n${t.title}\n\n${t.description}\n\nRecordatorio: las mejores apps se construyen cuando nadie está mirando. Consistencia > hype.\n\n🧱 ¿En qué están trabajando hoy?`,
      ],
      en: [
        (t) => `🛠️ FOR BUILDERS\n\n${t.title}\n\n${t.description}\n\nWhat this means for the ecosystem:\n→ New tools available\n→ Integration opportunities\n→ The stack keeps evolving\n\nKeep building 🧱`,
        (t) => `💻 DEV UPDATE\n\n${t.title}\n\n${t.description}\n\nTechnical perspective: this opens doors for more robust and scalable applications. Devs who adapt first will have the edge.\n\n⚙️ #web3 #builders`,
        (t) => `🔧 BUILD IN PUBLIC\n\n${t.title}\n\n${t.description}\n\nReminder: the best apps are built when nobody is watching. Consistency > hype.\n\n🧱 What are you working on today?`,
      ],
    },
  },

  "@sports": {
    tone: "energetic",
    emoji: ["⚽", "🏀", "🏆", "🥇", "💪"],
    formats: {
      es: [
        (t) => `⚽ DEPORTES\n\n${t.title}\n\n${t.description}\n\nEl deporte nos une. ¿Qué opinan de esta noticia? Comenten con su equipo 🏆\n\n📡 ${t.source}`,
        (t) => `🏆 ÚLTIMO MOMENTO DEPORTIVO\n\n${t.title}\n\n${t.description}\n\nMomentos que definen una temporada. Esto es por lo que amamos el deporte.\n\n💪 #sports #deportes`,
        (t) => `🥇 ${t.title}\n\n${t.description}\n\nLa pasión no se negocia. Este tipo de historias nos recuerdan por qué seguimos cada juego, cada partido, cada carrera.\n\n⚽ ¿Cuál es su momento deportivo favorito del año?`,
      ],
      en: [
        (t) => `⚽ SPORTS UPDATE\n\n${t.title}\n\n${t.description}\n\nSports bring us together. What do you think? Comment with your team 🏆\n\n📡 ${t.source}`,
        (t) => `🏆 BREAKING IN SPORTS\n\n${t.title}\n\n${t.description}\n\nMoments that define a season. This is why we love sports.\n\n💪 #sports`,
        (t) => `🥇 ${t.title}\n\n${t.description}\n\nPassion is non-negotiable. Stories like these remind us why we follow every game, every match, every race.\n\n⚽ What's your favorite sports moment this year?`,
      ],
    },
  },

  "@entertainment": {
    tone: "fun",
    emoji: ["🎬", "🎭", "⭐", "🎵", "🍿"],
    formats: {
      es: [
        (t) => `🎬 ENTRETENIMIENTO\n\n${t.title}\n\n${t.description}\n\nEl mundo del espectáculo siempre nos tiene al borde. ¿Ya sabían de esto? 🍿\n\n📡 ${t.source}`,
        (t) => `⭐ TRENDING EN HOLLYWOOD\n\n${t.title}\n\n${t.description}\n\nLa industria del entretenimiento no para. Series, películas, música — siempre hay algo nuevo.\n\n🎭 ¿Qué están viendo/escuchando esta semana?`,
        (t) => `🎵 CULTURA POP\n\n${t.title}\n\n${t.description}\n\nDe esto se habla hoy. La cultura pop refleja lo que somos como sociedad.\n\n🎬 Compartan su opinión 👇`,
      ],
      en: [
        (t) => `🎬 ENTERTAINMENT\n\n${t.title}\n\n${t.description}\n\nShowbiz always keeps us on edge. Did you know about this? 🍿\n\n📡 ${t.source}`,
        (t) => `⭐ TRENDING IN HOLLYWOOD\n\n${t.title}\n\n${t.description}\n\nThe entertainment industry never stops. Shows, movies, music — there's always something new.\n\n🎭 What are you watching/listening to this week?`,
        (t) => `🎵 POP CULTURE\n\n${t.title}\n\n${t.description}\n\nThis is what everyone is talking about today. Pop culture reflects who we are as a society.\n\n🎬 Share your thoughts 👇`,
      ],
    },
  },

  "@world": {
    tone: "serious",
    emoji: ["🌍", "🌎", "🌏", "🗺️", "📍"],
    formats: {
      es: [
        (t) => `🌍 NOTICIAS INTERNACIONALES\n\n${t.title}\n\n${t.description}\n\nLo que pasa en el mundo nos afecta a todos. Mantenerse informado es fundamental.\n\n📍 ${t.source}\n\n#internacional #noticias`,
        (t) => `🌎 PANORAMA GLOBAL\n\n${t.title}\n\n${t.description}\n\nPerspectiva:\nEl contexto geopolítico actual hace que esta noticia sea especialmente relevante. Los próximos movimientos definirán la agenda internacional.\n\n🗺️ Fuente: ${t.source}`,
        (t) => `🌏 ALREDEDOR DEL MUNDO\n\n${t.title}\n\n${t.description}\n\nVivimos en un mundo conectado. Lo que sucede en un lugar impacta en todos los demás.\n\n📍 ¿Cómo ven esta situación desde su país?`,
      ],
      en: [
        (t) => `🌍 INTERNATIONAL NEWS\n\n${t.title}\n\n${t.description}\n\nWhat happens around the world affects us all. Staying informed is essential.\n\n📍 ${t.source}\n\n#international #news`,
        (t) => `🌎 GLOBAL OUTLOOK\n\n${t.title}\n\n${t.description}\n\nPerspective:\nThe current geopolitical context makes this news especially relevant. The next moves will define the international agenda.\n\n🗺️ Source: ${t.source}`,
        (t) => `🌏 AROUND THE WORLD\n\n${t.title}\n\n${t.description}\n\nWe live in a connected world. What happens in one place impacts everywhere else.\n\n📍 How do you see this from your country?`,
      ],
    },
  },
};

const ACCOUNT_CATEGORIES: Record<OfficialAccount, Category[]> = {
  "@news":          ["world_news", "crypto_news", "tech"],
  "@crypto":        ["crypto_news", "market_analysis", "trading_signals"],
  "@trading":       ["trading_signals", "market_analysis", "crypto_news"],
  "@memes":         ["memecoins", "crypto_news", "entertainment"],
  "@builders":      ["tech", "crypto_news", "worldcoin_updates"],
  "@sports":        ["sports"],
  "@entertainment": ["entertainment", "lifestyle"],
  "@world":         ["world_news"],
};

export function getAccountCategories(account: OfficialAccount): Category[] {
  return ACCOUNT_CATEGORIES[account] || ["world_news"];
}

export function generatePost(
  account: OfficialAccount,
  trend: TrendData,
  lang: "es" | "en"
): { content: string; image: string | null } {
  const personality = PERSONALITIES[account];
  if (!personality) {
    return {
      content: `${trend.title}\n\n${trend.description}`,
      image: trend.image,
    };
  }

  const templates = personality.formats[lang];
  const template = templates[Math.floor(Math.random() * templates.length)];
  const content = template(trend);

  return { content, image: trend.image };
}

export function getAllAccounts(): OfficialAccount[] {
  return Object.keys(PERSONALITIES) as OfficialAccount[];
}

export function getRandomLang(): "es" | "en" {
  return Math.random() < 0.5 ? "es" : "en";
}
