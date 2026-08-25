import { Project, PhilosophyItem, ServiceItem, StatItem, FAQItem } from '../types';

export const PROJECTS_DATA: Project[] = [
  {
    id: 'zylo',
    title: 'zylo | high-performance website hosting & cloud platform',
    client: 'zylo hosting (founder)',
    company: 'zylo inc.',
    category: 'Web Hosting & Cloud Infrastructure',
    year: '2025',
    description: 'A next-generation web hosting and cloud deployment platform delivering 99.99% uptime, global edge caching, instant DNS propagation, and an ultra-intuitive developer dashboard.',
    summary: 'founded, engineered, and designed the full-stack web hosting architecture and customer management console for zylo. built with custom server telemetry, automated ssl provisioning, and seamless 1-click git deployments.',
    role: 'founder & lead architect',
    type: 'cloud web hosting & server infrastructure',
    tech: 'react, next.js, typescript, tailwind css, node.js, docker, edge cdn, figma',
    deliverables: ['Cloud Hosting Console', '1-Click Git Deployment Engine', 'DNS & Domain Manager', 'Server Health & CDN Telemetry'],
    problem: 'traditional web hosting providers are cluttered with confusing cPanels, hidden renewal fees, slow server provisioning, and fragmented domain management that frustrate creators and businesses alike.',
    decisions: 'i architected a streamlined, tactile hosting control center with real-time resource gauges (CPU/RAM/Bandwidth), automated zero-downtime deployment pipelines, and global multi-region edge routing.',
    impact: 'zylo successfully hosts and powers over 10,000 active websites globally with a 99.99% uptime track record and sub-180ms global Time-To-First-Byte (TTFB) response rates.',
    achievements: [
      {
        number: '99.99%',
        title: 'server uptime reliability',
        description: 'maintained rock-solid high availability with distributed multi-region failover and automated DDoS mitigation.'
      },
      {
        number: '< 180ms',
        title: 'global ttfb response time',
        description: 'optimized static asset distribution and edge caching across global POP datacenters for instantaneous web loading.'
      },
      {
        number: '10k+',
        title: 'active websites hosted',
        description: 'scaled the platform from initial prototype to empowering thousands of developers, agencies, and online businesses.'
      }
    ],
    screens: [
      { id: 'zylo-01', title: 'Hosting Control Hub', caption: 'Live cluster status, active server instances, and global CDN throughput', type: 'canvas' },
      { id: 'zylo-02', title: 'Telemetry & CDN Flow', caption: 'Real-time CPU/RAM utilization, request rates, and edge latency monitors', type: 'analytics' },
      { id: 'zylo-03', title: 'DNS & Domain Manager', caption: 'Instant record routing, automated SSL provisioning, and wildcard alias config', type: 'console' },
      { id: 'zylo-04', title: 'High-Speed Edge Shield', caption: 'Global edge node status, smart caching policies, and DDoS protection layer', type: 'darkmode' },
      { id: 'zylo-05', title: '1-Click Deploy & Webhooks', caption: 'Instant Git repository webhooks, build logs, and automated rollback points', type: 'hub' }
    ],
    metrics: [
      { label: 'Uptime SLA', value: '99.99%' },
      { label: 'Global TTFB', value: '< 180ms' },
      { label: 'Active Sites', value: '10,000+' }
    ],
    imageType: 'zylo',
    imageUrl: '/zylo.png',
    liveUrl: 'https://zylo.ai',
    accentColor: '#6366f1',
    nextProjectId: 'trufin',
    nextProjectTitle: 'trufin | financial institution & pinjol verification platform'
  },
  {
    id: 'trufin',
    title: 'trufin | financial institution & pinjol verification platform',
    client: 'trufin verification',
    company: 'trufin verification',
    category: 'Fintech Security & Institution Verification',
    year: '2025',
    description: 'A comprehensive public intelligence platform to verify the authenticity, official regulatory licensing, and risk status of financial institutions, fintech lenders (pinjol), and investment entities.',
    summary: 'designed and developed the official financial verification portal and fraud detection engine. empowers everyday consumers and institutions to instantly verify legal vs illegal loan apps and suspicious financial entities.',
    role: 'lead product designer & frontend engineer',
    type: 'fintech security & verification web platform',
    tech: 'react, typescript, tailwind css, rest api, search indexer, figma',
    deliverables: ['Institution Verification Engine', 'Pinjol & Fintech Checker', 'Official License Radar', 'Community Fraud Reporting Hub'],
    problem: 'the surge of illegal lending apps (pinjol ilegal) and predatory financial scams that forge official licenses and mislead consumers without a fast, authoritative, and easy-to-use public verification tool.',
    decisions: 'i designed an instant search lookup matching regulatory registries, high-contrast visual safety indicators (Verified Legal vs Dangerous/Illegal), and clear guidance on legal compliance standards.',
    impact: 'trufin indexed and cross-verified thousands of financial entities, flagged over 50,000 fraudulent links/apps, and provided hundreds of thousands of users with immediate financial safety clarity.',
    achievements: [
      {
        number: '100%',
        title: 'verified regulatory registry',
        description: 'connected authoritative financial registries and database audits for instantaneous legality confirmation.'
      },
      {
        number: '< 0.2s',
        title: 'instant verification lookup',
        description: 'engineered an ultra-fast fuzzy search engine querying license numbers, app names, and corporate identities.'
      },
      {
        number: '50k+',
        title: 'scam & illegal entities flagged',
        description: 'protected users by cataloging unverified pinjol clones, phishing websites, and unauthorized brokerages.'
      }
    ],
    screens: [
      { id: 'trufin-01', title: 'Institution Verification Hub', caption: 'Instant name/license search, official regulatory badge, and risk tier indicator', type: 'terminal' },
      { id: 'trufin-02', title: 'Fintech & Pinjol Radar', caption: 'Direct comparison of licensed fintech versus unauthorized high-risk entities', type: 'chart' },
      { id: 'trufin-03', title: 'License Authenticity Inspector', caption: 'Detailed license certificate audit, valid company address, and regulator status', type: 'multisig' },
      { id: 'trufin-04', title: 'Mobile Quick Checker', caption: 'Lightweight mobile web checker with instant QR & APK package validation', type: 'mobile' },
      { id: 'trufin-05', title: 'Fraud Telemetry & Blacklist', caption: 'Community-driven scam warnings, blacklist feeds, and suspicious pattern alerts', type: 'risk' }
    ],
    metrics: [
      { label: 'Database Accuracy', value: '100%' },
      { label: 'Search Speed', value: '< 0.2s' },
      { label: 'Flagged Entities', value: '50k+' }
    ],
    imageType: 'trufin',
    imageUrl: '/trufin.png',
    liveUrl: 'https://trufin.io',
    accentColor: '#10b981',
    nextProjectId: 'krigstudio',
    nextProjectTitle: 'krigstudio | digital invitation creator & event website builder'
  },
  {
    id: 'krigstudio',
    title: 'krigstudio | digital invitation creator & event website builder',
    client: 'krigstudio',
    company: 'krigstudio',
    category: 'Digital Invitation & Event Web Builder',
    year: '2024',
    description: 'An elegant, interactive digital invitation creator allowing couples and event planners to build bespoke wedding and celebration websites with seamless RSVP, digital gifts, and curated music.',
    summary: 'crafted the complete end-to-end digital invitation platform and design system. featuring customizable editorial layouts, real-time RSVP guestbook tracking, digital envelope transfers, and sensory background audio.',
    role: 'creator & lead frontend developer',
    type: 'digital invitation creator & event platform',
    tech: 'react, next.js, typescript, tailwind css, framer motion, web audio api, figma',
    deliverables: ['Digital Invitation Builder', 'Interactive RSVP & Wishes Hub', 'Digital Envelope & QR Transfer', 'Spatial Photo & Music Gallery'],
    problem: 'traditional paper invitations are costly, static, and difficult to manage, while standard digital invitation templates often feel generic, cluttered with ads, and uninspiring for special life moments.',
    decisions: 'i created an editorial, bespoke aesthetic with buttery 60fps scroll interactions, dynamic guest name personalization, live countdown timers, and integrated RSVP sync to WhatsApp and spreadsheet dashboards.',
    impact: 'krigstudio has delivered invitations for over 500 weddings and celebrations, maintaining a 95% RSVP confirmation rate and praised for its minimalist, memorable aesthetic.',
    achievements: [
      {
        number: '95%',
        title: 'rsvp response completion',
        description: 'streamlined digital confirmation flows enabling guests to respond and send personalized prayers in seconds.'
      },
      {
        number: '60fps',
        title: 'smooth animations & audio',
        description: 'engineered sensory background melodies and fluid photo book transitions optimized for mobile screens.'
      },
      {
        number: '500+',
        title: 'events & weddings powered',
        description: 'trusted by couples and event organizers to create lasting, beautiful first impressions for their guests.'
      }
    ],
    screens: [
      { id: 'krig-01', title: 'Interactive Invitation Canvas', caption: 'Custom cover reveal, animated couple story timeline, and live event countdown', type: 'hero3d' },
      { id: 'krig-02', title: 'Dynamic RSVP & Wishes Feed', caption: 'Instant attendance confirmation, guest wishes guestbook, and headcount tally', type: 'reel' },
      { id: 'krig-03', title: 'Editorial Theme Palette', caption: 'Minimalist typography layouts, luxury color palettes, and gallery sliders', type: 'grid' },
      { id: 'krig-04', title: 'Sensory Audio & Navigation', caption: 'Curated background music player paired with direct Google Maps route guidance', type: 'sound' },
      { id: 'krig-05', title: 'Digital Envelope & Gifts', caption: 'Bank transfer & e-wallet integration, QR payment generator, and gift registry', type: 'archive' }
    ],
    metrics: [
      { label: 'RSVP Rate', value: '95%' },
      { label: 'Frame Rate', value: '60 FPS' },
      { label: 'Events Hosted', value: '500+' }
    ],
    imageType: 'krigstudio',
    imageUrl: '/krigstudio.png',
    liveUrl: 'https://krigstudio.com',
    accentColor: '#09090b',
    nextProjectId: 'zylo',
    nextProjectTitle: 'zylo | high-performance website hosting & cloud platform'
  }
];

