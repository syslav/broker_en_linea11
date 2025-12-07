





import { Property, User, UserRole, SystemConfig, Lead, Notification, Visit, Plan } from './types';

// --- SYSTEM CONFIGURATION ---
export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  brandName: 'BROKER',
  brandSubtitle: 'En linea',
  logoUrl: '', // Empty means use default Rocket Icon
  faviconUrl: 'https://cdn-icons-png.flaticon.com/512/1356/1356479.png',
  
  bannerImages: [
    'https://images.unsplash.com/photo-1574950578143-a58c40efd323?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560518883-ce09059ee971?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop'
  ],
  enableCarousel: true,
  bannerTitle: 'Encuentra tu lugar ideal',
  bannerSubtitle: 'La red inmobiliaria más rápida y efectiva del país. Conecta con propietarios y agentes en segundos.',
  
  maxGalleryImages: 10, // Default max images

  centralWhatsAppNumber: '51999888777', // Default Broker Number
  leadHandlerAgentId: 'u3', // Default to Ana (Internal Agent)

  socialLinks: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    tiktok: 'https://tiktok.com'
  }
};

// --- DEFAULT PLANS ---
export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'p_basic',
    name: 'Plan Básico',
    price: 0,
    currency: 'USD',
    durationDays: 30,
    features: ['1 Propiedad', '5 Fotos Máximo', 'Visibilidad Estándar', 'Soporte Básico'],
    isRecommended: false,
    color: '#6B7280' // Gray
  },
  {
    id: 'p_pro',
    name: 'Plan Destacado',
    price: 49,
    currency: 'USD',
    durationDays: 60,
    features: ['Hasta 5 Propiedades', '15 Fotos por aviso', 'Etiqueta "Destacado"', 'Posición Superior en Búsquedas', 'Soporte Prioritario'],
    isRecommended: true,
    color: '#FFC40C' // Gold
  },
  {
    id: 'p_premium',
    name: 'Plan Broker Elite',
    price: 129,
    currency: 'USD',
    durationDays: 90,
    features: ['Propiedades Ilimitadas', 'Fotos Ilimitadas + Video', 'Máxima Visibilidad (Top)', 'Gestor de Cuenta Dedicado', 'Reportes de Mercado Semanales'],
    isRecommended: false,
    color: '#A51B0B' // Red
  }
];


// --- USERS GENERATION ---

const NAMES = [
  'Elena', 'Marcos', 'Sofia', 'Javier', 'Valentina', 'Diego', 'Camila', 'Andres', 
  'Lucia', 'Fernando', 'Isabella', 'Ricardo', 'Gabriela', 'Mateo', 'Daniela', 
  'Hugo', 'Mariana', 'Pablo', 'Victoria', 'Alejandro', 'Natalia', 'Sebastian'
];

const LASTNAMES = [
  'García', 'Rodriguez', 'Lopez', 'Martinez', 'Gonzales', 'Perez', 'Sanchez', 'Romero', 'Diaz', 'Torres',
  'Flores', 'Rivera', 'Gomez', 'Castillo', 'Jimenez', 'Reyes'
];

const AGENT_DESCRIPTIONS = [
  "Especialista en propiedades de lujo y zonas exclusivas de Lima Top.",
  "Enfocado en alquileres rápidos y gestión eficiente para propietarios ocupados.",
  "Experto en negociación y cierre de ventas complejas, garantizando el mejor precio.",
  "Apasionado por encontrar el hogar perfecto para familias en crecimiento.",
  "Con amplia experiencia en el sector comercial, oficinas y locales industriales.",
  "Dedicado a brindar un servicio personalizado 24/7 con reportes semanales.",
  "Estratega de precios y marketing inmobiliario digital.",
  "Asesoría integral legal y financiera para tu primera vivienda.",
  "Corredor con red de contactos exclusiva en embajadas y multinacionales."
];

