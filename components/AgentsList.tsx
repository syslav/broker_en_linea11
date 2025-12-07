import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { MOCK_USERS } from '../constants';
import { Briefcase, Key, Home, TrendingUp, X, Phone, UserCheck, ShieldCheck } from 'lucide-react';

export const AgentsList: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);

  // Filter only agents
  const agents = MOCK_USERS.filter(u => 
    u.role === UserRole.INTERNAL_AGENT || u.role === UserRole.EXTERNAL_AGENT
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">Nuestros Agentes Destacados</h2>
        <p className="text-gray-600 mt-2">Conecta con los mejores profesionales del sector inmobiliario.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group flex flex-col">
            
            {/* Header / Avatar */}
            <div className="h-24 bg-gradient-to-r from-gray-800 to-gray-900 relative">
                {/* Role Badge */}
                <div className="absolute top-2 right-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border shadow-sm ${agent.role === UserRole.INTERNAL_AGENT ? 'bg-brand-gold text-black border-yellow-500' : 'bg-white text-brand-red border-red-100'}`}>
                        {agent.role === UserRole.INTERNAL_AGENT ? 'Interno' : 'Externo'}
                    </span>
                </div>
            </div>
            
            <div className="px-6 pb-6 pt-0 relative flex-1 flex flex-col">
                <div className="-mt-12 mb-3 flex justify-center">
                    <img 
                        src={agent.avatar} 
                        alt={agent.name} 
                        className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover group-hover:scale-105 transition-transform bg-gray-200"
                    />
                </div>

                <div className="text-center mb-3">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{agent.name}</h3>
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-1">
                        <Briefcase className="w-3 h-3" />
                        <span>{agent.experience || '1 año'} de exp.</span>
                    </div>
                </div>

                {/* Profile Bio */}
                <p className="text-xs text-gray-500 text-center mb-4 line-clamp-2 min-h-[2.5em]">
                    {agent.about || "Agente profesional comprometido."}
                </p>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-2 border-t border-b border-gray-100 py-3 mb-4">
                    <div className="text-center border-r border-gray-100">
                        <div className="text-lg font-bold text-brand-red">{agent.dealStats?.sold || 0}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold flex items-center justify-center gap-1">
                            <Key className="w-3 h-3" /> Vendidas
                        </div>
                    </div>
                    <div className="text-center">
                         <div className="text-lg font-bold text-brand-black">{agent.dealStats?.rented || 0}</div>
                         <div className="text-[10px] text-gray-400 uppercase font-bold flex items-center justify-center gap-1">
                            <Home className="w-3 h-3" /> Alquiladas
                        </div>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="bg-gray-50 rounded-lg p-2 text-center mb-3">
                        <div className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
                            <TrendingUp className="w-3 h-3 text-brand-gold" /> Motivación (Com. Min)
                        </div>
                        <div className="font-bold text-gray-800 text-sm">
                            {agent.motivationThreshold}%
                        </div>
                    </div>

                    <button 
                        onClick={() => setSelectedAgent(agent)}
                        className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-2 rounded-lg text-sm hover:bg-brand-red hover:text-white hover:border-brand-red transition-all shadow-sm"
                    >
                        Ver Perfil
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* AGENT DETAIL MODAL */}
      {selectedAgent && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col md:flex-row">
                
                {/* Close Button */}
                <button 
                    onClick={() => setSelectedAgent(null)}
                    className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-900 bg-white/80 rounded-full p-2 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Side: Photo & Key Info */}
                <div className="md:w-2/5 bg-gray-50 p-8 flex flex-col items-center justify-center text-center border-r border-gray-100 relative">
                     <div className="absolute top-0 left-0 w-full h-1 bg-brand-gold"></div>
                     <img 
                        src={selectedAgent.avatar.replace('150', '400')} 
                        alt={selectedAgent.name} 
                        className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover mb-4"
                    />
                    <h2 className="text-xl font-bold text-gray-900">{selectedAgent.name}</h2>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mt-2 ${selectedAgent.role === UserRole.INTERNAL_AGENT ? 'bg-brand-gold text-black' : 'bg-brand-red text-white'}`}>
                        {selectedAgent.role === UserRole.INTERNAL_AGENT ? 'Agente Interno' : 'Agente Externo'}
                    </span>
                    
                    <div className="mt-6 w-full space-y-3">
                        <div className="flex items-center justify-between text-sm px-4">
                            <span className="text-gray-500">Experiencia</span>
                            <span className="font-bold text-gray-800">{selectedAgent.experience}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm px-4">
                            <span className="text-gray-500">ID Agente</span>
                            <span className="font-mono text-xs text-gray-400">#{selectedAgent.id.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Details & Contact */}
                <div className="md:w-3/5 p-8 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-brand-red" /> Perfil Profesional
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        {selectedAgent.about || "Este agente no ha proporcionado una descripción detallada, pero cuenta con la validación de UrbanFlow para operar en nuestra plataforma."}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                             <span className="block text-2xl font-bold text-brand-red mb-1">{selectedAgent.dealStats?.sold}</span>
                             <span className="text-xs font-bold text-gray-600 uppercase">Propiedades Vendidas</span>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                             <span className="block text-2xl font-bold text-yellow-700 mb-1">{selectedAgent.dealStats?.rented}</span>
                             <span className="text-xs font-bold text-gray-600 uppercase">Alquileres Cerrados</span>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="bg-gray-50 p-3 rounded-lg mb-4 flex items-start gap-2">
                             <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                             <p className="text-xs text-gray-500">
                                <strong>Verificación UrbanFlow:</strong> Este agente ha pasado todos los controles de identidad y antecedentes profesionales.
                             </p>
                        </div>

                        <a 
                            href={`https://wa.me/${selectedAgent.phoneNumber}?text=Hola, vi tu perfil en UrbanFlow y me gustaría hacerte una consulta.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-[#25D366] text-white font-bold py-3 rounded-xl hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Phone className="w-5 h-5" />
                            Contactar por WhatsApp
                        </a>
                    </div>
                </div>

            </div>
        </div>
      )}
    </div>
  );
};