export const PRINCIPLES_LIST = [
  'say less, tell more',
  'simplicity is the hardest work',
  'every detail is an intention',
  'consistency builds trust',
  'haste ruins the beautiful'
];

export const PHILOSOPHY_DATA: PhilosophyItem[] = [
  {
    number: '01',
    title: 'aesthetics',
    headline: 'beauty comes not from adding, but from taking away. let only what is needed remain.',
    content: 'We often conflate ornamentation with quality. True visual clarity emerges when every non-essential component is removed until only the core intention shines. Form should not only follow function—it should elevate function into an effortless, quiet experience.'
  },
  {
    number: '02',
    title: 'entropy',
    headline: 'chaos is the default state. order requires deliberate architectural discipline.',
    content: 'Software and design systems naturally deteriorate over time if not held together by strong foundational axioms. By creating modular, mathematically harmonious structures, we preserve speed, consistency, and sanity for decades.'
  },
  {
    number: '03',
    title: 'rationality',
    headline: 'every pixel and line of code must justify its existence with purpose.',
    content: 'Subjective intuition sparks the creative hypothesis, but rigorous logic proves it. If an animation delays the user, it is discarded. If a visual element distracts from the message, it is stripped. Purpose is the ultimate aesthetic.'
  }
];

export const SERVICES_DATA: ServiceItem[] = [
  {
    number: '01',
    title: 'product & ui/ux design',
    category: 'Design & Strategy',
    description: 'Translating complex workflows into intuitive, human-centered interfaces with meticulous typographic hierarchy, spatial rhythm, and responsive layouts.',
    deliverables: ['Wireframing & User Flows', 'Figma Design Systems', 'Interactive Prototyping', 'Design Audits']
  },
  {
    number: '02',
    title: 'frontend engineering',
    category: 'Engineering',
    description: 'Building robust, blazingly fast client-side applications with React, TypeScript, and modern tooling. Clean, maintainable architecture engineered for longevity.',
    deliverables: ['React & Next.js Architecture', 'TypeScript Codebases', 'Tailwind & Motion UI', 'Performance Optimization']
  },
  {
    number: '03',
    title: 'design systems & tokenization',
    category: 'Systems & Scalability',
    description: 'Crafting modular, accessible component libraries that bridge design and engineering, allowing teams to build faster with mathematical consistency.',
    deliverables: ['Atomic Component Libraries', 'Design Tokens & Theming', 'Accessibility (WCAG)', 'Interactive Documentation']
  },
  {
    number: '04',
    title: 'digital brand identity & micro-interactions',
    category: 'Motion & Identity',
    description: 'Giving products an unmistakable personality through bespoke typography, expressive micro-animations, tactile feedback, and signature interaction design.',
    deliverables: ['Visual Identity Guidelines', 'Bespoke Iconography', 'Fluid Micro-animations', 'Interactive Polish']
  }
];