// Generate Agents with optional forced role
const generateAgents = (count: number, startId: number, forceRole?: UserRole): User[] => {
  return Array.from({ length: count }, (_, i) => {
    // If forceRole is provided, use it. Otherwise random 50/50
    const isInternal = forceRole ? (forceRole === UserRole.INTERNAL_AGENT) : (Math.random() > 0.5);
    const role = forceRole || (isInternal ? UserRole.INTERNAL_AGENT : UserRole.EXTERNAL_AGENT);
    
    const name = `${NAMES[Math.floor(Math.random() * NAMES.length)]} ${LASTNAMES[Math.floor(Math.random() * LASTNAMES.length)]}`;
    
    // Motivation logic: Internal agents usually accept lower (salary base), External want higher
    const baseMotivation = role === UserRole.INTERNAL_AGENT ? 1.5 : 2.5; 
    const motivationThreshold = Number((baseMotivation + Math.random() * 3.0).toFixed(1)); // 1.5% to ~5.5%

    return {
      id: `u${startId + i}`,
      name: `${name}`,
      role: role,
      avatar: `https://i.pravatar.cc/300?img=${(startId + i) % 70}`, // Better avatars
      motivationThreshold,
      experience: `${Math.floor(Math.random() * 15) + 1} años`,
      about: AGENT_DESCRIPTIONS[Math.floor(Math.random() * AGENT_DESCRIPTIONS.length)],
      phoneNumber: `519${Math.floor(Math.random() * 90000000 + 10000000)}`,
      dealStats: {
        rented: Math.floor(Math.random() * 50),
        sold: Math.floor(Math.random() * 20)
      }
    };
  });
};

const STATIC_USERS: User[] = [
  { id: 'u1', name: 'Usuario Invitado', role: UserRole.PUBLIC, avatar: 'https://i.pravatar.cc/300?img=60' },
  { id: 'u2', name: 'Carlos (Propietario)', role: UserRole.OWNER, avatar: 'https://i.pravatar.cc/300?img=11', phoneNumber: '51999888777' },
  { id: 'u3', name: 'Ana (Agente Interno)', role: UserRole.INTERNAL_AGENT, avatar: 'https://i.pravatar.cc/300?img=5', motivationThreshold: 2.0, experience: '5 años', about: 'Especialista en Miraflores y San Isidro.', phoneNumber: '51988777666', dealStats: {rented: 45, sold: 12} },
  { id: 'u4', name: 'Luis (Agente Externo)', role: UserRole.EXTERNAL_AGENT, avatar: 'https://i.pravatar.cc/300?img=3', motivationThreshold: 3.5, experience: '10 años', about: 'Corredor independiente top seller con cartera exclusiva.', phoneNumber: '51977666555', dealStats: {rented: 5, sold: 25} },
  { id: 'u5', name: 'Master Broker', role: UserRole.BROKER, avatar: 'https://i.pravatar.cc/300?img=8' },
];

// 1. Generate 10 Random Mixed Agents (Internal/External)
const MIXED_AGENTS = generateAgents(10, 6); // IDs u6 to u15

// 2. Generate 10 SPECIFIC EXTERNAL AGENTS (to go at the end per request)
const EXTERNAL_AGENTS_BATCH = generateAgents(10, 16, UserRole.EXTERNAL_AGENT); // IDs u16 to u25

// Combine all
export const MOCK_USERS: User[] = [
  ...STATIC_USERS,
  ...MIXED_AGENTS,
  ...EXTERNAL_AGENTS_BATCH
];


// --- PROPERTIES GENERATION ---

export const LIMA_DISTRICTS = [
    'Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos', 
    'Cieneguilla', 'Comas', 'El Agustino', 'Independencia', 'Jesús María', 'La Molina', 
    'La Victoria', 'Lima', 'Lince', 'Los Olivos', 'Lurigancho', 'Lurín', 'Magdalena del Mar', 
    'Miraflores', 'Pachacámac', 'Pucusana', 'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa', 
    'Punta Negra', 'Rímac', 'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho', 
    'San Juan de Miraflores', 'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita', 
    'Santa María del Mar', 'Santa Rosa', 'Santiago de Surco', 'Surquillo', 'Villa El Salvador', 
    'Villa María del Triunfo'
];

const PROP_TYPES = ['Departamento', 'Casa', 'Oficina', 'Terreno'];
const ADJECTIVES = ['Moderno', 'Exclusivo', 'Acogedor', 'Amplio', 'Lujoso', 'Económico', 'Iluminado', 'Remodelado', 'Estreno', 'Minimalista'];
const FEATURES = ['con vista al mar', 'frente a parque', 'con piscina', 'cerca al centro financiero', 'con terraza', 'pet friendly', 'con cochera doble', 'en zona tranquila'];

