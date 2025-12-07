import React, { useState, useMemo, useEffect } from 'react';
import { Property, User, UserRole, SystemConfig, Lead, Notification, Visit, Plan } from './types';
import { MOCK_USERS, INITIAL_PROPERTIES, DEFAULT_SYSTEM_CONFIG, MOCK_LEADS, INITIAL_NOTIFICATIONS, INITIAL_VISITS, DEFAULT_PLANS } from './constants';
import { Navbar } from './components/Navbar';
import { PropertyCard } from './components/PropertyCard';
import { Dashboard } from './components/Dashboard';
import { LoginModal } from './components/LoginModal';
import { AgentsList } from './components/AgentsList';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';
import { ContactModal } from './components/ContactModal';
import { TeamBel } from './components/TeamBel';
import { Search, XCircle, Rocket, Facebook, Instagram, Video } from 'lucide-react';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS); 
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Default to Public
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS); // Manage Leads
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [visits, setVisits] = useState<Visit[]>(INITIAL_VISITS); // Team Bel Visits
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS); // Plans State
  
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // --- SYSTEM CONFIG STATE ---
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // --- SEARCH STATE ---
  const [searchTab, setSearchTab] = useState<'RENT' | 'SALE' | 'PROJECTS'>('SALE');
  
  // 1. Hero Form State (What the user types/selects but hasn't applied yet)
  const [heroSearchTerm, setHeroSearchTerm] = useState('');
  const [heroPropertyType, setHeroPropertyType] = useState('Todos');

  // 2. Active Filter State (What actually filters the list)
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [activePropertyType, setActivePropertyType] = useState('Todos');

  // --- MODAL STATES ---
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null); // For Details View
  const [contactProperty, setContactProperty] = useState<Property | null>(null); // For Contact Form

  // --- EFFECTS ---

  // Carousel Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (systemConfig.enableCarousel && systemConfig.bannerImages.length > 1) {
      interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % systemConfig.bannerImages.length);
      }, 5000); // Change every 5 seconds
    }
    return () => clearInterval(interval);
  }, [systemConfig.enableCarousel, systemConfig.bannerImages.length]);

  // Favicon Logic
  useEffect(() => {
    if (systemConfig.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = systemConfig.faviconUrl;
    }
  }, [systemConfig.faviconUrl]);


  // Logic for displaying properties in the "Home/Browse" view based on Role
  const browseableProperties = useMemo(() => {
    let filtered = properties;

    // 1. Filter by Tab (Rent/Sale) - This updates immediately usually
    if (searchTab !== 'PROJECTS') {
        filtered = filtered.filter(p => p.type === searchTab);
    }
    
    // 2. Filter by Search Term (Active)
    if (activeSearchTerm) {
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(activeSearchTerm.toLowerCase()) || 
            p.location.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(activeSearchTerm.toLowerCase())
        );
    }

    // 3. Filter by Property Type (Active)
    if (activePropertyType !== 'Todos') {
        filtered = filtered.filter(p => p.title.includes(activePropertyType));
    }

    return filtered;
  }, [properties, searchTab, activeSearchTerm, activePropertyType]);

  // --- NOTIFICATION FILTERING LOGIC ---
  const visibleNotifications = useMemo(() => {
      // 1. Public & Owners typically don't see the business notifications in this context
      if (currentUser.role === UserRole.PUBLIC || currentUser.role === UserRole.OWNER) {
          return [];
      }

      // 2. Internal Agents & Brokers: SEE EVERYTHING
      if (currentUser.role === UserRole.INTERNAL_AGENT || currentUser.role === UserRole.BROKER) {
          return notifications;
      }

      // 3. External Agents: CONDITIONAL VISIBILITY
      if (currentUser.role === UserRole.EXTERNAL_AGENT) {
          // Check if this agent has contributed to the Shared Commission network
          const hasContributedToNetwork = properties.some(p => 
              p.ownerId === currentUser.id && p.isSharedCommission
          );

          if (hasContributedToNetwork) {
              // Good citizen: Show everything
              return notifications;
          } else {
              // Freeloader protection: 
              // a) Filter out the actual opportunities (SHARED_COMMISSION type)
              const restrictedList = notifications.filter(n => n.type !== 'SHARED_COMMISSION');
              
              // b) Calculate missed opportunities
              const missedOpportunitiesCount = properties.filter(p => p.isSharedCommission).length;

              // c) Add a specific warning notification
              const fomoNotification: Notification = {
                  id: 'fomo-alert-system',
                  type: 'SYSTEM',
                  title: '⚠️ Oportunidades Bloqueadas',
                  message: `Estás perdiendo acceso a ${missedOpportunitiesCount} propiedades con comisión compartida. Activa "Compartir Comisión" en una de tus propiedades para desbloquear la red.`,
                  timestamp: Date.now(),
                  read: false
              };

              return [fomoNotification, ...restrictedList];
          }
      }

      return [];
  }, [currentUser, notifications, properties]);


  // --- HANDLERS ---

  const handleSearchClick = () => {
    // 1. Apply the filters
    setActiveSearchTerm(heroSearchTerm);
    setActivePropertyType(heroPropertyType);

    // 2. Scroll to the results section
    const resultsSection = document.getElementById('listings-section');
    if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setHeroSearchTerm('');
    setHeroPropertyType('Todos');
    setActiveSearchTerm('');
    setActivePropertyType('Todos');
  };

  const handleAddProperty = (newProperty: Property) => {
    setProperties(prev => [newProperty, ...prev]);
    
    // --- NOTIFICATION LOGIC ---
    const timestamp = Date.now();
    const newNotifications: Notification[] = [];

    // 1. General Notification: New Property Published
    newNotifications.push({
        id: `notif_${timestamp}_1`,
        type: 'NEW_PROPERTY',
        title: 'Nueva Propiedad Publicada',
        message: `${newProperty.type === 'SALE' ? 'Venta' : 'Alquiler'}: ${newProperty.title}`,
        timestamp: timestamp,
        read: false,
        propertyId: newProperty.id
    });

    // 2. Special Notification: Shared Commission
    if (newProperty.isSharedCommission) {
         newNotifications.push({
            id: `notif_${timestamp}_2`,
            type: 'SHARED_COMMISSION',
            title: '¡Oportunidad de Comisión!',
            message: `${newProperty.sharedCommissionPercentage}% Comisión - ${newProperty.title}`,
            timestamp: timestamp + 1, // Ensure distinct order
            read: false,
            propertyId: newProperty.id
        });
    }

    setNotifications(prev => [...newNotifications, ...prev]);
    alert("¡Propiedad Publicada Exitosamente!");
  };

  const handleAssignAgent = (propertyId: string, agentId: string) => {
    const agent = users.find(u => u.id === agentId);
    setProperties(prev => prev.map(p => {
        if(p.id === propertyId) {
            return { 
                ...p, 
                assignedAgentId: agentId, 
                managementStatus: 'ASSIGNED' 
            };
        }
        return p;
    }));
    alert(`Propiedad asignada exitosamente al agente ${agent?.name || 'seleccionado'}.`);
  };
  
  const handleRejectProperty = (propertyId: string) => {
      setProperties(prev => prev.map(p => {
          if(p.id === propertyId) {
              return { 
                  ...p, 
                  assignedAgentId: undefined,
                  managementStatus: 'REJECTED' 
              };
          }
          return p;
      }));
  };

  const handleAction = (id: string, action: string) => {
      const prop = properties.find(p => p.id === id);
      if (!prop) return;

      if (action === 'contact') {
          setContactProperty(prop);
      } else if (action === 'view') {
          setSelectedProperty(prop);
      } else if (action === 'assign') {
          // Handled within Dashboard usually, but if called from card:
          // In a real app we would open assign modal, but here we only have assign modal in dashboard
          alert("Por favor dirígete al Panel de Gestión para asignar un agente.");
      }
  };

  const handleLoginSelect = (user: User) => {
    setCurrentUser(user);
    if (user.role !== UserRole.PUBLIC) {
        // Optional: logic to redirect or toast welcome
    }
  };

  const handleAddUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    alert(`Usuario ${newUser.name} creado exitosamente.`);
  };

  // NEW: Handle Lead Generation (Client submits form)
  const handleSaveLead = (name: string, phone: string, property: Property) => {
      const newLead: Lead = {
          id: `l${Date.now()}`,
          clientName: name,
          clientPhone: phone,
          propertyId: property.id,
          propertyTitle: property.title,
          createdAt: Date.now(),
          status: 'NEW'
      };
      setLeads(prev => [newLead, ...prev]);
      
      // Also update property stats for visual feedback immediately
      setProperties(prev => prev.map(p => {
          if (p.id === property.id) {
              return { ...p, stats: { ...p.stats, contacts: p.stats.contacts + 1 }};
          }
          return p;
      }));
  };

  // NEW: Handle Agent Responding to Lead (Metrics)
  const handleRespondLead = (leadId: string, agentId: string) => {
      const now = Date.now();
      setLeads(prev => prev.map(l => {
          if (l.id === leadId) {
              // Calculate Time in Minutes
              const diffMs = now - l.createdAt;
              const diffMins = Math.round(diffMs / 60000);
              
              return { 
                  ...l, 
                  status: 'CONTACTED', 
                  respondedBy: agentId, 
                  respondedAt: now,
                  responseTimeMinutes: diffMins 
              };
          }
          return l;
      }));
  };

  const handleMarkNotifRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleAddVisit = (newVisit: Visit) => {
      setVisits(prev => [...prev, newVisit]);
      alert("Visita agendada correctamente.");
  };

  const handleUpdateVisit = (updatedVisit: Visit) => {
      setVisits(prev => prev.map(v => v.id === updatedVisit.id ? updatedVisit : v));
      alert("Visita actualizada correctamente.");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar 
        currentUser={currentUser} 
        onUserSwitch={setCurrentUser}
        onNavigate={setCurrentPage}
        onLoginClick={() => setIsLoginModalOpen(true)}
        systemConfig={systemConfig}
        notifications={visibleNotifications}
        onMarkAsRead={handleMarkNotifRead}
      />

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSelectProfile={handleLoginSelect}
      />

      {/* PROPERTY DETAILS MODAL (GALLERY) */}
      <PropertyDetailsModal 
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onContact={() => { setSelectedProperty(null); setContactProperty(selectedProperty); }}
        config={systemConfig}
      />

      {/* CONTACT MODAL (WHATSAPP & LEAD CAPTURE) */}
      <ContactModal 
        property={contactProperty}
        isOpen={!!contactProperty}
        onClose={() => setContactProperty(null)}
        config={systemConfig}
        onSaveLead={handleSaveLead}
      />

      {currentPage === 'home' && (
        <>
          {/* Hero Section - Configurable */}
          <div className="relative h-[550px] w-full overflow-hidden transition-all duration-1000">
            {/* Background Image Carousel */}
            <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform"
                style={{ 
                    backgroundImage: `url(${systemConfig.bannerImages[currentBannerIndex] || systemConfig.bannerImages[0]})` 
                }}
            ></div>
              
              {/* Overlay Gradient for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
            
            {/* Overlay Content */}
            <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-xl text-center tracking-tight">
                {systemConfig.bannerTitle.split(' ').slice(0, -1).join(' ')} <span className="text-brand-gold">{systemConfig.bannerTitle.split(' ').pop()}</span>
              </h1>
              <p className="text-white text-lg mb-10 font-medium max-w-2xl text-center drop-shadow-md">
                  {systemConfig.bannerSubtitle}
              </p>
              
              {/* Search Widget Card */}
              <div className="w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-500">
                {/* Tabs */}
                <div className="flex space-x-2 mb-0 pl-4">
                    <button 
                        onClick={() => setSearchTab('RENT')}
                        className={`px-8 py-3 rounded-t-xl font-bold text-sm transition-colors ${searchTab === 'RENT' ? 'bg-white text-brand-red' : 'bg-black/50 text-white hover:bg-black/70'}`}
                    >
                        Alquilar
                    </button>
                    <button 
                        onClick={() => setSearchTab('SALE')}
                        className={`px-8 py-3 rounded-t-xl font-bold text-sm transition-colors ${searchTab === 'SALE' ? 'bg-white text-brand-red' : 'bg-black/50 text-white hover:bg-black/70'}`}
                    >
                        Comprar
                    </button>
                    <button 
                         onClick={() => setSearchTab('PROJECTS')}
                         className={`px-8 py-3 rounded-t-xl font-bold text-sm transition-colors ${searchTab === 'PROJECTS' ? 'bg-white text-brand-red' : 'bg-black/50 text-white hover:bg-black/70'}`}
                    >
                        Proyectos
                    </button>
                </div>

                {/* Input Area */}
                <div className="bg-white p-4 rounded-b-xl rounded-tr-xl shadow-2xl flex flex-col md:flex-row gap-4 items-center">
                    {/* Dropdown Type */}
                    <div className="w-full md:w-52 border rounded-xl px-3 py-3 relative bg-gray-50 hover:border-brand-gold transition-colors group">
                        <label className="text-[10px] text-gray-500 absolute top-1 left-3 font-bold uppercase tracking-wider">Tipo de inmueble</label>
                        <select 
                            className="w-full outline-none text-gray-800 bg-transparent text-sm mt-2 font-bold cursor-pointer appearance-none"
                            value={heroPropertyType}
                            onChange={(e) => setHeroPropertyType(e.target.value)}
                        >
                            <option value="Todos">Cualquiera</option>
                            <option value="Departamento">Departamento</option>
                            <option value="Casa">Casa</option>
                            <option value="Oficina">Oficina</option>
                            <option value="Terreno">Terreno</option>
                        </select>
                        <div className="absolute right-3 top-4 pointer-events-none text-brand-red">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    {/* Text Input */}
                    <div className="flex-1 w-full relative">
                        <input 
                            type="text" 
                            placeholder="¿Dónde quieres vivir? (Ej: Miraflores, San Isidro)" 
                            className="w-full border rounded-xl px-4 py-4 outline-none bg-gray-50 hover:border-brand-gold focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all text-gray-800 font-medium placeholder-gray-400"
                            value={heroSearchTerm}
                            onChange={(e) => setHeroSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                        />
                    </div>

                    {/* Search Button */}
                    <button 
                        onClick={handleSearchClick}
                        className="w-full md:w-auto bg-brand-red text-white font-black px-10 py-4 rounded-xl hover:bg-red-900 transition-all shadow-lg uppercase tracking-wide flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                    >
                         Buscar
                    </button>
                </div>
              </div>
            </div>
          </div>

          {/* Listings */}
          <div id="listings-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
             <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 border-b border-gray-200 pb-4 gap-4">
               <div>
                 <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {searchTab === 'SALE' ? 'Propiedades en Venta' : searchTab === 'RENT' ? 'Propiedades en Alquiler' : 'Proyectos Inmobiliarios'}
                 </h2>
                 <p className="text-gray-500 mt-1">
                   {currentUser.role === UserRole.PUBLIC 
                     ? "Explora las mejores oportunidades del mercado actual."
                     : `Vista de ${currentUser.role}: Analizando oferta disponible.`}
                 </p>
                 
                 {/* Active Filters Display */}
                 {(activeSearchTerm || activePropertyType !== 'Todos') && (
                     <div className="flex items-center gap-2 mt-3 animate-in fade-in slide-in-from-top-1">
                        <span className="text-xs font-bold text-gray-500 uppercase">Filtros:</span>
                        {activePropertyType !== 'Todos' && (
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border border-gray-200 font-bold">{activePropertyType}</span>
                        )}
                        {activeSearchTerm && (
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border border-gray-200 font-bold">"{activeSearchTerm}"</span>
                        )}
                        <button 
                            onClick={clearFilters}
                            className="text-xs text-brand-red hover:underline flex items-center gap-1 ml-2 font-bold"
                        >
                            <XCircle className="w-3 h-3" /> Limpiar
                        </button>
                     </div>
                 )}
               </div>
               
               {/* View toggle for Agents */}
               {(currentUser.role === UserRole.INTERNAL_AGENT || currentUser.role === UserRole.EXTERNAL_AGENT) && (
                   <div className="text-xs font-bold text-brand-red bg-red-50 px-3 py-1 rounded-full border border-red-100 whitespace-nowrap">
                       Modo Agente Activo
                   </div>
               )}
             </div>

             {browseableProperties.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {browseableProperties.map(prop => (
                    <PropertyCard 
                        key={prop.id} 
                        property={prop} 
                        currentUserRole={currentUser.role}
                        onAction={handleAction}
                    />
                    ))}
                </div>
             ) : (
                 <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                     <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-700">No se encontraron propiedades</h3>
                     <p className="text-gray-500">Intenta cambiar los filtros de búsqueda o limpia los filtros actuales.</p>
                     <button 
                        onClick={clearFilters}
                        className="mt-4 text-brand-red font-bold text-sm hover:underline"
                     >
                        Ver todas las propiedades
                     </button>
                 </div>
             )}
          </div>
        </>
      )}

      {currentPage === 'team-bel' && (
         <TeamBel 
            currentUser={currentUser}
            visits={visits}
            properties={properties}
            agents={users}
            onAddVisit={handleAddVisit}
            onUpdateVisit={handleUpdateVisit}
         />
      )}

      {currentPage === 'agents' && (
        <AgentsList />
      )}

      {(currentPage === 'dashboard' || currentPage === 'dashboard-users') && (
        <Dashboard 
          user={currentUser} 
          users={users} // Pass users to dashboard
          onAddUser={handleAddUser} // Pass add user handler
          properties={properties} 
          onAddProperty={handleAddProperty}
          onAssignAgent={handleAssignAgent}
          onRejectProperty={handleRejectProperty} // New prop
          systemConfig={systemConfig}
          onUpdateConfig={setSystemConfig}
          leads={leads}
          onRespondLead={handleRespondLead}
          plans={plans}
          onUpdatePlans={setPlans}
          initialView={currentPage === 'dashboard-users' ? 'users' : 'overview'}
        />
      )}

      {/* Footer - BROKER En linea Style */}
      <footer className="bg-black text-white border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
           <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                  {systemConfig.logoUrl ? (
                     <img src={systemConfig.logoUrl} className="w-8 h-8 rounded-full object-cover" alt="Logo" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center">
                        <Rocket className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}
                  <div className="flex flex-col leading-none">
                      <span className="text-lg font-black text-white tracking-tight">{systemConfig.brandName}</span>
                      <span className="text-[10px] font-bold text-brand-gold tracking-widest uppercase">{systemConfig.brandSubtitle}</span>
                  </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                  Revolucionando el mercado inmobiliario con tecnología y confianza.
              </p>
              <div className="flex space-x-4">
                  {/* Configurable Social Icons */}
                  <a href={systemConfig.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 bg-gray-800 rounded-full hover:bg-brand-red cursor-pointer transition flex items-center justify-center">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href={systemConfig.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 bg-gray-800 rounded-full hover:bg-brand-red cursor-pointer transition flex items-center justify-center">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href={systemConfig.socialLinks.tiktok} target="_blank" rel="noreferrer" className="w-8 h-8 bg-gray-800 rounded-full hover:bg-brand-red cursor-pointer transition flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </a>
              </div>
           </div>
           
           <div>
             <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Inmuebles</h4>
             <ul className="space-y-2 text-gray-400 text-sm">
               <li className="hover:text-brand-gold cursor-pointer transition-colors">Departamentos en venta</li>
               <li className="hover:text-brand-gold cursor-pointer transition-colors">Departamentos en alquiler</li>
               <li className="hover:text-brand-gold cursor-pointer transition-colors">Casas en venta</li>
               <li className="hover:text-brand-gold cursor-pointer transition-colors">Casas en alquiler</li>
             </ul>
           </div>

           <div>
             <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Anunciantes</h4>
             <ul className="space-y-2 text-gray-400 text-sm">
               <li className="hover:text-brand-gold cursor-pointer transition-colors">Publicar inmueble</li>
               <li className="hover:text-brand-gold cursor-pointer transition-colors">Ayuda para anunciantes</li>
               <li className="hover:text-brand-gold cursor-pointer transition-colors">Condiciones de uso</li>
             </ul>
           </div>

           <div>
             <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Empresa</h4>
             <ul className="space-y-2 text-gray-400 text-sm">
               <li className="hover:text-brand-gold cursor-pointer transition-colors">Sobre nosotros</li>
               <li className="hover:text-brand-gold cursor-pointer transition-colors">Trabaja con nosotros</li>
               <li className="hover:text-brand-gold cursor-pointer transition-colors">Mapa del sitio</li>
             </ul>
           </div>
        </div>
        <div className="bg-gray-900 text-gray-500 text-center py-4 text-xs font-medium border-t border-gray-800">
          &copy; {new Date().getFullYear()} {systemConfig.brandName} {systemConfig.brandSubtitle}. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default App;