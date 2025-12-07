
import React, { useState, useMemo, useEffect } from 'react';
import { User, Property, UserRole, SystemConfig, Lead, Plan } from '../types';
import { AnalyticsCharts } from './Charts';
import { PropertyForm } from './PropertyForm';
import { SystemConfigForm } from './SystemConfigForm'; // Import Config Form
import { PlanManagement } from './PlanManagement'; // Import Plan Management
import { PricingPlans } from './PricingPlans'; // Import Pricing View
import { UserManagement } from './UserManagement'; // Import User Management
import { 
  Plus, LayoutDashboard, Building2, UserPlus, X, Search, 
  TrendingUp, DollarSign, Users, Activity, PieChart as PieChartIcon, 
  Wallet, ArrowUpRight, BarChart3, Settings, MessageSquare, Download,
  Clock, Timer, UserCheck, Handshake, Globe, MapPin, Percent, CreditCard, UserCog, Ban, ChevronRight, Filter, Star, ThumbsUp, Award, Zap, Trophy, SlidersHorizontal, RefreshCcw, User as UserIcon, Rocket, Check
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar 
} from 'recharts';

interface DashboardProps {
  user: User;
  users: User[]; // All users
  onAddUser: (u: User) => void;
  properties: Property[];
  onAddProperty: (p: Property) => void;
  onAssignAgent: (propertyId: string, agentId: string) => void;
  onRejectProperty?: (propertyId: string) => void; // New for rejection
  systemConfig: SystemConfig; // Receive Config
  onUpdateConfig: (config: SystemConfig) => void; // Update Config Handler
  leads: Lead[];
  onRespondLead: (leadId: string, agentId: string) => void;
  plans: Plan[];
  onUpdatePlans: (plans: Plan[]) => void;
  initialView?: 'overview' | 'create' | 'config' | 'leads' | 'shared-network' | 'plans' | 'select-plan' | 'users' | 'properties-full' | 'reputation';
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    user, users, onAddUser, properties, onAddProperty, onAssignAgent, onRejectProperty, 
    systemConfig, onUpdateConfig, leads, onRespondLead, plans, onUpdatePlans, initialView = 'overview' 
}) => {
  const [view, setView] = useState(initialView);
  
  // State for Agent Assignment Modal
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  
  // New State for "Action" Modal (Assign or Reject)
  const [isActionModalOpen, setActionModalOpen] = useState(false);

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [agentSearchTerm, setAgentSearchTerm] = useState('');

  // State for Commission Edit Modal
  const [editingCommissionProp, setEditingCommissionProp] = useState<Property | null>(null);
  const [commissionValue, setCommissionValue] = useState<number>(0);
  const [isCommissionActive, setIsCommissionActive] = useState(false);

  // State for Leads Filter
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterAgentId, setFilterAgentId] = useState(''); // Filtro por Agente (Propiedad Asignada)

  // --- STATES FOR PROPERTY PORTFOLIO FILTERS ---
  const [portfolioFilters, setPortfolioFilters] = useState({
      agentId: '',
      district: '',
      type: '' // 'SALE' | 'RENT'
  });

  // Roles Logic
  const isBroker = user.role === UserRole.BROKER;
  const isInternalAgent = user.role === UserRole.INTERNAL_AGENT;
  const isExternalAgent = user.role === UserRole.EXTERNAL_AGENT;
  
  // "Manager" Level Access (Broker OR Internal Agent)
  // Internal Agents now see exactly what Broker sees (Dashboard metrics, lists)
  const isManager = isBroker || isInternalAgent; 

  // Can view Shared Network
  const canAccessSharedNetwork = isManager || isExternalAgent;

  // --- DATA PROCESSING ---

  // Filter properties based on what this user should see
  const getMyProperties = () => {
    if (isManager) return properties; // Broker & Internal Agents see ALL properties
    return properties.filter(p => p.ownerId === user.id);
  };

  const myProperties = getMyProperties();

  // Shared Network Properties
  const sharedProperties = useMemo(() => {
    return properties.filter(p => p.isSharedCommission);
  }, [properties]);

  // NEW: Company Portfolio (Cartera de Inmuebles)
  // Logic: Broker listings + Internal Agent listings + Owners who requested Support
  const portfolioProperties = useMemo(() => {
    if (!isManager) return [];
    return properties.filter(p => {
        const owner = users.find(u => u.id === p.ownerId);
        
        // 1. Published by Master Broker
        if (owner?.role === UserRole.BROKER) return true;
        
        // 2. Published by Internal Agents (Team Inventory)
        if (owner?.role === UserRole.INTERNAL_AGENT) return true;
        
        // 3. Published by Owner with Support Request (Captacion)
        // isAgentSupport is explicitly for Owners asking for help
        if (p.isAgentSupport) return true; 
        
        return false;
    });
  }, [properties, users, isManager]);

  // --- FILTERED PORTFOLIO LOGIC ---
  const filteredPortfolio = useMemo(() => {
      let data = isManager ? portfolioProperties : myProperties;

      // Filter by Agent (Publisher)
      if (portfolioFilters.agentId) {
          data = data.filter(p => p.ownerId === portfolioFilters.agentId);
      }

      // Filter by District
      if (portfolioFilters.district) {
          data = data.filter(p => p.district === portfolioFilters.district);
      }

      // Filter by Type (Sale/Rent)
      if (portfolioFilters.type) {
          data = data.filter(p => p.type === portfolioFilters.type);
      }

      return data;
  }, [isManager, portfolioProperties, myProperties, portfolioFilters]);

  // Get unique districts from current portfolio for the filter dropdown
  const availableDistricts = useMemo(() => {
      const source = isManager ? portfolioProperties : myProperties;
      const districts = new Set(source.map(p => p.district).filter(Boolean));
      return Array.from(districts).sort();
  }, [isManager, portfolioProperties, myProperties]);


  // Filter Leads based on role
  const visibleLeads = useMemo(() => {
    let filtered = leads;

    // 1. Filter by Date Range (Fixed Timezones logic by appending time)
    if (startDate) {
        const start = new Date(`${startDate}T00:00:00`).getTime();
        filtered = filtered.filter(l => l.createdAt >= start);
    }
    if (endDate) {
        // Add full day ms to include the end date fully
        const end = new Date(`${endDate}T23:59:59`).getTime();
        filtered = filtered.filter(l => l.createdAt <= end);
    }

    // 2. Filter by Specific Agent (Agente de Turno / Asignado)
    if (filterAgentId) {
        filtered = filtered.filter(l => {
            const prop = properties.find(p => p.id === l.propertyId);
            // Mostrar leads de propiedades donde el agente es el ASIGNADO o el PROPIETARIO
            return prop?.assignedAgentId === filterAgentId || prop?.ownerId === filterAgentId;
        });
    }

    if (isManager) return filtered; // Broker & Internal Agents see ALL filtered leads

    // External Agent / Owner: usually don't see the central pool in this UI, but could see own property leads
    return filtered.filter(l => {
        const prop = properties.find(p => p.id === l.propertyId);
        return prop?.ownerId === user.id;
    });
  }, [leads, isManager, user.id, properties, startDate, endDate, filterAgentId]);

  // Lead Metrics
  const leadMetrics = useMemo(() => {
    const contactedLeads = visibleLeads.filter(l => l.status === 'CONTACTED');
    const totalResponseTime = contactedLeads.reduce((acc, curr) => acc + (curr.responseTimeMinutes || 0), 0);
    const avgResponseTime = contactedLeads.length > 0 ? Math.round(totalResponseTime / contactedLeads.length) : 0;
    
    // Average Rating Calculation
    const ratedLeads = contactedLeads.filter(l => l.rating);
    const totalRating = ratedLeads.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    const avgRating = ratedLeads.length > 0 ? (totalRating / ratedLeads.length).toFixed(1) : '4.8'; // Default high rating if empty

    // Group by Agent for Speed Ranking
    const agentPerformance: Record<string, { count: number, totalTime: number, name: string }> = {};
    
    leads.forEach(l => { // Use all leads for Broker to see global stats
        if (l.status === 'CONTACTED' && l.respondedBy) {
            if (!agentPerformance[l.respondedBy]) {
                const agent = users.find(u => u.id === l.respondedBy);
                agentPerformance[l.respondedBy] = { count: 0, totalTime: 0, name: agent?.name || 'Desconocido' };
            }
            agentPerformance[l.respondedBy].count++;
            agentPerformance[l.respondedBy].totalTime += (l.responseTimeMinutes || 0);
        }
    });

    const ranking = Object.values(agentPerformance)
        .map(a => ({ name: a.name, avgTime: Math.round(a.totalTime / a.count), count: a.count }))
        .sort((a, b) => a.avgTime - b.avgTime); // Ascending (Lower time is better)

    return { avgResponseTime, ranking, avgRating, ratedCount: ratedLeads.length };
  }, [visibleLeads, leads, users]);


  // --- BROKER/MANAGER SPECIFIC METRICS ---
  const brokerStats = useMemo(() => {
    if (!isManager) return null;

    // USE PORTFOLIO PROPERTIES FOR STATS, NOT ALL PROPERTIES
    const targetProps = portfolioProperties;

    const totalValueUSD = targetProps
        .filter(p => p.currency === 'USD' && p.type === 'SALE')
        .reduce((acc, curr) => acc + curr.price, 0);
    
    // Estimate Commission Potential (e.g., avg 3% for sales, 1 month for rent)
    const potentialCommission = (totalValueUSD * 0.03) + 
        targetProps.filter(p => p.type === 'RENT').reduce((acc, curr) => acc + (curr.price * 1), 0); // Approx logic

    const totalLeads = targetProps.reduce((acc, curr) => acc + curr.stats.contacts, 0);
    const totalViews = targetProps.reduce((acc, curr) => acc + curr.stats.views, 0);

    const saleCount = targetProps.filter(p => p.type === 'SALE').length;
    const rentCount = targetProps.filter(p => p.type === 'RENT').length;

    // Agent Performance Mockup (Top 5 based on mock stats)
    const topAgents = users
        .filter(u => u.role === UserRole.INTERNAL_AGENT || u.role === UserRole.EXTERNAL_AGENT)
        .sort((a, b) => ((b.dealStats?.sold || 0) + (b.dealStats?.rented || 0)) - ((a.dealStats?.sold || 0) + (a.dealStats?.rented || 0)))
        .slice(0, 5);

    // Calculate aggregated deals from agents (Simulated closed deals)
    const totalSoldDeals = users.reduce((acc, u) => acc + (u.dealStats?.sold || 0), 0);
    const totalRentedDeals = users.reduce((acc, u) => acc + (u.dealStats?.rented || 0), 0);

    return { totalValueUSD, potentialCommission, totalLeads, totalViews, saleCount, rentCount, topAgents, totalSoldDeals, totalRentedDeals };
  }, [properties, isManager, users, portfolioProperties]);

  // Data for Charts
  const pieData = [
    { name: 'Venta', value: brokerStats?.saleCount || 0 },
    { name: 'Alquiler', value: brokerStats?.rentCount || 0 },
  ];
  const COLORS = ['#A51B0B', '#FFC40C']; // Brand Colors

  // Mock Trend Data for Area Chart (mixing views and leads)
  const trendData = (portfolioProperties.length > 0 ? portfolioProperties : properties).slice(0, 10).map((p, i) => ({
    name: `Sem ${i+1}`,
    Vistas: p.stats.views,
    Leads: p.stats.contacts * 20 // scaling for visual
  }));

  // --- HANDLERS ---
  
  const handleOpenActionModal = (propertyId: string) => {
      setSelectedPropertyId(propertyId);
      setActionModalOpen(true);
  };

  const handleOpenAssignModal = () => {
      // Transition from Action Modal to Assign Modal
      setActionModalOpen(false);
      setAssignModalOpen(true);
      setAgentSearchTerm('');
  };

  const handleReject = () => {
      if (selectedPropertyId && onRejectProperty) {
          onRejectProperty(selectedPropertyId);
          setActionModalOpen(false);
          setSelectedPropertyId(null);
      }
  };

  const handleSelectAgent = (agentId: string) => {
      if (selectedPropertyId) {
          onAssignAgent(selectedPropertyId, agentId);
          setAssignModalOpen(false);
          setSelectedPropertyId(null);
      }
  };

  // Commission Edit Handlers
  const openCommissionEdit = (prop: Property) => {
    setEditingCommissionProp(prop);
    setIsCommissionActive(prop.isSharedCommission);
    setCommissionValue(prop.sharedCommissionPercentage || 25);
  };

  const saveCommissionEdit = () => {
     if (editingCommissionProp) {
        editingCommissionProp.isSharedCommission = isCommissionActive;
        editingCommissionProp.sharedCommissionPercentage = isCommissionActive ? commissionValue : undefined;
        setEditingCommissionProp(null);
        alert("Configuración de comisión actualizada.");
     }
  };

  const handleExportLeads = () => {
    // Generate CSV
    const headers = ["ID", "Cliente", "Telefono", "Propiedad", "Fecha Creacion", "Estado", "Atendido Por", "Tiempo Respuesta (min)"];
    const rows = visibleLeads.map(l => {
        const agent = users.find(u => u.id === l.respondedBy);
        return [
            l.id,
            l.clientName,
            l.clientPhone,
            l.propertyTitle,
            new Date(l.createdAt).toLocaleDateString() + ' ' + new Date(l.createdAt).toLocaleTimeString(),
            l.status,
            agent ? agent.name : '-',
            l.responseTimeMinutes || 0
        ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppClick = (lead: Lead) => {
      // 1. Record Response in App State
      onRespondLead(lead.id, user.id);

      // 2. Open WhatsApp
      const message = `Hola ${lead.clientName}, soy ${user.name} de ${systemConfig.brandName}. Vi tu interés en ${lead.propertyTitle}. ¿En qué puedo ayudarte?`;
      window.open(`https://wa.me/${lead.clientPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // New Property Publication Flow Handler
  const handleStartPublishing = () => {
      // Logic: If Owner or External Agent, they must see plans first.
      // If Broker or Internal Agent, skip to Create.
      if (user.role === UserRole.OWNER || user.role === UserRole.EXTERNAL_AGENT) {
          setView('select-plan');
      } else {
          setView('create');
      }
  };

  const handlePlanSelected = (plan: Plan) => {
      // Here you might want to save the selected plan ID to pass it to the form
      // For this demo, we just proceed to the form
      setView('create');
  };

  // --- RENDER ---

  if (view === 'create') {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
             <PropertyForm 
                userRole={user.role} 
                ownerId={user.id} 
                ownerName={user.name}
                users={users} // Pass users for assignment
                onSave={(p) => { onAddProperty(p); setView('overview'); }}
                onCancel={() => setView('overview')}
                systemConfig={systemConfig}
            />
        </div>
    );
  }

  if (view === 'select-plan') {
      return (
          <PricingPlans 
             plans={plans}
             onSelectPlan={handlePlanSelected}
             onCancel={() => setView('overview')}
          />
      );
  }

  if (view === 'config' && isBroker) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <SystemConfigForm 
          config={systemConfig}
          onSave={(c) => { onUpdateConfig(c); setView('overview'); }}
          onCancel={() => setView('overview')}
        />
      </div>
    );
  }

  if (view === 'users' && isBroker) {
      return (
          <UserManagement 
             users={users}
             onAddUser={onAddUser}
             onBack={() => setView('overview')}
          />
      );
  }

  if (view === 'plans' && isBroker) {
      return (
          <div className="max-w-7xl mx-auto py-8 px-4">
               <div className="flex justify-between items-center mb-6">
                   <button onClick={() => setView('overview')} className="text-gray-500 font-bold hover:underline">
                       &larr; Volver al Dashboard
                   </button>
               </div>
               <PlanManagement plans={plans} onUpdatePlans={onUpdatePlans} />
          </div>
      );
  }

  // --- VIEW: REPUTATION & METRICS (NEW) ---
  if (view === 'reputation' && isManager) {
      // Top performing properties
      const topProperties = [...portfolioProperties].sort((a, b) => b.stats.views - a.stats.views).slice(0, 5);
      
      const dealsData = [
          { name: 'Vendidas', value: brokerStats?.totalSoldDeals || 0 },
          { name: 'Alquiladas', value: brokerStats?.totalRentedDeals || 0 }
      ];

      return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Award className="w-8 h-8 text-brand-gold" /> Reputación y Métricas
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Análisis de desempeño del equipo, velocidad de atención y éxito comercial.</p>
                  </div>
                  <button onClick={() => setView('overview')} className="text-gray-500 hover:text-gray-700 font-bold text-sm bg-gray-100 px-4 py-2 rounded-lg">
                    &larr; Volver al Dashboard
                  </button>
              </div>

              {/* KPI CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                       <div className="absolute right-0 top-0 w-20 h-20 bg-blue-50 rounded-bl-full -mr-4 -mt-4"></div>
                       <div className="flex items-center gap-3 mb-2 relative z-10">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Zap className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-500 uppercase">Velocidad Promedio</span>
                       </div>
                       <h3 className="text-3xl font-black text-gray-900 mb-1">{leadMetrics.avgResponseTime} <span className="text-base font-normal text-gray-400">min</span></h3>
                       <p className="text-xs text-green-600 font-bold">Tiempo de respuesta a leads</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                       <div className="absolute right-0 top-0 w-20 h-20 bg-yellow-50 rounded-bl-full -mr-4 -mt-4"></div>
                       <div className="flex items-center gap-3 mb-2 relative z-10">
                            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700">
                                <Star className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-500 uppercase">Calidad de Servicio</span>
                       </div>
                       <h3 className="text-3xl font-black text-gray-900 mb-1">{leadMetrics.avgRating} <span className="text-base font-normal text-gray-400">/ 5.0</span></h3>
                       <p className="text-xs text-gray-500">Basado en {leadMetrics.ratedCount} calificaciones</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                       <div className="absolute right-0 top-0 w-20 h-20 bg-green-50 rounded-bl-full -mr-4 -mt-4"></div>
                       <div className="flex items-center gap-3 mb-2 relative z-10">
                            <div className="p-2 bg-green-100 rounded-lg text-green-700">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-gray-500 uppercase">Total Cierres</span>
                       </div>
                       <h3 className="text-3xl font-black text-gray-900 mb-1">{(brokerStats?.totalSoldDeals || 0) + (brokerStats?.totalRentedDeals || 0)}</h3>
                       <p className="text-xs text-gray-500">Propiedades Vendidas y Alquiladas (Histórico)</p>
                  </div>
              </div>

              {/* GRIDS & CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Top Properties List */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                      <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                          <h3 className="font-bold text-gray-800 flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-brand-red" /> Mejores Propiedades Publicadas
                          </h3>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-white text-gray-500 uppercase font-bold text-xs border-b border-gray-100">
                                  <tr>
                                      <th className="px-5 py-3">Propiedad</th>
                                      <th className="px-5 py-3 text-right">Vistas</th>
                                      <th className="px-5 py-3 text-right">Leads</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {topProperties.map((p, idx) => (
                                      <tr key={p.id} className="hover:bg-gray-50 transition">
                                          <td className="px-5 py-3 flex items-center gap-3">
                                              <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${idx < 3 ? 'bg-brand-gold text-black' : 'bg-gray-200 text-gray-600'}`}>
                                                  {idx + 1}
                                              </span>
                                              <div>
                                                  <div className="font-bold text-gray-800 truncate max-w-[200px]">{p.title}</div>
                                                  <div className="text-xs text-gray-500">{p.location}</div>
                                              </div>
                                          </td>
                                          <td className="px-5 py-3 text-right font-medium text-gray-600">{p.stats.views}</td>
                                          <td className="px-5 py-3 text-right font-bold text-brand-red">{p.stats.contacts}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>

                  {/* Deals Breakdown Chart */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-6">
                          <PieChartIcon className="w-5 h-5 text-blue-600" /> Distribución de Cierres (Ventas vs Alquileres)
                      </h3>
                      <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dealsData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#A51B0B" /> {/* Ventas: Red */}
                                    <Cell fill="#000000" /> {/* Alquileres: Black */}
                                </Pie>
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                            <div className="text-center">
                                <span className="block text-3xl font-black text-gray-800">
                                    {(brokerStats?.totalSoldDeals || 0) + (brokerStats?.totalRentedDeals || 0)}
                                </span>
                                <span className="text-xs text-gray-400 uppercase font-bold">Total</span>
                            </div>
                        </div>
                      </div>
                  </div>
                  
                  {/* Agent Speed Ranking */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 lg:col-span-2">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                          <Zap className="w-5 h-5 text-yellow-500" /> Ranking de Velocidad de Atención
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {leadMetrics.ranking.slice(0, 6).map((rank, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-brand-gold text-black shadow-sm' : 'bg-white border border-gray-200 text-gray-600'}`}>
                                          {idx + 1}
                                      </div>
                                      <span className="font-bold text-gray-700">{rank.name}</span>
                                  </div>
                                  <div className="text-right">
                                      <div className="text-sm font-black text-brand-red">{rank.avgTime} min</div>
                                      <div className="text-[10px] text-gray-400">Promedio</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

              </div>
          </div>
      );
  }

  // --- VIEW: SHARED NETWORK ---
  if (view === 'shared-network') {
      return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Globe className="w-8 h-8 text-brand-red" /> Red de Comisión Compartida
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Colabora con otros agentes y cierra tratos más rápido.</p>
                  </div>
                  <button onClick={() => setView('overview')} className="text-gray-500 hover:text-gray-700 font-bold text-sm bg-gray-100 px-4 py-2 rounded-lg">
                    &larr; Volver al Dashboard
                  </button>
              </div>
              
               {/* Grid of Shared Properties */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sharedProperties.length > 0 ? sharedProperties.map(prop => (
                      <div key={prop.id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-lg transition group">
                          <div className="relative h-48">
                              <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-brand-red font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1 text-sm">
                                  <Handshake className="w-4 h-4" /> {prop.sharedCommissionPercentage}%
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                  <p className="text-white font-bold text-lg leading-none">{prop.currency} {prop.price.toLocaleString()}</p>
                              </div>
                          </div>
                          <div className="p-5">
                              <h3 className="font-bold text-gray-800 line-clamp-1 mb-1">{prop.title}</h3>
                              <div className="flex items-center text-xs text-gray-500 mb-4">
                                  <MapPin className="w-3 h-3 mr-1" /> {prop.location}
                              </div>
                              <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3">
                                  <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                          {prop.ownerName.charAt(0)}
                                      </div>
                                      <div className="text-xs">
                                          <p className="font-bold text-gray-800">{prop.ownerName}</p>
                                          <p className="text-gray-400">Propietario</p>
                                      </div>
                                  </div>
                                  <button 
                                    onClick={() => window.open(`https://wa.me/${prop.ownerPhone}?text=Hola, vi tu propiedad compartida "${prop.title}" y tengo un cliente interesado.`, '_blank')}
                                    className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100 transition"
                                  >
                                      Contactar
                                  </button>
                              </div>
                          </div>
                      </div>
                  )) : (
                      <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                          <Handshake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-gray-500 font-medium">No hay propiedades compartidas en este momento.</h3>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  // --- VIEW: PROPERTIES FULL ---
  if (view === 'properties-full') {
      const displayProps = filteredPortfolio; // USE FILTERED LIST

      return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-8 h-8 text-brand-red" /> Cartera de Inmuebles
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Gestión integral del inventario.</p>
                  </div>
                  <button onClick={() => setView('overview')} className="text-gray-500 hover:text-gray-700 font-bold text-sm bg-gray-100 px-4 py-2 rounded-lg">
                    &larr; Volver al Dashboard
                  </button>
              </div>

              {/* --- FILTER BAR --- */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-500 font-bold text-sm uppercase mr-2">
                      <SlidersHorizontal className="w-4 h-4" /> Filtros:
                  </div>

                  {/* 1. AGENT FILTER (Only for Managers) */}
                  {isManager && (
                      <div className="flex-1 min-w-[200px]">
                          <select 
                            value={portfolioFilters.agentId}
                            onChange={(e) => setPortfolioFilters({...portfolioFilters, agentId: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-brand-gold outline-none bg-gray-50 hover:bg-white transition"
                          >
                              <option value="">Agente Publicador (Todos)</option>
                              {users.filter(u => u.role !== UserRole.PUBLIC).map(u => (
                                  <option key={u.id} value={u.id}>{u.name} ({u.role === UserRole.INTERNAL_AGENT ? 'Interno' : 'Externo'})</option>
                              ))}
                          </select>
                      </div>
                  )}

                  {/* 2. DISTRICT FILTER */}
                  <div className="flex-1 min-w-[150px]">
                      <select 
                        value={portfolioFilters.district}
                        onChange={(e) => setPortfolioFilters({...portfolioFilters, district: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-brand-gold outline-none bg-gray-50 hover:bg-white transition"
                      >
                          <option value="">Distrito (Todos)</option>
                          {availableDistricts.map(dist => (
                              <option key={dist} value={dist}>{dist}</option>
                          ))}
                      </select>
                  </div>

                  {/* 3. TYPE FILTER */}
                  <div className="flex-1 min-w-[150px]">
                      <select 
                         value={portfolioFilters.type}
                         onChange={(e) => setPortfolioFilters({...portfolioFilters, type: e.target.value})}
                         className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-brand-gold outline-none bg-gray-50 hover:bg-white transition"
                      >
                          <option value="">Operación (Todos)</option>
                          <option value="SALE">Venta</option>
                          <option value="RENT">Alquiler</option>
                      </select>
                  </div>

                  {/* RESET BUTTON */}
                  <button 
                    onClick={() => setPortfolioFilters({ agentId: '', district: '', type: '' })}
                    className="p-2 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-lg transition"
                    title="Limpiar Filtros"
                  >
                      <RefreshCcw className="w-4 h-4" />
                  </button>
              </div>

              {/* FULL PROPERTIES GRID/TABLE */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700 flex justify-between items-center">
                      <span>Inventario Total ({displayProps.length})</span>
                      <div className="flex gap-2 text-xs">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Venta</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Alquiler</span>
                      </div>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-white text-gray-500 uppercase font-bold text-xs sticky top-0 z-10 shadow-sm">
                              <tr>
                                  <th className="px-6 py-3 bg-gray-50">Propiedad</th>
                                  <th className="px-6 py-3 bg-gray-50">Tipo</th>
                                  <th className="px-6 py-3 bg-gray-50">Precio</th>
                                  <th className="px-6 py-3 bg-gray-50">Estado</th>
                                  <th className="px-6 py-3 bg-gray-50">Rendimiento</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {displayProps.length > 0 ? displayProps.map(p => (
                                  <tr key={p.id} className="hover:bg-gray-50 transition">
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                              <img src={p.imageUrl} className="w-10 h-10 rounded object-cover" alt="thumb" />
                                              <div>
                                                  <div className="font-bold text-gray-800 truncate max-w-[200px]">{p.title}</div>
                                                  <div className="text-xs text-gray-500">{p.location}</div>
                                                  {isManager && (
                                                      <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                          <UserIcon className="w-3 h-3" /> {p.ownerName}
                                                      </div>
                                                  )}
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${p.type === 'SALE' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                              {p.type === 'SALE' ? 'Venta' : 'Alquiler'}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 font-bold text-gray-700">
                                          {p.currency} {p.price.toLocaleString()}
                                      </td>
                                      <td className="px-6 py-4">
                                          {p.managementStatus === 'REJECTED' ? (
                                              <span className="text-red-600 font-bold text-xs">Rechazado</span>
                                          ) : p.assignedAgentId ? (
                                              <div className="text-xs">
                                                  <span className="text-green-600 font-bold">Asignado</span>
                                                  <span className="block text-[10px] text-gray-400">
                                                      {users.find(u => u.id === p.assignedAgentId)?.name.split(' ')[0]}
                                                  </span>
                                              </div>
                                          ) : (
                                              <span className="text-gray-400 text-xs">Sin asignar</span>
                                          )}
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="flex gap-4 text-xs text-gray-500">
                                              <span className="font-bold flex items-center gap-1"><Activity className="w-3 h-3"/> {p.stats.views} Vistas</span>
                                              <span className="font-bold flex items-center gap-1 text-brand-red"><MessageSquare className="w-3 h-3"/> {p.stats.contacts} Leads</span>
                                          </div>
                                      </td>
                                  </tr>
                              )) : (
                                  <tr>
                                      <td colSpan={5} className="text-center py-8 text-gray-400">
                                          No se encontraron propiedades con los filtros seleccionados.
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      );
  }

  // --- VIEW: LEADS MANAGEMENT ---
  if (view === 'leads') {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-6">
                <div>
                   <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                       <MessageSquare className="w-8 h-8 text-brand-red" /> Gestión de Leads
                   </h2>
                   <p className="text-gray-500 text-sm mt-1">Contacta a tus potenciales clientes en tiempo récord.</p>
                </div>
                <button onClick={() => setView('overview')} className="text-gray-500 hover:text-gray-700 font-bold text-sm bg-gray-100 px-4 py-2 rounded-lg">
                   &larr; Volver al Dashboard
                </button>
            </div>

            {/* FILTERS BAR */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-auto">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha Inicio</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full md:w-40 border p-2 rounded text-sm outline-none focus:border-brand-gold" />
                </div>
                <div className="w-full md:w-auto">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha Fin</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full md:w-40 border p-2 rounded text-sm outline-none focus:border-brand-gold" />
                </div>
                
                {isManager && (
                    <div className="w-full md:w-auto flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filtrar por Agente</label>
                        <select 
                            value={filterAgentId}
                            onChange={e => setFilterAgentId(e.target.value)}
                            className="w-full border p-2 rounded text-sm outline-none focus:border-brand-gold bg-white"
                        >
                            <option value="">Todos los agentes</option>
                            {users.filter(u => u.role === UserRole.INTERNAL_AGENT || u.role === UserRole.EXTERNAL_AGENT).map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.role === UserRole.INTERNAL_AGENT ? 'Interno' : 'Externo'})</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex gap-2 ml-auto">
                     <button 
                        onClick={() => { setStartDate(''); setEndDate(''); setFilterAgentId(''); }} 
                        className="p-2 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded transition"
                        title="Limpiar Filtros"
                     >
                         <Filter className="w-5 h-5" />
                     </button>
                     <button 
                        onClick={handleExportLeads}
                        className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
                     >
                         <Download className="w-4 h-4" /> Exportar CSV
                     </button>
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Interés</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4">Fecha</th>
                            <th className="p-4">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {visibleLeads.length > 0 ? visibleLeads.map(lead => (
                            <tr key={lead.id} className="hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <p className="font-bold text-gray-900">{lead.clientName}</p>
                                    <p className="text-xs text-gray-500">{lead.clientPhone}</p>
                                </td>
                                <td className="p-4">
                                    <p className="text-gray-800 font-medium line-clamp-1">{lead.propertyTitle}</p>
                                    <a href="#" className="text-xs text-brand-red hover:underline">Ver propiedad</a>
                                </td>
                                <td className="p-4">
                                    {lead.status === 'NEW' ? (
                                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">Nuevo</span>
                                    ) : (
                                        <div>
                                            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Contactado</span>
                                            {lead.responseTimeMinutes && (
                                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                    <Timer className="w-3 h-3" /> {lead.responseTimeMinutes} min
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 text-gray-500 text-xs">
                                    {new Date(lead.createdAt).toLocaleDateString()} <br/>
                                    {new Date(lead.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </td>
                                <td className="p-4">
                                    <button 
                                        onClick={() => handleWhatsAppClick(lead)}
                                        className="bg-[#25D366] text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-[#20bd5a] transition flex items-center gap-1 shadow-sm"
                                    >
                                        <MessageSquare className="w-3 h-3" /> WhatsApp
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                    No hay leads registrados en este periodo.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
  }

  // --- VIEW: OVERVIEW (DEFAULT DASHBOARD) ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
               <LayoutDashboard className="w-8 h-8 text-brand-gold" /> Panel de Control
           </h1>
           <p className="text-gray-500 mt-1 font-medium">
               Bienvenido, <span className="text-brand-red font-bold">{user.name}</span> ({user.role.replace('_', ' ')})
           </p>
        </div>
        
        <div className="flex gap-3">
             {/* Broker/Internal Agent Actions */}
             {isManager && (
                 <>
                    <button onClick={() => setView('reputation')} className="bg-white text-gray-700 border border-gray-300 font-bold px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-brand-red transition flex items-center gap-2 shadow-sm">
                        <Award className="w-4 h-4 text-brand-gold" /> Reputación
                    </button>
                    <button onClick={() => setView('properties-full')} className="bg-white text-gray-700 border border-gray-300 font-bold px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-brand-red transition flex items-center gap-2 shadow-sm">
                        <Building2 className="w-4 h-4" /> Inventario
                    </button>
                    <button onClick={() => setView('leads')} className="bg-white text-gray-700 border border-gray-300 font-bold px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-brand-red transition flex items-center gap-2 shadow-sm relative">
                        <MessageSquare className="w-4 h-4" /> Leads
                        {leads.some(l => l.status === 'NEW') && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                    </button>
                 </>
             )}

             {canAccessSharedNetwork && (
                 <button onClick={() => setView('shared-network')} className="bg-brand-black text-white font-bold px-4 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2 shadow-md">
                    <Globe className="w-4 h-4 text-brand-gold" /> Red Compartida
                 </button>
             )}
             
             {/* Main Publish Button */}
             <button onClick={handleStartPublishing} className="bg-brand-red text-white font-bold px-6 py-2 rounded-lg hover:bg-red-900 transition flex items-center gap-2 shadow-lg transform hover:-translate-y-0.5">
                <Plus className="w-5 h-5" /> Publicar Propiedad
             </button>
        </div>
      </div>
      
      {/* BROKER/MANAGER STATS CARDS */}
      {isManager && brokerStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute right-0 top-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-gray-500 font-bold text-xs uppercase tracking-wider">
                        <Wallet className="w-4 h-4 text-brand-red" /> Valor Cartera (Venta)
                    </div>
                    <div className="text-2xl font-black text-gray-900">
                        ${(brokerStats.totalValueUSD / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +12% vs mes anterior
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-50 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-gray-500 font-bold text-xs uppercase tracking-wider">
                        <DollarSign className="w-4 h-4 text-yellow-600" /> Comisión Potencial
                    </div>
                    <div className="text-2xl font-black text-gray-900">
                        ${(brokerStats.potentialCommission / 1000).toFixed(1)}k
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Estimado (3% Venta / 1 Mes Alquiler)</div>
                </div>
            </div>

             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-gray-500 font-bold text-xs uppercase tracking-wider">
                        <MessageSquare className="w-4 h-4 text-blue-600" /> Total Leads Activos
                    </div>
                    <div className="text-2xl font-black text-gray-900">
                        {brokerStats.totalLeads}
                    </div>
                     <div className="text-xs text-blue-600 font-bold mt-1 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> {leads.filter(l => l.status === 'NEW').length} nuevos hoy
                    </div>
                </div>
            </div>

             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer" onClick={() => setView('users')}>
                <div className="absolute right-0 top-0 w-24 h-24 bg-gray-100 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-gray-500 font-bold text-xs uppercase tracking-wider">
                        <Users className="w-4 h-4 text-gray-600" /> Equipo de Agentes
                    </div>
                    <div className="text-2xl font-black text-gray-900">
                        {users.filter(u => u.role === UserRole.INTERNAL_AGENT || u.role === UserRole.EXTERNAL_AGENT).length}
                    </div>
                    <div className="text-xs text-brand-red font-bold mt-1 flex items-center gap-1 hover:underline">
                        Ver gestión de equipo <ArrowUpRight className="w-3 h-3" />
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Properties List (Scrollable) */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions (Broker Only) */}
            {isBroker && (
                <div className="bg-brand-black text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
                    <div className="relative z-10 flex gap-4">
                        <button onClick={() => setView('config')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition font-bold text-sm backdrop-blur-sm">
                            <Settings className="w-4 h-4 text-brand-gold" /> Configurar Sistema
                        </button>
                         <button onClick={() => setView('plans')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition font-bold text-sm backdrop-blur-sm">
                            <CreditCard className="w-4 h-4 text-brand-gold" /> Gestionar Planes
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 opacity-10">
                        <Rocket className="w-32 h-32 -mr-8 -mt-8" />
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-brand-red" /> 
                        {isManager ? 'Últimas Propiedades (Cartera)' : 'Mis Propiedades'}
                    </h3>
                    {isManager && (
                        <span className="text-xs font-bold bg-white border border-gray-200 px-2 py-1 rounded text-gray-500">
                            Mostrando recientes
                        </span>
                    )}
                </div>
                
                <div className="max-h-[500px] overflow-y-auto">
                    {filteredPortfolio.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {filteredPortfolio.slice(0, 8).map(prop => (
                                <div key={prop.id} className="p-4 hover:bg-gray-50 transition flex gap-4 items-start group relative">
                                    <img src={prop.imageUrl} alt={prop.title} className="w-20 h-20 rounded-lg object-cover shadow-sm" />
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-900 truncate pr-2">{prop.title}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${prop.type === 'SALE' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                {prop.type === 'SALE' ? 'Venta' : 'Alquiler'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-1">{prop.location}</p>
                                        <p className="font-black text-gray-800 text-sm">{prop.currency} {prop.price.toLocaleString()}</p>
                                        
                                        {/* Status Indicators */}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {prop.managementStatus === 'REJECTED' ? (
                                                <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded flex items-center gap-1">
                                                    <Ban className="w-3 h-3" /> Rechazado
                                                </span>
                                            ) : (
                                                <>
                                                    {prop.isAgentSupport && !prop.assignedAgentId && (
                                                        <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                                                            <UserCheck className="w-3 h-3" /> Requiere Asignación
                                                        </span>
                                                    )}
                                                    {prop.assignedAgentId && (
                                                        <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded flex items-center gap-1">
                                                            <Check className="w-3 h-3" /> Asignado: {users.find(u => u.id === prop.assignedAgentId)?.name.split(' ')[0]}
                                                        </span>
                                                    )}
                                                    {prop.isSharedCommission && (
                                                         <button 
                                                            onClick={() => openCommissionEdit(prop)}
                                                            className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-blue-200 transition"
                                                         >
                                                            <Handshake className="w-3 h-3" /> Com. Compartida {prop.sharedCommissionPercentage}%
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 bg-white/90 p-1 rounded-lg shadow-sm backdrop-blur-sm">
                                         {/* Only Broker can Assign or Reject pending properties */}
                                         {(isBroker && prop.isAgentSupport && !prop.assignedAgentId && prop.managementStatus !== 'REJECTED') && (
                                             <button 
                                                onClick={() => handleOpenActionModal(prop.id)}
                                                className="p-1.5 bg-brand-gold text-black rounded hover:bg-yellow-400" 
                                                title="Gestionar (Asignar/Rechazar)"
                                             >
                                                 <UserCog className="w-4 h-4" />
                                             </button>
                                         )}
                                         
                                         {/* Edit Commission Button (For everyone involved) */}
                                         {((isManager) || prop.ownerId === user.id) && (
                                              <button 
                                                onClick={() => openCommissionEdit(prop)}
                                                className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                                title="Editar Comisión"
                                              >
                                                  <Percent className="w-4 h-4" />
                                              </button>
                                         )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-400">
                            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No hay propiedades para mostrar con los filtros actuales.</p>
                            {portfolioFilters.agentId || portfolioFilters.district || portfolioFilters.type ? (
                                <button onClick={() => setPortfolioFilters({agentId:'', district:'', type:''})} className="text-brand-red text-xs font-bold mt-2 hover:underline">
                                    Limpiar filtros
                                </button>
                            ) : (
                                <button onClick={handleStartPublishing} className="text-brand-red text-xs font-bold mt-2 hover:underline">
                                    Publicar ahora
                                </button>
                            )}
                        </div>
                    )}
                </div>
                {/* Footer Link to Full Inventory */}
                {isManager && (
                    <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                        <button onClick={() => setView('properties-full')} className="text-xs font-bold text-brand-red flex items-center justify-center gap-1 hover:underline">
                            Ver Inventario Completo <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* Analytics Section */}
            <AnalyticsCharts properties={isManager ? portfolioProperties : myProperties} />
        </div>

        {/* Right Column: Agent Ranking & Activity */}
        <div className="space-y-6">
            
            {/* Top Agents (Manager Only) */}
            {isManager && brokerStats?.topAgents && (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-bold text-gray-800 text-sm uppercase flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-brand-gold" /> Top Agentes (Mes)
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {brokerStats.topAgents.map((agent, idx) => (
                            <div key={agent.id} className="p-4 flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-brand-gold text-black' : 'bg-gray-200 text-gray-600'}`}>
                                    {idx + 1}
                                </div>
                                <img src={agent.avatar} className="w-10 h-10 rounded-full border border-gray-200" alt="avatar" />
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900 text-sm">{agent.name}</p>
                                    <p className="text-[10px] text-gray-500">{agent.role === UserRole.INTERNAL_AGENT ? 'Interno' : 'Externo'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-brand-red text-sm">{agent.dealStats?.sold || 0}</p>
                                    <p className="text-[10px] text-gray-400">Ventas</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Charts: Sales vs Rent */}
             <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
                 <h3 className="font-bold text-gray-800 text-sm uppercase mb-4">Distribución de Cartera</h3>
                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                 </div>
             </div>

             {/* Area Chart: Trend */}
             <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
                 <h3 className="font-bold text-gray-800 text-sm uppercase mb-4 flex items-center gap-2">
                     <BarChart3 className="w-4 h-4 text-gray-400" /> Tendencia de Vistas
                 </h3>
                 <div className="h-32 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorVistas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#A51B0B" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#A51B0B" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="Vistas" stroke="#A51B0B" fillOpacity={1} fill="url(#colorVistas)" />
                         </AreaChart>
                     </ResponsiveContainer>
                 </div>
             </div>

        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. ACTION MODAL (Assign or Reject) */}
      {isActionModalOpen && selectedPropertyId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 text-center animate-in zoom-in-95">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Gestionar Solicitud</h3>
                  <p className="text-sm text-gray-500 mb-6">
                      El propietario ha solicitado apoyo. ¿Qué deseas hacer con esta propiedad?
                  </p>
                  <div className="space-y-3">
                      <button 
                        onClick={handleOpenAssignModal}
                        className="w-full bg-brand-gold text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition flex items-center justify-center gap-2"
                      >
                          <UserCheck className="w-5 h-5" /> Asignar Agente
                      </button>
                      
                      <button 
                         onClick={handleReject}
                         className="w-full bg-white border-2 border-red-100 text-red-600 font-bold py-3 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2"
                      >
                          <Ban className="w-5 h-5" /> Rechazar Solicitud
                      </button>

                      <button 
                        onClick={() => setActionModalOpen(false)}
                        className="text-gray-400 text-sm hover:text-gray-600 font-medium pt-2"
                      >
                          Cancelar
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* 2. ASSIGN AGENT MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Seleccionar Agente Interno</h3>
                    <button onClick={() => setAssignModalOpen(false)} className="text-gray-400 hover:text-red-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar agente por nombre..." 
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-brand-gold"
                            value={agentSearchTerm}
                            onChange={(e) => setAgentSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {users
                            .filter(u => u.role === UserRole.INTERNAL_AGENT && u.name.toLowerCase().includes(agentSearchTerm.toLowerCase()))
                            .map(agent => (
                                <div 
                                    key={agent.id} 
                                    onClick={() => handleSelectAgent(agent.id)}
                                    className="flex items-center gap-3 p-3 hover:bg-yellow-50 rounded-lg cursor-pointer transition border border-transparent hover:border-yellow-200"
                                >
                                    <img src={agent.avatar} className="w-10 h-10 rounded-full bg-gray-200" alt="avatar" />
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{agent.name}</p>
                                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                            <Star className="w-3 h-3 text-brand-gold fill-brand-gold" /> {agent.dealStats?.sold || 0} Ventas
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                                </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 3. COMMISSION EDIT MODAL */}
      {editingCommissionProp && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 animate-in zoom-in-95">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Percent className="w-5 h-5 text-brand-red" /> Configurar Comisión
                  </h3>
                  
                  <div className="mb-4">
                      <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                          <input 
                              type="checkbox" 
                              checked={isCommissionActive}
                              onChange={(e) => setIsCommissionActive(e.target.checked)}
                              className="w-5 h-5 text-brand-red rounded focus:ring-brand-red"
                          />
                          <span className="font-bold text-gray-700 text-sm">Compartir Comisión</span>
                      </label>
                  </div>

                  {isCommissionActive && (
                      <div className="mb-6 animate-in slide-in-from-top-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Porcentaje a Compartir (%)</label>
                          <div className="flex items-center gap-2">
                              <input 
                                  type="number" 
                                  value={commissionValue}
                                  onChange={(e) => setCommissionValue(Number(e.target.value))}
                                  className="w-full border p-2 rounded text-lg font-black text-brand-red focus:border-brand-gold outline-none text-center"
                                  min="0"
                                  max="50"
                              />
                              <span className="text-gray-400 font-bold">%</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">
                              Este porcentaje será visible para todos los agentes de la red.
                          </p>
                      </div>
                  )}

                  <div className="flex gap-3">
                      <button onClick={() => setEditingCommissionProp(null)} className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                      <button onClick={saveCommissionEdit} className="flex-1 py-2 bg-brand-black text-white font-bold rounded-lg hover:bg-gray-800">Guardar</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