// Función generadora para crear 50 propiedades realistas
const generateProperties = (count: number): Property[] => {
  return Array.from({ length: count }, (_, i) => {
    const isSale = Math.random() > 0.4; // 60% sale, 40% rent
    const propType = PROP_TYPES[Math.floor(Math.random() * PROP_TYPES.length)];
    const district = LIMA_DISTRICTS[Math.floor(Math.random() * LIMA_DISTRICTS.length)];
    const location = `${district}, Lima`;
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const feat = FEATURES[Math.floor(Math.random() * FEATURES.length)];
    
    // Select random owner from valid users (Owner or Agents)
    const validOwners = MOCK_USERS.filter(u => u.role === UserRole.OWNER || u.role === UserRole.INTERNAL_AGENT || u.role === UserRole.EXTERNAL_AGENT);
    const owner = validOwners[Math.floor(Math.random() * validOwners.length)];
    
    // Lógica de Precios
    let price;
    if (isSale) {
       // Venta: entre 80k y 1M, terrenos mas baratos a veces
       price = propType === 'Terreno' ? 150000 + Math.random() * 500000 : 80000 + Math.random() * 900000;
    } else {
       // Alquiler: entre 500 y 3500
       price = 500 + Math.random() * 3000;
    }
    price = Math.floor(price / 100) * 100; // Redondear

    // Lógica de Roles y Banderas
    // ALTA PROBABILIDAD de necesitar apoyo (para que el Broker tenga que asignar)
    const isAgentSupport = owner.role === UserRole.OWNER ? (Math.random() > 0.3) : false; // 70% chance owner needs help
    
    // Agentes a veces comparten comisión
    const isSharedCommission = (owner.role === UserRole.INTERNAL_AGENT || owner.role === UserRole.EXTERNAL_AGENT) && Math.random() > 0.4;

    // Título dinámico
    const title = `${propType} ${adj} en ${district}`;
    
    const mainImage = `https://picsum.photos/800/600?random=${i + 100}`;
    
    // Generate gallery images (between 3 and 8 extra images)
    const numImages = Math.floor(Math.random() * 5) + 3;
    const images = [mainImage, ...Array.from({length: numImages}, (_, j) => `https://picsum.photos/800/600?random=${i + 100 + j + 1}`)];
    
    // Add fake video url to 20% of properties
    const videoUrl = Math.random() > 0.8 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : undefined;

    // Pet Policy
    const rand = Math.random();
    let petsPolicy: 'NO_PETS' | 'SMALL_PETS' | 'LARGE_PETS' = 'NO_PETS';
    if (rand > 0.6) petsPolicy = 'SMALL_PETS';
    if (rand > 0.9) petsPolicy = 'LARGE_PETS';

    return {
      id: `prop_${i + 1}`,
      title: title,
      description: `Oportunidad única: ${title.toLowerCase()} ${feat}. Ideal para vivir o invertir. Ubicado en una zona estratégica de ${district}. Cuenta con acabados de primera y excelente distribución.`,
      price,
      currency: 'USD',
      location,
      district,
      type: isSale ? 'SALE' : 'RENT',
      imageUrl: mainImage,
      images: images,
      videoUrl: videoUrl,
      petsPolicy,
      bedrooms: (propType === 'Oficina' || propType === 'Terreno') ? 0 : Math.floor(Math.random() * 4) + 1,
      bathrooms: (propType === 'Terreno') ? 0 : Math.floor(Math.random() * 3) + 1,
      area: Math.floor(60 + Math.random() * 300),
      ownerId: owner.id,
      ownerName: owner.name,
      ownerPhone: owner.phoneNumber || '51999888777', // Default phone if missing
      
      // Flags
      isAgentSupport,
      agentSupportPercentage: isAgentSupport ? Math.floor(3 + Math.random() * 3) : undefined,
      isSharedCommission,
      sharedCommissionPercentage: isSharedCommission ? Math.floor(20 + Math.random() * 30) : undefined,
      // Si necesita apoyo, dejarlo SIN ASIGNAR el 80% de las veces para que el Broker lo haga
      assignedAgentId: isAgentSupport && Math.random() > 0.8 ? 'u3' : undefined, 
      
      stats: {
        views: Math.floor(Math.random() * 5000),
        searchAppearances: Math.floor(Math.random() * 15000),
        contacts: Math.floor(Math.random() * 50)
      }
    };
  });
};

export const INITIAL_PROPERTIES: Property[] = generateProperties(50);

// --- MOCK LEADS GENERATION ---

const CLIENT_NAMES = [
    'Roberto Gomez', 'Maria Fernanda', 'Juan Carlos', 'Diana Torres', 'Pedro Castillo', 
    'Lucia Mendes', 'Carlos Vives', 'Patricia Llosa', 'Jorge Chavez', 'Andrea Legarreta',
    'Miguel Grau', 'Sarita Colonia', 'Eva Ayllon', 'Gian Marco', 'Susana Baca'
];