export const STATS_DATA: StatItem[] = [
  {
    number: '05',
    suffix: '+',
    label: 'years of craft',
    sublabel: 'designing & coding resilient digital interfaces'
  },
  {
    number: '30',
    suffix: '+',
    label: 'shipped releases',
    sublabel: 'from municipal portals to iot industrial platforms'
  },
  {
    number: '100',
    suffix: 'k+',
    label: 'active citizens & users',
    sublabel: 'interfacing with delivered software daily'
  },
  {
    number: '99',
    suffix: '.9%',
    label: 'performance score',
    sublabel: 'lightweight, accessible & zero bloat engineering'
  }
];

export const FAQ_DATA: FAQItem[] = [
  {
    number: '01',
    question: 'what is your typical workflow from concept to code?',
    answer: 'I start with rigorous discovery to dissect the core product requirements and constraints. From there, I prototype directly in high-fidelity Figma components, refine motion/typography, and translate designs into production-ready TypeScript/React code with mathematical layout consistency.',
    tags: ['workflow', 'process', 'engineering']
  },
  {
    number: '02',
    question: 'how do we collaborate and communicate during a project?',
    answer: 'Transparency and asynchronous clarity are foundational. We sync via Slack/Discord, share interactive Figma prototypes for early feedback, and deploy continuous preview staging links with every codebase milestone so you can test real-time progress.',
    tags: ['communication', 'remote', 'staging']
  },
  {
    number: '03',
    question: 'can you work on design-only or engineering-only scopes?',
    answer: 'Yes. While my core strength lies in bridging both worlds as a hybrid Design Engineer, I regularly take on standalone UI/UX system design contracts or step in as a senior frontend engineer for existing teams needing high-touch execution.',
    tags: ['scope', 'hybrid', 'flexibility']
  },
  {
    number: '04',
    question: 'what is your typical turnaround timeline for a project?',
    answer: 'A comprehensive product design sprint or MVP frontend usually spans 3 to 6 weeks depending on domain complexity. For enterprise design systems or full-stack platforms, engagements typically run 2 to 3 months with structured bi-weekly milestones.',
    tags: ['timeline', 'delivery', 'sprints']
  },
  {
    number: '05',
    question: 'do you provide post-launch support and handoff documentation?',
    answer: 'Every project concludes with comprehensive architectural documentation, design token guidelines, clean commit history, and a dedicated post-launch warranty period to guarantee seamless team handoff and zero downtime.',
    tags: ['handoff', 'docs', 'support']
  }
];

