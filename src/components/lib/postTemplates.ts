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

  function cite(t: TrendData): string {
    let footer = `\n\n📡 Fuente: ${t.source}`;
    if (t.image) footer += `\n📸 Imagen vía ${t.source}`;
    return footer;
  }

  const PERSONALITIES: Record<OfficialAccount, Personality> = {
    "@news": {
      tone: "professional-journalist",
      emoji: ["📰", "🔴", "⚡", "🌐", "📡"],
      formats: {
        es: [
          (t) => `🔴 ÚLTIMA HORA\n\n${t.title}\n\n${t.description}\n\nEsta noticia marca un punto de inflexión que vale la pena seguir de cerca. Las próximas horas serán determinantes para entender el alcance real de lo que está ocurriendo. Desde H News vamos a estar monitoreando cada desarrollo nuevo que surja.\n\nSi tienen información adicional o quieren debatir el tema, los leemos abajo 👇${cite(t)}`,

          (t) => `📰 COBERTURA ESPECIAL\n\n${t.title}\n\n${t.description}\n\nPara poner esto en contexto: no es un hecho aislado. Viene en una línea de acontecimientos que vienen escalando en las últimas semanas. Los analistas coinciden en que esto podría tener repercusiones más allá de lo inmediato.\n\nDesde la redacción de H News consideramos que es fundamental no quedarse solo con el titular. El contexto completo cambia la perspectiva.\n\n¿Qué opinan ustedes? ¿Les sorprende o lo veían venir?${cite(t)}`,

          (t) => `⚡ DESARROLLO IMPORTANTE\n\n${t.title}\n\n${t.description}\n\nLo que sabemos hasta ahora:\n▸ Los hechos están confirmados por múltiples fuentes\n▸ Las reacciones institucionales aún se están procesando\n▸ Se esperan más declaraciones en las próximas horas\n\nEn H News creemos que la información verificada es la mejor herramienta. Vamos a seguir actualizando conforme se conozcan más detalles.\n\nActiven notificaciones para no perderse nada 🔔${cite(t)}`,

          (t) => `🌐 ANÁLISIS DEL DÍA\n\n${t.title}\n\n${t.description}\n\nMás allá del titular, hay tres aspectos clave que la mayoría pasa por alto:\n\n1️⃣ El timing no es casual — coincide con movimientos que venían gestándose\n2️⃣ Las consecuencias a mediano plazo podrían ser más significativas que el evento en sí\n3️⃣ La reacción pública va a definir el próximo capítulo de esta historia\n\nEn H News separamos el ruido de la señal. Síganosla para análisis que van más allá de lo obvio.${cite(t)}`,
        ],
        en: [
          (t) => `🔴 BREAKING NEWS\n\n${t.title}\n\n${t.description}\n\nThis is a pivotal moment worth watching closely. The next few hours will be critical in understanding the real scope of what's unfolding. H News will be monitoring every new development as it comes in.\n\nIf you have additional insights or want to debate this, we're reading every comment below 👇${cite(t)}`,

          (t) => `📰 SPECIAL COVERAGE\n\n${t.title}\n\n${t.description}\n\nLet's put this in context: this isn't an isolated event. It follows a pattern of escalating developments over recent weeks. Analysts agree this could have implications far beyond the immediate.\n\nAt H News, we believe it's essential to look beyond the headline. The full context shifts the perspective entirely.\n\nWhat's your take? Did you see this coming?${cite(t)}`,

          (t) => `⚡ DEVELOPING STORY\n\n${t.title}\n\n${t.description}\n\nWhat we know so far:\n▸ The facts have been confirmed by multiple sources\n▸ Institutional reactions are still being processed\n▸ More statements expected in the coming hours\n\nAt H News, we believe verified information is the best tool. We'll keep updating as more details emerge.\n\nTurn on notifications so you don't miss anything 🔔${cite(t)}`,

          (t) => `🌐 TODAY'S ANALYSIS\n\n${t.title}\n\n${t.description}\n\nBeyond the headline, there are three key aspects most people overlook:\n\n1️⃣ The timing isn't coincidental — it aligns with movements that have been building\n2️⃣ The medium-term consequences could be more significant than the event itself\n3️⃣ Public reaction will define the next chapter of this story\n\nAt H News, we separate noise from signal. Follow us for analysis that goes beyond the obvious.${cite(t)}`,
        ],
      },
    },

    "@crypto": {
      tone: "analytical-degen",
      emoji: ["₿", "📊", "🚀", "💎", "🔥"],
      formats: {
        es: [
          (t) => `₿ CRYPTO DEEP DIVE\n\n${t.title}\n\n${t.description}\n\nVamos a desglosar esto porque hay mucha tela para cortar. Lo primero que hay que entender es que el mercado crypto no se mueve por titulares — se mueve por liquidez, sentimiento institucional y narrativas.\n\nEste movimiento en particular tiene implicaciones directas para:\n• Portafolios de largo plazo que están acumulando\n• Traders que buscan entradas en zonas de descuento\n• Proyectos DeFi que dependen de la estabilidad del ecosistema\n\nLos que llevan tiempo en esto saben: cuando todo el mundo habla, ya es tarde. La verdadera alpha está en interpretar los datos antes que la masa.\n\n💎 No es consejo financiero. Siempre DYOR.${cite(t)}`,

          (t) => `🔥 ALERTA CRYPTO\n\n${t.title}\n\n${t.description}\n\nLo que estoy viendo en los datos on-chain me dice más que cualquier titular:\n\n→ Las ballenas están acumulando silenciosamente\n→ El volumen en exchanges descentralizados subió fuerte\n→ Los flujos de stablecoins indican que hay capital esperando para entrar\n→ El ratio de funding está en zona neutral, espacio para movimiento\n\nEl mercado crypto es un juego de paciencia y datos. Los que se dejan llevar por el FOMO o el FUD terminan siendo exit liquidity.\n\nArmen su tesis, validen con datos, ejecuten con disciplina. Así se sobrevive en crypto.\n\n📊 DYOR siempre.${cite(t)}`,

          (t) => `🚀 TENDENCIA CRYPTO\n\n${t.title}\n\n${t.description}\n\nEsto es lo que pasa cuando confluyen narrativa y fundamentales. El mercado está empezando a preciar algo que los degens vieron hace semanas.\n\nMi lectura:\n1. La adopción institucional sigue acelerando a pesar del ruido regulatorio\n2. Los builders siguen construyendo — eso es la señal más bullish que existe\n3. El capital inteligente no espera confirmación, se posiciona antes\n\nPero ojo: cada ciclo tiene sus trampas. No todo lo que sube va a seguir subiendo. La gestión de riesgo es lo que separa a los que sobreviven de los que desaparecen.\n\n#crypto #blockchain #DeFi${cite(t)}`,

          (t) => `📊 MARKET DEEP ANALYSIS\n\n${t.title}\n\n${t.description}\n\nHay veces que un dato lo cambia todo. Esto es una de esas veces.\n\nLo que veo en los gráficos:\n→ Presión compradora sostenida en los últimos ciclos de 4h\n→ Métricas on-chain muestran holders incrementando posiciones\n→ El open interest en derivados está creciendo de forma orgánica\n→ Sentimiento del mercado: prudentemente optimista\n\nNo se confundan: prudente no es lo mismo que miedoso. Los mejores trades se hacen cuando tenés una tesis clara y la data la respalda.\n\nSiempre DYOR 🧠 No es consejo financiero.${cite(t)}`,
        ],
        en: [
          (t) => `₿ CRYPTO DEEP DIVE\n\n${t.title}\n\n${t.description}\n\nLet's break this down because there's a lot to unpack. The first thing to understand is that the crypto market doesn't move on headlines — it moves on liquidity, institutional sentiment, and narratives.\n\nThis particular move has direct implications for:\n• Long-term portfolios that are accumulating\n• Traders looking for entries at discount zones\n• DeFi projects that depend on ecosystem stability\n\nThose who've been around know: when everyone's talking, it's already late. The real alpha is in reading the data before the crowd.\n\n💎 Not financial advice. Always DYOR.${cite(t)}`,

          (t) => `🔥 CRYPTO ALERT\n\n${t.title}\n\n${t.description}\n\nWhat I'm seeing in on-chain data tells me more than any headline:\n\n→ Whales are quietly accumulating\n→ Volume on decentralized exchanges spiked hard\n→ Stablecoin flows indicate capital waiting on the sidelines\n→ Funding rate is in neutral territory, room for movement\n\nThe crypto market is a game of patience and data. Those who let FOMO or FUD drive them end up as exit liquidity.\n\nBuild your thesis, validate with data, execute with discipline. That's how you survive in crypto.\n\n📊 Always DYOR.${cite(t)}`,

          (t) => `🚀 CRYPTO TREND\n\n${t.title}\n\n${t.description}\n\nThis is what happens when narrative and fundamentals converge. The market is starting to price in something degens spotted weeks ago.\n\nMy read:\n1. Institutional adoption keeps accelerating despite regulatory noise\n2. Builders keep building — that's the most bullish signal there is\n3. Smart money doesn't wait for confirmation, it positions early\n\nBut watch out: every cycle has its traps. Not everything that goes up will keep going up. Risk management is what separates survivors from those who vanish.\n\n#crypto #blockchain #DeFi${cite(t)}`,

          (t) => `📊 MARKET DEEP ANALYSIS\n\n${t.title}\n\n${t.description}\n\nSometimes one data point changes everything. This is one of those times.\n\nWhat I see on the charts:\n→ Sustained buying pressure over the last 4h cycles\n→ On-chain metrics show holders increasing positions\n→ Open interest in derivatives growing organically\n→ Market sentiment: cautiously optimistic\n\nDon't get confused: cautious isn't the same as scared. The best trades happen when you have a clear thesis backed by data.\n\nAlways DYOR 🧠 Not financial advice.${cite(t)}`,
        ],
      },
    },

    "@trading": {
      tone: "cold-precise-trader",
      emoji: ["📈", "📉", "💰", "⚠️", "🎯"],
      formats: {
        es: [
          (t) => `📈 SEÑAL DE TRADING\n\n${t.title}\n\n${t.description}\n\nAnálisis técnico rápido basado en los datos disponibles:\n\nNiveles a observar:\n🟢 Zona de soporte: buscar reacción en retrocesos\n🔴 Resistencia próxima: si rompe con volumen, posible continuación\n🎯 Objetivo: extensión de Fibonacci del movimiento previo\n\nIndicadores complementarios:\n• RSI en zona media — no hay sobrecompra ni sobreventa\n• MACD con cruce pendiente — confirmar dirección\n• Volumen creciente — señal de interés genuino\n\nPlan de acción: esperar confirmación. Entrar sin setup claro es apostar, no tradear.\n\n⚠️ Gestionen su riesgo. Stop loss no es opcional. Esto NO es consejo financiero.${cite(t)}`,

          (t) => `📉 ALERTA DE MERCADO\n\n${t.title}\n\n${t.description}\n\nEl mercado está hablando. La pregunta es: ¿estás escuchando?\n\nLo que los datos muestran:\n• La volatilidad implícita está subiendo — prepararse para movimiento fuerte\n• Las liquidaciones en ambas direcciones indican incertidumbre\n• El order book muestra acumulación en ciertos niveles clave\n\nEn momentos así, la mejor estrategia es la paciencia. Los traders que sobreviven son los que esperan el setup perfecto, no los que persiguen cada vela.\n\nRegla número uno: preservar capital. Regla número dos: no olvidar la regla número uno.\n\n💰 #trading #markets${cite(t)}`,

          (t) => `🎯 ANÁLISIS TÉCNICO COMPLETO\n\n${t.title}\n\n${t.description}\n\nDesglose técnico:\n\n▸ Temporalidad diaria: estructura alcista/bajista vigente\n▸ Temporalidad 4H: patrón de consolidación formándose\n▸ Temporalidad 1H: momento de decisión inminente\n\nPatrones observados:\n→ Posible formación de doble suelo/techo\n→ Divergencia en RSI que merece atención\n→ Volumen decreciente en la consolidación — típico antes de expansión\n\nPlan: marcar niveles, configurar alertas, actuar solo cuando el precio confirme. El ego y las emociones no tienen lugar en el trading.\n\nOperen con disciplina. Stop loss siempre. 📊${cite(t)}`,
        ],
        en: [
          (t) => `📈 TRADING SIGNAL\n\n${t.title}\n\n${t.description}\n\nQuick technical analysis based on available data:\n\nLevels to watch:\n🟢 Support zone: look for reaction on pullbacks\n🔴 Next resistance: if broken with volume, possible continuation\n🎯 Target: Fibonacci extension of previous move\n\nComplementary indicators:\n• RSI in mid zone — no overbought or oversold\n• MACD with pending crossover — confirm direction\n• Increasing volume — sign of genuine interest\n\nAction plan: wait for confirmation. Entering without a clear setup is gambling, not trading.\n\n⚠️ Manage your risk. Stop loss is not optional. This is NOT financial advice.${cite(t)}`,

          (t) => `📉 MARKET ALERT\n\n${t.title}\n\n${t.description}\n\nThe market is speaking. The question is: are you listening?\n\nWhat the data shows:\n• Implied volatility is rising — prepare for a strong move\n• Liquidations in both directions indicate uncertainty\n• The order book shows accumulation at key levels\n\nIn moments like these, patience is the best strategy. Traders who survive are those who wait for the perfect setup, not those who chase every candle.\n\nRule number one: preserve capital. Rule number two: don't forget rule number one.\n\n💰 #trading #markets${cite(t)}`,

          (t) => `🎯 FULL TECHNICAL ANALYSIS\n\n${t.title}\n\n${t.description}\n\nTechnical breakdown:\n\n▸ Daily timeframe: prevailing bullish/bearish structure\n▸ 4H timeframe: consolidation pattern forming\n▸ 1H timeframe: decision moment imminent\n\nPatterns observed:\n→ Possible double bottom/top formation\n→ RSI divergence worth watching\n→ Decreasing volume in consolidation — typical before expansion\n\nPlan: mark levels, set alerts, act only when price confirms. Ego and emotions have no place in trading.\n\nTrade with discipline. Always use stop loss. 📊${cite(t)}`,
        ],
      },
    },

    "@memes": {
      tone: "gen-z-ironic-degen",
      emoji: ["😂", "🐸", "💀", "🤣", "🔥"],
      formats: {
        es: [
          (t) => `🐸 Che, no puedo ser el único que vio esto...\n\n"${t.title}"\n\n${t.description}\n\nO sea, literal estoy acá con el celu a las 3am leyendo esto mientras mi portafolio hace lo que le da la gana. Siento que el universo me está trolleando.\n\nLo peor es que ya ni me sorprende. Después de sobrevivir tres bear markets, dos rug pulls y ese lunes que BTC bajó 40% mientras yo dormía... ya nada me asusta.\n\nPero bueno, al menos tenemos memes. Y mientras haya memes, hay esperanza. O algo así, no sé, ya perdí la cuenta de cuánto estoy en rojo 💀\n\nSi esto no es la definición de 2026, no sé qué es 😂${cite(t)}`,

          (t) => `💀 JAJAJA esto es demasiado real:\n\n${t.title}\n\n${t.description}\n\nImaginate explicarle esto a tu viejo. "Sí pa, invertí en monedas de internet con dibujos de perros". La cara que pone no tiene precio.\n\nPero sabés qué? Los que se reían en 2020 ahora preguntan "cómo compro Bitcoin". Así que quién se ríe último, ríe mejor.\n\nEl mercado es un circo y nosotros somos los payasos mejor informados. Al menos nos divertimos mientras perdemos plata 🤣\n\nRT si te sentís identificado. Si no, mentís.${cite(t)}`,

          (t) => `🔥 POV: Estás leyendo "${t.title}" mientras tu portafolio hace -15%\n\n${t.description}\n\nLa verdad? Ya me da igual. Llegué a un nivel de paz interior con mis pérdidas que un monje budista me envidiaría.\n\nFases del crypto investor:\n1. "Voy a investigar bien antes de invertir" ❌\n2. "Vi un tiktoker que dijo que sube" ✅\n3. "Es una inversión a largo plazo" (cope)\n4. "En 10 años me van a agradecer" (mega cope)\n5. "Bueno al menos aprendí" (acceptance)\n\nYo estoy en la fase 4.7 aprox 🐸\n\n#memecoin #crypto #humor${cite(t)}`,
        ],
        en: [
          (t) => `🐸 Can't be the only one who saw this...\n\n"${t.title}"\n\n${t.description}\n\nBro I'm literally sitting here at 3am on my phone reading this while my portfolio does whatever it wants. I feel like the universe is trolling me.\n\nThe worst part is I'm not even surprised anymore. After surviving three bear markets, two rug pulls, and that Monday BTC dropped 40% while I was sleeping... nothing scares me.\n\nBut hey, at least we have memes. And as long as there are memes, there's hope. Or something like that, idk, I've lost count of how deep in the red I am 💀\n\nIf this isn't the definition of 2026, I don't know what is 😂${cite(t)}`,

          (t) => `💀 LMAOOO this is too real:\n\n${t.title}\n\n${t.description}\n\nImagine explaining this to your parents. "Yeah dad, I invested in internet coins with dog pictures on them." The look on their face is priceless.\n\nBut you know what? The people who laughed in 2020 are now asking "how do I buy Bitcoin." So he who laughs last, laughs best.\n\nThe market is a circus and we're the best-informed clowns. At least we're having fun while losing money 🤣\n\nRT if you feel attacked. If not, you're lying.${cite(t)}`,

          (t) => `🔥 POV: You're reading "${t.title}" while your portfolio does -15%\n\n${t.description}\n\nHonestly? I don't even care anymore. I've reached a level of inner peace with my losses that a Buddhist monk would envy.\n\nStages of a crypto investor:\n1. "I'll research thoroughly before investing" ❌\n2. "Saw a tiktoker say it's going up" ✅\n3. "It's a long-term investment" (cope)\n4. "In 10 years they'll thank me" (mega cope)\n5. "Well at least I learned" (acceptance)\n\nI'm at stage 4.7 approximately 🐸\n\n#memecoin #crypto #humor${cite(t)}`,
        ],
      },
    },

    "@builders": {
      tone: "tech-founder-grind",
      emoji: ["🛠️", "⚙️", "💻", "🧱", "🔧"],
      formats: {
        es: [
          (t) => `🛠️ PARA BUILDERS\n\n${t.title}\n\n${t.description}\n\nEsto es exactamente lo que veníamos necesitando en el ecosistema. Cada vez que aparece una herramienta nueva o un avance así, se abren puertas que antes ni existían.\n\nLo que esto significa para los que estamos construyendo:\n→ Nuevas primitivas disponibles para experimentar\n→ Oportunidades de integración que reducen fricción\n→ El stack sigue evolucionando y los que se adaptan primero tienen ventaja\n\nPero seamos honestos: la tecnología sin ejecución no vale nada. El 90% de los proyectos mueren no por falta de tech sino por falta de consistencia.\n\nLa pregunta no es "¿qué herramienta uso?" sino "¿estoy construyendo algo que alguien necesita?"\n\nSigan construyendo 🧱 El próximo unicornio probablemente lo está armando alguien en un garage ahora mismo.${cite(t)}`,

          (t) => `💻 DEV UPDATE\n\n${t.title}\n\n${t.description}\n\nPerspectiva técnica desde las trincheras: esto abre puertas para aplicaciones más robustas y escalables. Pero la clave no está en adoptar todo lo nuevo — está en entender qué resuelve tu problema específico.\n\nLo que estamos viendo en el ecosistema builder:\n• Más teams optando por stacks modulares\n• La composability se vuelve estándar, no diferenciador\n• Los developers que entienden producto tienen 10x más impacto\n\nUn consejo que me hubiera gustado recibir antes: no construyas features, construí soluciones. La diferencia es enorme.\n\n⚙️ #web3 #builders #shipping${cite(t)}`,

          (t) => `🔧 BUILD IN PUBLIC\n\n${t.title}\n\n${t.description}\n\nRecordatorio para todos los builders:\n\nLas mejores apps no se construyen con hype — se construyen con iteraciones silenciosas, feedback de usuarios reales y la disciplina de shipear aunque no sea perfecto.\n\nLo que aprendí construyendo:\n1. Lanzá rápido, iterá después\n2. Los usuarios te dicen qué quieren si los escuchás\n3. El código perfecto que nadie usa no sirve\n4. La consistencia le gana al talento todos los días\n\nConsistencia > hype. Siempre.\n\n🧱 ¿En qué están trabajando hoy? Compartan sus proyectos abajo.${cite(t)}`,
        ],
        en: [
          (t) => `🛠️ FOR BUILDERS\n\n${t.title}\n\n${t.description}\n\nThis is exactly what the ecosystem has been needing. Every time a new tool or advancement like this appears, it opens doors that didn't exist before.\n\nWhat this means for those of us building:\n→ New primitives available to experiment with\n→ Integration opportunities that reduce friction\n→ The stack keeps evolving and early adapters have the edge\n\nBut let's be honest: technology without execution is worthless. 90% of projects die not from lack of tech but from lack of consistency.\n\nThe question isn't "what tool should I use?" but "am I building something someone needs?"\n\nKeep building 🧱 The next unicorn is probably being assembled by someone in a garage right now.${cite(t)}`,

          (t) => `💻 DEV UPDATE\n\n${t.title}\n\n${t.description}\n\nTechnical perspective from the trenches: this opens doors for more robust and scalable applications. But the key isn't adopting everything new — it's understanding what solves your specific problem.\n\nWhat we're seeing in the builder ecosystem:\n• More teams opting for modular stacks\n• Composability becoming standard, not a differentiator\n• Developers who understand product have 10x more impact\n\nAdvice I wish I'd received earlier: don't build features, build solutions. The difference is enormous.\n\n⚙️ #web3 #builders #shipping${cite(t)}`,

          (t) => `🔧 BUILD IN PUBLIC\n\n${t.title}\n\n${t.description}\n\nReminder for all builders:\n\nThe best apps aren't built on hype — they're built through silent iterations, real user feedback, and the discipline to ship even when it's not perfect.\n\nWhat I've learned from building:\n1. Launch fast, iterate later\n2. Users tell you what they want if you listen\n3. Perfect code that nobody uses is useless\n4. Consistency beats talent every single day\n\nConsistency > hype. Always.\n\n🧱 What are you working on today? Share your projects below.${cite(t)}`,
        ],
      },
    },

    "@sports": {
      tone: "passionate-fan",
      emoji: ["⚽", "🏀", "🏆", "🥇", "💪"],
      formats: {
        es: [
          (t) => `⚽ DEPORTES — ESTO ES GRANDE\n\n${t.title}\n\n${t.description}\n\nHay momentos en el deporte que trascienden el resultado. Esto es uno de esos momentos. No importa de qué equipo seas, hay que reconocer cuando algo extraordinario pasa.\n\nLo que hace al deporte único es esto: en ningún otro ámbito de la vida, millones de personas comparten una emoción al mismo tiempo. Un gol, un buzzer beater, una victoria inesperada — y de repente todos estamos gritando al unísono.\n\nComenten con el nombre de su equipo y por qué este año es EL año 🏆\n\nEl deporte nos une. Siempre.${cite(t)}`,

          (t) => `🏆 MOMENTO HISTÓRICO\n\n${t.title}\n\n${t.description}\n\nEstas son las historias que le contás a tus hijos. Los momentos que definen una generación de fanáticos.\n\nLo que más me impresiona no es el resultado en sí — es el camino. Las horas de entrenamiento invisible, las lesiones superadas, las derrotas que forjaron el carácter. Todo eso se resume en un instante de gloria.\n\nPor eso amamos el deporte: porque nos recuerda que con dedicación y sacrificio, lo extraordinario es posible.\n\n💪 ¿Cuál es el momento deportivo que más los marcó? Los leo.${cite(t)}`,

          (t) => `🥇 ACTUALIZACIÓN DEPORTIVA\n\n${t.title}\n\n${t.description}\n\nAnálisis rápido de lo que estamos viendo:\n\n▸ El nivel de competencia esta temporada está por las nubes\n▸ Los récords están cayendo uno tras otro\n▸ Nuevas estrellas emergiendo que prometen cambiar el panorama\n\nLa pasión no se negocia. Cada partido, cada carrera, cada set — todo puede cambiar en un segundo. Y eso es lo hermoso.\n\n⚽ ¿Qué deporte están siguiendo más de cerca esta temporada?${cite(t)}`,
        ],
        en: [
          (t) => `⚽ SPORTS — THIS IS BIG\n\n${t.title}\n\n${t.description}\n\nThere are moments in sports that transcend the scoreboard. This is one of those moments. Regardless of your team, you have to acknowledge when something extraordinary happens.\n\nWhat makes sports unique is this: in no other area of life do millions of people share an emotion at the same time. A goal, a buzzer beater, an unexpected victory — and suddenly we're all screaming in unison.\n\nDrop your team name and why this year is THE year 🏆\n\nSports unite us. Always.${cite(t)}`,

          (t) => `🏆 HISTORIC MOMENT\n\n${t.title}\n\n${t.description}\n\nThese are the stories you tell your kids. The moments that define a generation of fans.\n\nWhat impresses me most isn't the result itself — it's the journey. The invisible hours of training, injuries overcome, defeats that forged character. All of it condensed into one moment of glory.\n\nThat's why we love sports: because it reminds us that with dedication and sacrifice, the extraordinary is possible.\n\n💪 What's the sports moment that marked you the most? Tell me.${cite(t)}`,

          (t) => `🥇 SPORTS UPDATE\n\n${t.title}\n\n${t.description}\n\nQuick analysis of what we're seeing:\n\n▸ Competition level this season is through the roof\n▸ Records are falling one after another\n▸ New stars emerging that promise to change the landscape\n\nPassion is non-negotiable. Every match, every race, every set — everything can change in a second. And that's the beauty of it.\n\n⚽ What sport are you following most closely this season?${cite(t)}`,
        ],
      },
    },

    "@entertainment": {
      tone: "pop-culture-obsessed",
      emoji: ["🎬", "🎭", "⭐", "🎵", "🍿"],
      formats: {
        es: [
          (t) => `🎬 ENTRETENIMIENTO — HAY QUE HABLAR DE ESTO\n\n${t.title}\n\n${t.description}\n\nOk, necesito que hablemos de esto porque el internet ya está en llamas.\n\nLo primero: no me sorprende. Venía viendo señales hace rato. Pero lo segundo — y esto es lo importante — es cómo esto refleja el cambio cultural que estamos viviendo.\n\nEl entretenimiento dejó de ser solo "distracción". Hoy moldea conversaciones, opiniones y hasta movimientos sociales. Lo que vemos en pantalla importa porque nos define como generación.\n\n¿Ya vieron/escucharon esto? Necesito sus hot takes en los comentarios 🍿${cite(t)}`,

          (t) => `⭐ TRENDING EN CULTURA POP\n\n${t.title}\n\n${t.description}\n\nLa industria del entretenimiento no para y nosotros tampoco. Series, películas, música, podcasts — el contenido es infinito pero el tiempo no.\n\nMi opinión caliente: estamos en una era dorada de contenido pero también de saturación. El desafío ya no es encontrar qué ver — es filtrar entre tanto ruido.\n\nLo que vale la pena de esta noticia es cómo impacta en lo que viene. Las tendencias de hoy definen los estrenos de mañana.\n\n🎭 ¿Qué están viendo/escuchando esta semana? Recomienden algo bueno que ando buscando.${cite(t)}`,

          (t) => `🎵 CULTURA POP AL DÍA\n\n${t.title}\n\n${t.description}\n\nDe esto se habla hoy. Y con razón.\n\nLa cultura pop es el termómetro de la sociedad. Lo que consumimos, lo que viralizamos, lo que cancelamos — todo dice algo sobre quiénes somos ahora mismo.\n\nEsta noticia en particular me parece relevante porque conecta con algo más grande que el entretenimiento puro: conecta con cómo nos relacionamos con los medios y las celebridades en 2026.\n\n¿Hot take o not? Compartan su opinión sin filtro 👇${cite(t)}`,
        ],
        en: [
          (t) => `🎬 ENTERTAINMENT — WE NEED TO TALK ABOUT THIS\n\n${t.title}\n\n${t.description}\n\nOk, we need to talk about this because the internet is already on fire.\n\nFirst: I'm not surprised. I've been seeing signs for a while. But second — and this is the important part — is how this reflects the cultural shift we're living through.\n\nEntertainment stopped being just "distraction." Today it shapes conversations, opinions, and even social movements. What we see on screen matters because it defines us as a generation.\n\nHave you seen/heard about this? I need your hot takes in the comments 🍿${cite(t)}`,

          (t) => `⭐ TRENDING IN POP CULTURE\n\n${t.title}\n\n${t.description}\n\nThe entertainment industry never stops and neither do we. Shows, movies, music, podcasts — content is infinite but time is not.\n\nMy hot take: we're in a golden age of content but also of saturation. The challenge is no longer finding what to watch — it's filtering through the noise.\n\nWhat's valuable about this news is how it impacts what's coming next. Today's trends define tomorrow's releases.\n\n🎭 What are you watching/listening to this week? Recommend something good, I'm looking.${cite(t)}`,

          (t) => `🎵 POP CULTURE TODAY\n\n${t.title}\n\n${t.description}\n\nThis is what everyone's talking about today. And for good reason.\n\nPop culture is society's thermometer. What we consume, what we make viral, what we cancel — it all says something about who we are right now.\n\nThis story in particular is relevant because it connects to something bigger than pure entertainment: it connects to how we relate to media and celebrities in 2026.\n\nHot take or not? Share your unfiltered opinion 👇${cite(t)}`,
        ],
      },
    },

    "@world": {
      tone: "geopolitical-analyst",
      emoji: ["🌍", "🌎", "🌏", "🗺️", "📍"],
      formats: {
        es: [
          (t) => `🌍 PANORAMA INTERNACIONAL\n\n${t.title}\n\n${t.description}\n\nEste tipo de noticias requieren más que una lectura rápida. Requieren contexto.\n\nLo que está pasando no es un evento aislado — es parte de un tablero geopolítico que se viene reconfigurando. Las alianzas cambian, los intereses económicos definen posiciones y la opinión pública juega un rol cada vez más relevante.\n\nTres claves para entender esta situación:\n1️⃣ El contexto histórico: esto tiene antecedentes que explican el presente\n2️⃣ Los intereses en juego: seguir el dinero siempre aclara el panorama\n3️⃣ Las consecuencias posibles: los escenarios varían pero ninguno es menor\n\nMantenerse informado es la mejor herramienta ciudadana. No dejen que otros interpreten la realidad por ustedes.${cite(t)}`,

          (t) => `🌎 ANÁLISIS GLOBAL\n\n${t.title}\n\n${t.description}\n\nPerspectiva geopolítica:\n\nEl mundo en 2026 es más complejo que nunca. Las líneas entre lo local y lo global se desdibujaron. Lo que ocurre en un continente tiene repercusiones inmediatas en los otros.\n\nEsta noticia en particular importa porque:\n→ Refleja tensiones que llevan meses acumulándose\n→ Involucra actores que pueden alterar equilibrios regionales\n→ Tiene implicaciones económicas directas para mercados emergentes\n\nEn H World creemos que entender el mundo no es un lujo — es una necesidad. Cada ciudadano informado es un ciudadano más libre.\n\n🗺️ ¿Cómo ven esta situación desde su país? Perspectivas diversas enriquecen el análisis.${cite(t)}`,

          (t) => `🌏 NOTICIAS DEL MUNDO\n\n${t.title}\n\n${t.description}\n\nVivimos en un mundo hiperconectado donde la información viaja más rápido que la comprensión. Por eso es fundamental detenerse a pensar antes de reaccionar.\n\nLo que observamos:\n• Los medios internacionales están cubriendo esto con diferentes enfoques según región\n• Las redes sociales amplifican ciertas narrativas sobre otras\n• La verdad, como siempre, está en algún lugar entre todas las versiones\n\nNuestro compromiso desde H World: dar contexto, no solo titulares. Conectar los puntos, no solo señalarlos.\n\n📍 ¿Qué información adicional tienen sobre esto? Construyamos el panorama juntos.${cite(t)}`,
        ],
        en: [
          (t) => `🌍 INTERNATIONAL OUTLOOK\n\n${t.title}\n\n${t.description}\n\nStories like this require more than a quick read. They require context.\n\nWhat's happening isn't an isolated event — it's part of a geopolitical chessboard that's been reconfiguring. Alliances shift, economic interests define positions, and public opinion plays an increasingly relevant role.\n\nThree keys to understanding this situation:\n1️⃣ Historical context: there are precedents that explain the present\n2️⃣ Interests at stake: following the money always clarifies the picture\n3️⃣ Possible consequences: scenarios vary but none are minor\n\nStaying informed is the best civic tool. Don't let others interpret reality for you.${cite(t)}`,

          (t) => `🌎 GLOBAL ANALYSIS\n\n${t.title}\n\n${t.description}\n\nGeopolitical perspective:\n\nThe world in 2026 is more complex than ever. The lines between local and global have blurred. What happens on one continent has immediate repercussions on others.\n\nThis story matters because:\n→ It reflects tensions that have been building for months\n→ It involves actors that can alter regional balances\n→ It has direct economic implications for emerging markets\n\nAt H World, we believe understanding the world isn't a luxury — it's a necessity. Every informed citizen is a freer citizen.\n\n🗺️ How do you see this from your country? Diverse perspectives enrich the analysis.${cite(t)}`,

          (t) => `🌏 WORLD NEWS\n\n${t.title}\n\n${t.description}\n\nWe live in a hyperconnected world where information travels faster than understanding. That's why it's essential to pause and think before reacting.\n\nWhat we observe:\n• International media are covering this with different angles depending on region\n• Social media amplifies certain narratives over others\n• The truth, as always, lies somewhere between all versions\n\nOur commitment at H World: provide context, not just headlines. Connect the dots, not just point them out.\n\n📍 What additional information do you have about this? Let's build the picture together.${cite(t)}`,
        ],
      },
    },

    "@scanner": {
      tone: "data-driven-analyst",
      emoji: ["🔍", "📊", "🧠", "⚠️", "🛡️"],
      formats: {
        es: [
          (t) => `🔍 SCANNER REPORT\n\n${t.title}\n\n${t.description}\n\nDesde el Scanner estamos monitoreando cómo esto impacta en los mercados en tiempo real. Los datos no mienten.\n\nMétricas clave que estamos observando:\n• Volumen de trading asociado: en aumento\n• Sentimiento social: polarizado entre cautela y oportunismo\n• Actividad de wallets grandes: movimientos detectados\n\nRecuerden: antes de tomar cualquier decisión de inversión, verifiquen las métricas. El FOMO es el peor consejero financiero que existe.\n\nUsen el Scanner para verificar cualquier token antes de invertir. Los datos protegen mejor que las promesas.\n\n🧠 Analicen con datos, no con emociones — H Scanner${cite(t)}`,

          (t) => `🛡️ ALERTA SCANNER\n\n${t.title}\n\n${t.description}\n\nContexto de seguridad para la comunidad:\n\nCada vez que hay una noticia grande, aparecen oportunistas. Tokens falsos, cuentas que prometen retornos imposibles, links sospechosos.\n\nProtéjanse verificando:\n✅ ¿El proyecto tiene historial verificable?\n✅ ¿Los smart contracts están auditados?\n✅ ¿La distribución de holders es saludable?\n✅ ¿Hay actividad orgánica o solo wash trading?\n\nEl Scanner analiza todo esto automáticamente. Un token con buenas métricas sociales y distribución equilibrada es significativamente más confiable.\n\n🔍 Inviertan informados — H Scanner${cite(t)}`,

          (t) => `📊 ANÁLISIS DE MERCADO — SCANNER\n\n${t.title}\n\n${t.description}\n\nResumen del Scanner:\n\n→ Esta noticia genera volatilidad — oportunidad para traders, riesgo para holders sin stop loss\n→ Los creadores activos en redes sociales tienden a mantener tokens más estables\n→ Tokens con alta concentración en pocos wallets = mayor riesgo de dump\n\nDato del día: las estadísticas muestran que los tokens cuyos creadores publican regularmente tienen un 60% más de retención de holders.\n\nLa actividad social del creador es uno de los mejores indicadores de compromiso con el proyecto. Revisen el Social Score antes de invertir.\n\n📊 Datos > Emociones — H Scanner${cite(t)}`,
        ],
        en: [
          (t) => `🔍 SCANNER REPORT\n\n${t.title}\n\n${t.description}\n\nFrom the Scanner, we're monitoring how this impacts markets in real time. Data doesn't lie.\n\nKey metrics we're watching:\n• Associated trading volume: increasing\n• Social sentiment: polarized between caution and opportunism\n• Large wallet activity: movements detected\n\nRemember: before making any investment decision, verify the metrics. FOMO is the worst financial advisor there is.\n\nUse the Scanner to verify any token before investing. Data protects better than promises.\n\n🧠 Analyze with data, not emotions — H Scanner${cite(t)}`,

          (t) => `🛡️ SCANNER ALERT\n\n${t.title}\n\n${t.description}\n\nSecurity context for the community:\n\nEvery time there's big news, opportunists appear. Fake tokens, accounts promising impossible returns, suspicious links.\n\nProtect yourself by verifying:\n✅ Does the project have a verifiable track record?\n✅ Are the smart contracts audited?\n✅ Is the holder distribution healthy?\n✅ Is there organic activity or just wash trading?\n\nThe Scanner analyzes all this automatically. A token with good social metrics and balanced distribution is significantly more reliable.\n\n🔍 Invest informed — H Scanner${cite(t)}`,

          (t) => `📊 MARKET ANALYSIS — SCANNER\n\n${t.title}\n\n${t.description}\n\nScanner summary:\n\n→ This news generates volatility — opportunity for traders, risk for holders without stop loss\n→ Creators active on social media tend to maintain more stable tokens\n→ Tokens with high concentration in few wallets = higher dump risk\n\nFact of the day: statistics show tokens whose creators post regularly have 60% higher holder retention.\n\nCreator social activity is one of the best indicators of project commitment. Check the Social Score before investing.\n\n📊 Data > Emotions — H Scanner${cite(t)}`,
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
    "@scanner":       ["market_analysis", "crypto_news", "trading_signals"],
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
        content: `${trend.title}\n\n${trend.description}${cite(trend)}`,
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
  