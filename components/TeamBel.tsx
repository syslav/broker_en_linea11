

import React, { useState, useMemo, useRef } from 'react';
import { Property, User, Visit, UserRole } from '../types';
import { Calendar, Clock, MapPin, User as UserIcon, Plus, CheckCircle2, XCircle, Search, ChevronLeft, ChevronRight, Edit2, Upload, Trash2, Camera, Check, Lock, Phone } from 'lucide-react';

interface TeamBelProps {
  visits: Visit[];
  properties: Property[];
  agents: User[];
  currentUser: User;
  onAddVisit: (visit: Visit) => void;
  onUpdateVisit: (visit: Visit) => void;
}

export const TeamBel: React.FC<TeamBelProps> = ({ visits, properties, agents, currentUser, onAddVisit, onUpdateVisit }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0,0,0,0);
    return monday;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);

  // Form State
  const [selectedPropId, setSelectedPropId] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState(''); // New: Private Phone State
  const [visitDate, setVisitDate] = useState('');
  
  // Custom Time Picker State
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('AM');

  // Evidence Upload State
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([]);
  const [markAsCompleted, setMarkAsCompleted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate array of 7 days for the current view
  const weekDays = useMemo(() => {
      const days = [];
      for (let i = 0; i < 7; i++) {
          const d = new Date(currentWeekStart);
          d.setDate(d.getDate() + i);
          days.push(d);
      }
      return days;
  }, [currentWeekStart]);

  const handlePrevWeek = () => {
      const newDate = new Date(currentWeekStart);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
      const newDate = new Date(currentWeekStart);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentWeekStart(newDate);
  };

  const openModal = (visit?: Visit) => {
      if (visit) {
          setEditingVisit(visit);
          setSelectedPropId(visit.propertyId);
          setSelectedAgentId(visit.agentId);
          setClientName(visit.clientName);
          
          // Privacy check for existing phone number
          const canViewPhone = currentUser.role === UserRole.BROKER || currentUser.id === visit.agentId;
          setClientPhone(canViewPhone ? (visit.clientPhone || '') : '');

          const d = new Date(visit.date);
          setVisitDate(d.toISOString().split('T')[0]);
          
          // Parse Time for Custom Picker
          let h = d.getHours();
          const m = d.getMinutes();
          const am = h >= 12 ? 'PM' : 'AM';
          h = h % 12;
          h = h ? h : 12; // the hour '0' should be '12'
          
          setHour(h < 10 ? `0${h}` : `${h}`);
          setMinute(m < 10 ? `0${m}` : `${m}`);
          setAmpm(am);

          setMarkAsCompleted(visit.status === 'COMPLETED');
          setEvidenceFiles(visit.evidenceImages || []);
      } else {
          setEditingVisit(null);
          // Reset form
          setClientName('');
          setClientPhone('');
          setSelectedPropId('');
          setVisitDate(new Date().toISOString().split('T')[0]);
          setHour('09');
          setMinute('00');
          setAmpm('AM');
          setMarkAsCompleted(false);
          setEvidenceFiles([]);
      }
      setIsModalOpen(true);
  };

  const handleSaveVisit = (e: React.FormEvent) => {
      e.preventDefault();
      const prop = properties.find(p => p.id === selectedPropId);
      const agent = agents.find(a => a.id === selectedAgentId);

      if (prop && agent && visitDate && clientName) {
          // Construct 24h Time from AM/PM for Storage
          let h = parseInt(hour);
          if (ampm === 'PM' && h !== 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          
          const dateTimeString = `${visitDate}T${h < 10 ? '0'+h : h}:${minute}:00`;
          const timestamp = new Date(dateTimeString).getTime();

          const baseVisit = {
              propertyId: prop.id,
              propertyTitle: prop.title,
              propertyImage: prop.imageUrl,
              propertyLocation: prop.location,
              agentId: agent.id,
              agentName: agent.name,
              agentAvatar: agent.avatar,
              clientName,
              clientPhone, // Save phone
              date: timestamp,
              status: markAsCompleted ? 'COMPLETED' : 'SCHEDULED',
              evidenceImages: markAsCompleted ? evidenceFiles : undefined
          };

          if (editingVisit) {
              onUpdateVisit({
                  ...editingVisit,
                  ...baseVisit
              } as Visit);
          } else {
              onAddVisit({
                  id: `v_${Date.now()}`,
                  ...baseVisit
              } as Visit);
          }
          setIsModalOpen(false);
      } else {
          alert("Por favor completa todos los campos.");
      }
  };

  // Helper to format date
  const formatTimeAMPM = (timestamp: number) => {
      return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // File Upload Logic
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const files = Array.from(e.target.files) as File[]; // Cast to File[] for safety
          if (evidenceFiles.length + files.length > 3) {
              alert("Máximo 3 fotos permitidas.");
              return;
          }
          files.forEach(file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  if (reader.result) {
                      setEvidenceFiles(prev => [...prev, reader.result as string]);
                  }
              };
              reader.readAsDataURL(file);
          });
      }
  };

  // Logic to determine if user can view/edit the phone number
  const canViewPrivateData = currentUser.role === UserRole.BROKER || (editingVisit?.agentId === currentUser.id) || !editingVisit;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
               <span className="bg-brand-red text-white p-2 rounded-lg"><Calendar className="w-8 h-8" /></span> 
               TEAM BEL
           </h1>
           <p className="text-gray-500 mt-1 font-medium">Gestión Centralizada de Visitas y Agenda de Agentes</p>
        </div>
        
        <div className="flex gap-4 items-center">
            {/* Week Nav */}
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                <button onClick={handlePrevWeek} className="p-2 hover:bg-gray-100 rounded-md transition"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                <span className="px-4 text-sm font-bold text-gray-700 w-48 text-center">
                    {currentWeekStart.toLocaleDateString('es-ES', {day: 'numeric', month: 'short'})} - {new Date(new Date(currentWeekStart).setDate(currentWeekStart.getDate()+6)).toLocaleDateString('es-ES', {day: 'numeric', month: 'short'})}
                </span>
                <button onClick={handleNextWeek} className="p-2 hover:bg-gray-100 rounded-md transition"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
            </div>

            <button 
                onClick={() => openModal()}
                className="bg-brand-gold text-black font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-yellow-400 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
                <Plus className="w-5 h-5" /> Agendar Visita
            </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-1 md:grid-cols-7 border-b border-gray-200 bg-gray-50 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {weekDays.map((day, idx) => {
                  const isToday = new Date().toDateString() === day.toDateString();
                  return (
                      <div key={idx} className={`p-4 text-center ${isToday ? 'bg-red-50' : ''}`}>
                          <span className={`text-xs font-bold uppercase block mb-1 ${isToday ? 'text-brand-red' : 'text-gray-400'}`}>
                              {day.toLocaleDateString('es-ES', { weekday: 'long' })}
                          </span>
                          <span className={`text-xl font-black ${isToday ? 'text-brand-red' : 'text-gray-800'}`}>
                              {day.getDate()}
                          </span>
                      </div>
                  );
              })}
          </div>

          {/* Visits Columns */}
          <div className="grid grid-cols-1 md:grid-cols-7 min-h-[600px] divide-y md:divide-y-0 md:divide-x divide-gray-100 bg-gray-50/30">
              {weekDays.map((day, idx) => {
                  // Filter visits for this day
                  const dayVisits = visits.filter(v => {
                      const vDate = new Date(v.date);
                      return vDate.getDate() === day.getDate() && 
                             vDate.getMonth() === day.getMonth() &&
                             vDate.getFullYear() === day.getFullYear();
                  }).sort((a,b) => a.date - b.date);

                  return (
                      <div key={idx} className="p-2 space-y-3 relative group hover:bg-white transition-colors h-full">
                          {dayVisits.length > 0 ? dayVisits.map(visit => {
                              const isCompleted = visit.status === 'COMPLETED';
                              return (
                                <div 
                                    key={visit.id} 
                                    onClick={() => openModal(visit)}
                                    className={`bg-white p-3 rounded-lg shadow-sm border ${isCompleted ? 'border-green-300 bg-green-50/30' : 'border-gray-100 hover:border-brand-gold'} hover:shadow-md transition-all cursor-pointer group/card relative overflow-hidden`}
                                >
                                    {/* Status Stripe */}
                                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${isCompleted ? 'bg-green-500' : 'bg-brand-red'}`}></div>
                                    
                                    <div className="flex items-center justify-between mb-2 pl-2">
                                        <div className="flex items-center gap-1">
                                            <Clock className={`w-3 h-3 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                                            <span className={`text-xs font-bold ${isCompleted ? 'text-green-700' : 'text-gray-700'}`}>
                                                {formatTimeAMPM(visit.date)}
                                            </span>
                                        </div>
                                        {isCompleted && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                    </div>
                                    
                                    <div className="pl-2 mb-3">
                                        <div className="flex items-start gap-2 mb-2">
                                            <img src={visit.propertyImage} className="w-8 h-8 rounded object-cover border border-gray-200 flex-shrink-0" alt="prop" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight">{visit.propertyTitle}</p>
                                                <p className="text-[10px] text-gray-400 truncate">{visit.propertyLocation}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pl-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2" title={`Agente: ${visit.agentName}`}>
                                            <img src={visit.agentAvatar} className="w-6 h-6 rounded-full border border-gray-200" alt="agent" />
                                            <span className="text-[10px] font-medium text-gray-600 truncate max-w-[60px]">{visit.agentName.split(' ')[0]}</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-brand-black bg-gray-100 px-2 py-0.5 rounded-full">
                                            {visit.clientName.split(' ')[0]}
                                        </div>
                                    </div>
                                    
                                    {visit.evidenceImages && visit.evidenceImages.length > 0 && (
                                        <div className="absolute top-1 right-1">
                                             <Camera className="w-3 h-3 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                              );
                          }) : (
                              <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => {
                                        setVisitDate(day.toISOString().split('T')[0]); // Pre-fill date
                                        openModal();
                                    }}
                                    className="p-2 rounded-full bg-gray-100 text-gray-400 hover:bg-brand-gold hover:text-black transition-colors"
                                  >
                                      <Plus className="w-5 h-5" />
                                  </button>
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
      </div>

      {/* NEW/EDIT VISIT MODAL */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                  <div className="bg-brand-black p-4 flex justify-between items-center text-white shrink-0">
                      <h3 className="font-bold flex items-center gap-2">
                          {editingVisit ? <Edit2 className="w-5 h-5 text-brand-gold" /> : <Calendar className="w-5 h-5 text-brand-gold" />} 
                          {editingVisit ? 'Gestionar Visita' : 'Agendar Nueva Visita'}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="hover:text-red-400"><XCircle className="w-6 h-6" /></button>
                  </div>
                  
                  <form onSubmit={handleSaveVisit} className="p-6 space-y-4 overflow-y-auto">
                      
                      {/* Read Only Checks for Permissions */}
                      {/* Broker can edit everything. Assigned agent can edit mostly everything but usually status. We allow full edit for simplicity based on prompt */}
                      {(currentUser.role === UserRole.BROKER || !editingVisit || editingVisit.agentId === currentUser.id) ? (
                        <>
                            {/* Property Select */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Propiedad a Visitar</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <select 
                                        value={selectedPropId}
                                        onChange={e => setSelectedPropId(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-brand-gold outline-none appearance-none bg-white"
                                        required
                                        disabled={!!editingVisit && currentUser.role !== UserRole.BROKER} // Only Broker reassigns property?
                                    >
                                        <option value="">Seleccionar Propiedad...</option>
                                        {properties.map(p => (
                                            <option key={p.id} value={p.id}>{p.title} - {p.location}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Agente Responsable</label>
                                    <select 
                                        value={selectedAgentId}
                                        onChange={e => setSelectedAgentId(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-brand-gold outline-none bg-white"
                                        required
                                        disabled={!!editingVisit && currentUser.role !== UserRole.BROKER} // Only Broker reassigns agent
                                    >
                                        <option value="">Asignar Agente...</option>
                                        {agents.filter(a => a.role === UserRole.INTERNAL_AGENT).map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Cliente</label>
                                    <input 
                                        type="text" 
                                        value={clientName}
                                        onChange={e => setClientName(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-brand-gold outline-none"
                                        placeholder="Ej. Juan Perez"
                                        required
                                    />
                                </div>
                            </div>

                            {/* PRIVACY PHONE SECTION */}
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative">
                                {!canViewPrivateData && (
                                    <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center text-gray-400">
                                        <Lock className="w-5 h-5 mb-1" />
                                        <span className="text-[10px] font-bold uppercase">Datos Privados</span>
                                    </div>
                                )}
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center justify-between">
                                    <span>Teléfono Cliente (Privado)</span>
                                    {canViewPrivateData && <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Visible solo para ti</span>}
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="tel" 
                                        value={canViewPrivateData ? clientPhone : '***********'}
                                        onChange={e => setClientPhone(e.target.value)}
                                        className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm focus:border-brand-gold outline-none"
                                        placeholder="Ej. 999 888 777"
                                        disabled={!canViewPrivateData}
                                    />
                                    {canViewPrivateData && clientPhone && (
                                        <a 
                                            href={`https://wa.me/${clientPhone}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-[#25D366] text-white p-2.5 rounded-lg hover:bg-[#20bd5a] transition flex items-center justify-center shadow-sm"
                                            title="Contactar por WhatsApp"
                                        >
                                            <Phone className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Este número solo será visible para el Broker y el Agente asignado.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha</label>
                                    <input 
                                        type="date" 
                                        value={visitDate}
                                        onChange={e => setVisitDate(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:border-brand-gold outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hora (Formato 12H)</label>
                                    <div className="flex gap-2">
                                        <select value={hour} onChange={e => setHour(e.target.value)} className="flex-1 p-2 border rounded-lg bg-white font-bold text-center">
                                            {Array.from({length: 12}, (_, i) => i + 1).map(h => (
                                                <option key={h} value={h < 10 ? `0${h}` : `${h}`}>{h < 10 ? `0${h}` : `${h}`}</option>
                                            ))}
                                        </select>
                                        <span className="self-center font-bold">:</span>
                                        <select value={minute} onChange={e => setMinute(e.target.value)} className="flex-1 p-2 border rounded-lg bg-white font-bold text-center">
                                            {['00', '15', '30', '45'].map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                        <select value={ampm} onChange={e => setAmpm(e.target.value)} className="flex-1 p-2 border rounded-lg bg-gray-100 font-bold text-center text-brand-red">
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </>
                      ) : (
                          <div className="p-4 bg-gray-50 text-center text-gray-500 rounded-lg border border-dashed">
                              <p>No tienes permisos para editar los detalles principales de esta visita.</p>
                          </div>
                      )}

                      {/* Execution / Evidence Section (Only for Existing Visits) */}
                      {editingVisit && (
                          <div className="mt-6 pt-6 border-t border-gray-100 animate-in slide-in-from-bottom-2">
                              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                  <Camera className="w-5 h-5 text-brand-red" /> Ejecución y Evidencia
                              </h4>
                              
                              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-green-50/50 transition mb-4">
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${markAsCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                      {markAsCompleted && <Check className="w-4 h-4 text-white" />}
                                  </div>
                                  <input 
                                      type="checkbox" 
                                      checked={markAsCompleted}
                                      onChange={(e) => setMarkAsCompleted(e.target.checked)}
                                      className="hidden"
                                      disabled={currentUser.role !== UserRole.BROKER && currentUser.id !== editingVisit.agentId}
                                  />
                                  <div>
                                      <span className="block font-bold text-gray-800 text-sm">Marcar como Realizada</span>
                                      <span className="block text-xs text-gray-400">La visita se completó exitosamente.</span>
                                  </div>
                              </label>

                              {markAsCompleted && (
                                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                      <div className="flex justify-between items-center mb-3">
                                          <span className="text-xs font-bold text-gray-500 uppercase">Fotos de Evidencia ({evidenceFiles.length}/3)</span>
                                          <button 
                                              type="button" 
                                              onClick={() => fileInputRef.current?.click()}
                                              className="text-xs text-brand-red font-bold flex items-center gap-1 hover:underline disabled:opacity-50"
                                              disabled={evidenceFiles.length >= 3}
                                          >
                                              <Upload className="w-3 h-3" /> Subir Foto
                                          </button>
                                          <input 
                                              type="file" 
                                              ref={fileInputRef} 
                                              onChange={handleFileUpload} 
                                              accept="image/*"
                                              className="hidden"
                                              multiple={false}
                                          />
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-2">
                                          {evidenceFiles.map((img, idx) => (
                                              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-300 group">
                                                  <img src={img} alt="evidencia" className="w-full h-full object-cover" />
                                                  <button
                                                      type="button"
                                                      onClick={() => setEvidenceFiles(prev => prev.filter((_, i) => i !== idx))}
                                                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                                  >
                                                      <Trash2 className="w-3 h-3" />
                                                  </button>
                                              </div>
                                          ))}
                                          {evidenceFiles.length === 0 && (
                                              <div className="col-span-3 text-center py-6 text-gray-400 text-xs border border-dashed border-gray-300 rounded-lg">
                                                  Sin evidencias cargadas.
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              )}
                          </div>
                      )}

                      <div className="pt-4 flex gap-3 shrink-0">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Cancelar</button>
                          {(currentUser.role === UserRole.BROKER || !editingVisit || editingVisit.agentId === currentUser.id) && (
                             <button type="submit" className="flex-1 py-3 bg-brand-red text-white font-bold rounded-xl hover:bg-red-900 shadow-lg">
                                 {editingVisit ? 'Guardar Cambios' : 'Confirmar Visita'}
                             </button>
                          )}
                      </div>

                  </form>
              </div>
          </div>
      )}

    </div>
  );
};