export const TRANSLATIONS = {
  id: {
    getInTouch: 'hubungi saya',
    menu: 'menu',
    lendAnEar: 'dengarkan suasana',
    playingAmbient: 'suara ambient aktif',
    heyIm: 'halo, saya',
    nameBracket: '[steward jason liuwindra]',
    introRole: 'saya mendesain, dan saya menulis kode. yang saya pedulikan adalah membuat yang rumit menjadi sederhana — dan yang sederhana menjadi bermakna.',
    quoteCenter: 'saya tidak terburu-buru. saya membiarkan setiap baris dan setiap ruang kosong seolah-olah akan bertahan selama bertahun-tahun.',
    myStory: 'cerita saya',
    principlesLabel: '[prinsip]',
    thoughtLabel: '[pemikiran]',
    thoughtIntro: 'sebuah antarmuka lahir bukan dari piksel, tetapi dari keputusan. saya melepaskan yang tidak perlu dan hanya menyisakan makna.',
    readHowIThink: 'baca cara saya berpikir',
    servicesLabel: '[layanan]',
    servicesIntro: 'dari desain antarmuka konseptual hingga rekayasa frontend berkinerja tinggi, saya membantu mengubah ide kompleks menjadi produk digital yang matang dan bermakna.',
    discussProject: 'diskusikan proyek',
    statsLabel: '[dampak & angka]',
    statsIntro: 'metrik dan pencapaian terukur selama bertahun-tahun merancang dan membangun arsitektur digital.',
    faqLabel: '[tanya jawab / faq]',
    faqIntro: 'jawaban lugas seputar proses kerja sama, alur pengembangan, dan standar kualitas.',
    buildHeading: 'mari bangun sesuatu yang bermakna',
    buildSub: 'pintu saya selalu terbuka. jika anda memiliki ide bagus atau masalah untuk diselesaikan, mari bicara.',
    contactLabel: '[kontak]',
    linksLabel: '[tautan]',
    connectLabel: '[terhubung]',
    home: 'beranda',
    aboutme: 'tentang saya',
    manifest: 'manifesto',
    projects: 'proyek',
    services: 'layanan',
    faq: 'faq',
    instagram: 'instagram',
    github: 'github',
    designedBy: 'designed by jason © 2026'
  },
  en: {
    getInTouch: 'get in touch',
    menu: 'menu',
    lendAnEar: 'lend an ear',
    playingAmbient: 'ambient sound playing',
    heyIm: "hey, i'm",
    nameBracket: '[steward jason liuwindra]',
    introRole: 'i design, and i write code. what i care about is making the complex simple — and the simple meaningful.',
    quoteCenter: "i don't rush. i leave every line and every empty space as if it will stay for years.",
    myStory: 'my story',
    principlesLabel: '[principles]',
    thoughtLabel: '[thought]',
    thoughtIntro: 'an interface is born not from pixels, but from decisions. i let go of the needless and leave only meaning behind.',
    readHowIThink: 'read how i think',
    servicesLabel: '[services]',
    servicesIntro: 'from conceptual interface design to high-performance frontend engineering, i help turn ambiguous ideas into polished digital products with purpose.',
    discussProject: 'discuss a project',
    statsLabel: '[impact & metrics]',
    statsIntro: 'measurable milestones across years of bridging design and software architecture.',
    faqLabel: '[faq / inquiries]',
    faqIntro: 'honest answers to frequent questions regarding collaboration, tooling, and execution.',
    buildHeading: "let's build something meaningful",
    buildSub: "my door is open. if you have a good idea or a problem to solve, let's talk.",
    contactLabel: '[contact]',
    linksLabel: '[links]',
    connectLabel: '[connect]',
    home: 'home',
    aboutme: 'aboutme',
    manifest: 'manifest',
    projects: 'projects',
    services: 'services',
    faq: 'faq',
    instagram: 'instagram',
    github: 'github',
    designedBy: 'designed by jason © 2026'
  },
  de: {
    getInTouch: 'kontakt aufnehmen',
    menu: 'menü',
    lendAnEar: 'hintergrundsound',
    playingAmbient: 'ambient-sound aktiv',
    heyIm: 'hallo, ich bin',
    nameBracket: '[steward jason liuwindra]',
    introRole: 'ich gestalte und schreibe code. mir geht es darum, komplexes einfach zu machen – und einfaches bedeutungsvoll.',
    quoteCenter: 'ich überstürze nichts. ich setze jede linie und jeden freiraum so, als bliebe er über jahre bestehen.',
    myStory: 'meine geschichte',
    principlesLabel: '[prinzipien]',
    thoughtLabel: '[gedanken]',
    thoughtIntro: 'ein interface entsteht nicht aus pixelraster, sondern aus entscheidungen. ich reduziere das unnötige und lasse nur das wesentliche.',
    readHowIThink: 'meine denkweise lesen',
    servicesLabel: '[leistungen]',
    servicesIntro: 'von konzeptionellem interface-design bis hin zu hochperformantem frontend-engineering – ich verwandle vage ideen in ausgereifte digitale produkte.',
    discussProject: 'projekt besprechen',
    statsLabel: '[wirkung & kennzahlen]',
    statsIntro: 'messbare meilensteine aus jahren der verbindung von design und software-architektur.',
    faqLabel: '[faq / fragen]',
    faqIntro: 'ehrliche antworten zu zusammenarbeit, werkzeugen und umsetzung.',
    buildHeading: 'lassen sie uns etwas bedeutsames bauen',
    buildSub: 'meine tür steht offen. wenn sie eine gute idee oder ein problem zu lösen haben, lassen sie uns sprechen.',
    contactLabel: '[kontakt]',
    linksLabel: '[links]',
    connectLabel: '[verbinden]',
    home: 'startseite',
    aboutme: 'über mich',
    manifest: 'manifest',
    projects: 'projekte',
    services: 'leistungen',
    faq: 'faq',
    instagram: 'instagram',
    github: 'github',
    designedBy: 'designed by jason © 2026'
  },
  ja: {
    getInTouch: 'お問い合わせ',
    menu: 'メニュー',
    lendAnEar: '環境音を聴く',
    playingAmbient: '環境音を再生中',
    heyIm: 'こんにちは、',
    nameBracket: '[steward jason liuwindra]',
    introRole: '私はデザインし、コードを書きます。複雑なものをシンプルにし、シンプルなものに意味を持たせることを大切にしています。',
    quoteCenter: '決して急ぎません。すべての線とすべての余白を、何年も残り続けるかのように刻みます。',
    myStory: '自己紹介',
    principlesLabel: '[原則]',
    thoughtLabel: '[思考]',
    thoughtIntro: 'インターフェースはピクセルからではなく、決断から生まれます。不要なものを削ぎ落とし、本質的な意味だけを残します。',
    readHowIThink: '思考のプロセスを読む',
    servicesLabel: '[サービス]',
    servicesIntro: '概念的なUI/UX設計から高性能なフロントエンド開発まで、曖昧なアイデアを目的を持ったデジタルプロダクトへ昇華させます。',
    discussProject: 'プロジェクトを相談する',
    statsLabel: '[実績と指標]',
    statsIntro: 'デザインとソフトウェア設計の架け橋として積み重ねてきた確かなマイルストーン。',
    faqLabel: '[よくある質問]',
    faqIntro: 'コラボレーション体制、使用ツール、納期に関する実践的な回答。',
    buildHeading: '意義のあるものを共に創りましょう',
    buildSub: 'いつでもお気軽にご相談ください。優れたアイデアや解決したい課題があれば、ぜひお話ししましょう。',
    contactLabel: '[連絡先]',
    linksLabel: '[リンク]',
    connectLabel: '[ソーシャル]',
    home: 'ホーム',
    aboutme: 'プロフィール',
    manifest: 'マニフェスト',
    projects: 'プロジェクト',
    services: 'サービス',
    faq: 'よくある質問',
    instagram: 'instagram',
    github: 'github',
    designedBy: 'designed by jason © 2026'
  }
};