const generateMockLeads = (count: number): Lead[] => {
    const internalAgents = MOCK_USERS.filter(u => u.role === UserRole.INTERNAL_AGENT);
    
    return Array.from({ length: count }, (_, i) => {
        const prop = INITIAL_PROPERTIES[Math.floor(Math.random() * INITIAL_PROPERTIES.length)];
        const isContacted = Math.random() > 0.2; // 80% contacted history, 20% new
        const daysAgo = Math.floor(Math.random() * 30); // Last 30 days
        const createdAt = Date.now() - (daysAgo * 24 * 60 * 60 * 1000) - Math.floor(Math.random() * 1000000);
        
        let lead: Lead = {
            id: `l${i + 100}`,
            clientName: CLIENT_NAMES[Math.floor(Math.random() * CLIENT_NAMES.length)],
            clientPhone: `519${Math.floor(Math.random() * 90000000 + 10000000)}`,
            propertyId: prop.id,
            propertyTitle: prop.title,
            createdAt: createdAt,
            status: 'NEW'
        };

        if (isContacted) {
            // Assign a random internal agent who "responded"
            const agent = internalAgents[Math.floor(Math.random() * internalAgents.length)];
            // Random response time between 1 minute and 4 hours (240 mins)
            const responseTimeMinutes = Math.floor(Math.random() * 120) + 2; 
            
            // Random Rating 3 to 5 stars
            const rating = Math.floor(Math.random() * 3) + 3;

            lead = {
                ...lead,
                status: 'CONTACTED',
                respondedBy: agent.id,
                respondedAt: createdAt + (responseTimeMinutes * 60 * 1000),
                responseTimeMinutes: responseTimeMinutes,
                rating: rating
            };
        }

        return lead;
    }).sort((a, b) => b.createdAt - a.createdAt); // Sort newest first
};

export const MOCK_LEADS: Lead[] = generateMockLeads(150);

// --- INITIAL NOTIFICATIONS ---
export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
      id: 'n1',
      type: 'SYSTEM',
      title: 'Bienvenido al Sistema',
      message: 'Explora las nuevas funcionalidades del panel de control.',
      timestamp: Date.now() - 3600000,
      read: false
  },
  {
      id: 'n2',
      type: 'SHARED_COMMISSION',
      title: 'Oportunidad de Negocio',
      message: 'Nueva propiedad en Miraflores ofrece 40% de comisión compartida.',
      timestamp: Date.now() - 86400000,
      read: true,
      propertyId: 'prop_1'
  }
];

// --- MOCK VISITS (For Team Bel) ---
const generateMockVisits = (count: number): Visit[] => {
    const internalAgents = MOCK_USERS.filter(u => u.role === UserRole.INTERNAL_AGENT);
    const today = new Date();
    // Normalize to start of week (Monday)
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    monday.setHours(0,0,0,0);

    return Array.from({length: count}, (_, i) => {
        const prop = INITIAL_PROPERTIES[Math.floor(Math.random() * INITIAL_PROPERTIES.length)];
        const agent = internalAgents[Math.floor(Math.random() * internalAgents.length)];
        
        // Random day in this week (0-6 days from Monday)
        const randomDayOffset = Math.floor(Math.random() * 7);
        // Random hour (9am to 6pm)
        const randomHour = 9 + Math.floor(Math.random() * 9);
        
        const visitDate = new Date(monday);
        visitDate.setDate(monday.getDate() + randomDayOffset);
        visitDate.setHours(randomHour, 0, 0, 0);

        return {
            id: `v${i+1}`,
            propertyId: prop.id,
            propertyTitle: prop.title,
            propertyImage: prop.imageUrl,
            propertyLocation: prop.location,
            agentId: agent.id,
            agentName: agent.name,
            agentAvatar: agent.avatar,
            clientName: CLIENT_NAMES[Math.floor(Math.random() * CLIENT_NAMES.length)],
            clientPhone: `519${Math.floor(Math.random() * 90000000 + 10000000)}`, // Generate mock phone
            date: visitDate.getTime(),
            status: Math.random() > 0.7 ? 'COMPLETED' : 'SCHEDULED',
            notes: Math.random() > 0.8 ? 'Cliente muy interesado, pidió planos.' : undefined
        };
    });
};

export const INITIAL_VISITS: Visit[] = generateMockVisits(12);
