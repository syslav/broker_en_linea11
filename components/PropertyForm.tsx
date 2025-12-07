
import React, { useState, useRef, useEffect } from 'react';
import { Property, UserRole, SystemConfig, User } from '../types';
import { MOCK_USERS, LIMA_DISTRICTS } from '../constants';
import { TrendingUp, Plus, Trash2, Image as ImageIcon, Video, PawPrint, Upload, UserCheck, ShieldAlert } from 'lucide-react';

interface PropertyFormProps {
  userRole: UserRole;
  ownerId: string;
  ownerName: string;
  users: User[]; // Necesario para que el Broker asigne agente
  onSave: (property: Property) => void;
  onCancel: () => void;
  systemConfig: SystemConfig; 
}

const DEPARTMENTS = ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Lambayeque', 'Junín', 'Ancash', 'Ica', 'Callao'];

export const PropertyForm: React.FC<PropertyFormProps> = ({ userRole, ownerId, ownerName, users, onSave, onCancel, systemConfig }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for department selection
  const [selectedDepartment, setSelectedDepartment] = useState('Lima');
  
  // State specific for Broker Assignment
  const [selectedInternalAgent, setSelectedInternalAgent] = useState<string>('');

  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    description: '',
    price: 0,
    currency: 'USD',
    location: '', 
    district: LIMA_DISTRICTS[0], 
    type: 'SALE',
    bedrooms: 1,
    bathrooms: 1,
    area: 0,
    images: [], 
    videoUrl: '', 
    petsPolicy: 'NO_PETS',
    isAgentSupport: false,
    agentSupportPercentage: 0,
    isSharedCommission: false,
    sharedCommissionPercentage: 0,
    ownerName: ownerName
  });

  // Effect: If BROKER, force Shared Commission to true by default
  useEffect(() => {
    if (userRole === UserRole.BROKER) {
        setFormData(prev => ({
            ...prev,
            isSharedCommission: true,
            sharedCommissionPercentage: 50 // Default split
        }));
    }
  }, [userRole]);

  // Convert uploaded files to Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files) as File[];
        
        if ((formData.images?.length || 0) + files.length > systemConfig.maxGalleryImages) {
            alert(`Solo puedes tener un máximo de ${systemConfig.maxGalleryImages} imágenes.`);
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    setFormData(prev => ({
                        ...prev,
                        images: [...(prev.images || []), reader.result as string]
                    }));
                }
            };
            reader.readAsDataURL(file);
        });
    }
  };

  const handleRemoveImage = (index: number) => {
      setFormData(prev => ({
          ...prev,
          images: prev.images?.filter((_, i) => i !== index)
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.images || formData.images.length === 0) {
        alert("Debes agregar al menos una imagen principal.");
        return;
    }

    // Broker Validation: Must select agent
    if (userRole === UserRole.BROKER && !selectedInternalAgent) {
        alert("Como Master Broker, debes asignar un Agente Interno responsable para esta propiedad.");
        return;
    }

    const fullLocation = `${formData.district}, ${selectedDepartment}`;

    const newProperty: Property = {
      id: `new_${Date.now()}`,
      ownerId,
      ownerName: formData.ownerName || ownerName,
      stats: { views: 0, searchAppearances: 0, contacts: 0 },
      imageUrl: formData.images[0], 
      location: fullLocation, 
      
      // Logic for Status based on Role
      // If Broker creates it, it's immediately ASSIGNED to the selected agent
      managementStatus: userRole === UserRole.BROKER ? 'ASSIGNED' : 'PENDING',
      assignedAgentId: userRole === UserRole.BROKER ? selectedInternalAgent : undefined,

      ...formData as Property 
    };
    onSave(newProperty);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto my-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-2xl font-bold text-brand-red mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
          <Plus className="w-6 h-6" /> Publicar Nueva Propiedad
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* BROKER EXCLUSIVE: ASSIGNMENT SECTION */}
        {userRole === UserRole.BROKER && (
            <div className="bg-yellow-50 border-l-4 border-brand-gold p-4 rounded-r-lg mb-6">
                <div className="flex items-start gap-3">
                    <ShieldAlert className="w-6 h-6 text-yellow-700 mt-1" />
                    <div className="w-full">
                        <h3 className="font-bold text-gray-900 text-sm uppercase mb-2">Asignación de Responsable (Obligatorio)</h3>
                        <p className="text-xs text-gray-600 mb-3">
                            Al publicar como Master Broker, la propiedad se publicará automáticamente en la <strong>Red de Comisiones Compartidas</strong>. 
                            Debes definir qué Agente Interno gestionará los leads.
                        </p>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Agente Interno a Cargo</label>
                            <select 
                                required
                                value={selectedInternalAgent}
                                onChange={(e) => setSelectedInternalAgent(e.target.value)}
                                className="w-full border border-yellow-300 rounded p-2 text-sm bg-white focus:ring-brand-gold focus:border-brand-gold font-medium"
                            >
                                <option value="">-- Seleccionar Agente --</option>
                                {users.filter(u => u.role === UserRole.INTERNAL_AGENT).map(agent => (
                                    <option key={agent.id} value={agent.id}>
                                        {agent.name} (ID: {agent.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Título del Anuncio</label>
                <input 
                type="text" 
                required
                className="mt-1 block w-full rounded-md border-gray-300 border p-2 focus:ring-brand-gold focus:border-brand-gold"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Ej. Departamento exclusivo en Miraflores"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* LOCATION SELECTION */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Departamento</label>
                    <select
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2 focus:ring-brand-gold focus:border-brand-gold bg-white"
                        value={selectedDepartment}
                        onChange={e => setSelectedDepartment(e.target.value)}
                    >
                        {DEPARTMENTS.map(dep => (
                            <option key={dep} value={dep}>{dep}</option>
                        ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Distrito</label>
                    <select 
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2 focus:ring-brand-gold focus:border-brand-gold bg-white"
                        value={formData.district}
                        onChange={e => setFormData({...formData, district: e.target.value})}
                    >
                        {LIMA_DISTRICTS.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                 </div>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
           <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select 
              className="mt-1 block w-full rounded-md border-gray-300 border p-2"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as any})}
            >
              <option value="SALE">Venta</option>
              <option value="RENT">Alquiler</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio</label>
            <input 
              type="number" 
              className="mt-1 block w-full rounded-md border-gray-300 border p-2"
              value={formData.price}
              onChange={e => setFormData({...formData, price: Number(e.target.value)})}
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Moneda</label>
            <select 
              className="mt-1 block w-full rounded-md border-gray-300 border p-2"
              value={formData.currency}
              onChange={e => setFormData({...formData, currency: e.target.value as any})}
            >
              <option value="USD">USD</option>
              <option value="PEN">PEN</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700">Dormitorios</label>
            <input type="number" className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: Number(e.target.value)})} />
          </div>
          <div>
             <label className="block text-xs font-medium text-gray-700">Baños</label>
            <input type="number" className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: Number(e.target.value)})} />
          </div>
          <div>
             <label className="block text-xs font-medium text-gray-700">Área (m²)</label>
            <input type="number" className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm" value={formData.area} onChange={e => setFormData({...formData, area: Number(e.target.value)})} />
          </div>
          <div>
             <label className="block text-xs font-medium text-gray-700 flex items-center gap-1"><PawPrint className="w-3 h-3"/> Mascotas</label>
             <select 
                className="mt-1 block w-full border border-gray-300 rounded p-2 text-xs"
                value={formData.petsPolicy}
                onChange={e => setFormData({...formData, petsPolicy: e.target.value as any})}
             >
                 <option value="NO_PETS">No</option>
                 <option value="SMALL_PETS">Sí (Pequeña)</option>
                 <option value="LARGE_PETS">Sí (Grande)</option>
             </select>
          </div>
        </div>

        {/* Media Section */}
        <div className="border-t border-b border-gray-100 py-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm uppercase flex items-center gap-2">
                <ImageIcon className="w-4 h-4"/> Multimedia
            </h3>
            
            {/* Images */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                    <span>Fotos ({formData.images?.length}/{systemConfig.maxGalleryImages})</span>
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-brand-red text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 hover:bg-red-800 shadow-sm"
                    >
                        <Upload className="w-3 h-3" /> Cargar desde Galería
                    </button>
                </label>
                
                {/* Hidden File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    multiple 
                    accept="image/*"
                    className="hidden"
                />

                {/* Image Preview List */}
                {formData.images && formData.images.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-4">
                        {formData.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square group rounded-lg overflow-hidden border border-gray-200">
                                <img src={img} alt="preview" className="w-full h-full object-cover" />
                                <button 
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-800"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                                {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">Principal</span>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-2 p-8 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 text-sm">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <p>No hay imágenes seleccionadas.</p>
                        <p className="text-xs">Haz clic en "Cargar desde Galería" para comenzar.</p>
                    </div>
                )}
            </div>

            {/* Video */}
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Video className="w-4 h-4 text-brand-red" /> Link del Video (Drive/YouTube)
                 </label>
                 <input 
                    type="text" 
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-brand-gold focus:border-brand-gold"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                 />
                 <p className="text-[10px] text-gray-400 mt-1">
                     Pega el enlace compartido de tu video en Google Drive o YouTube. Este botón aparecerá visible para los interesados.
                 </p>
            </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Descripción Detallada</label>
          </div>
          <textarea 
            rows={4}
            className="block w-full rounded-md border-gray-300 border p-2 focus:ring-brand-gold focus:border-brand-gold"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Describe las características principales de tu propiedad..."
          />
        </div>

        {/* Role Specific Options */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase border-b border-gray-200 pb-2">Opciones de Colaboración</h4>
          
          {userRole === UserRole.OWNER && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded transition-colors w-full border border-transparent hover:border-gray-200">
                    <input 
                      type="checkbox" 
                      checked={formData.isAgentSupport} 
                      onChange={e => setFormData({...formData, isAgentSupport: e.target.checked})}
                      className="rounded text-brand-red focus:ring-brand-red w-5 h-5"
                    />
                    <div>
                        <span className="block text-sm font-bold text-gray-800">Solicitar Apoyo de Agente</span>
                        <span className="block text-xs text-gray-500">Un agente experto te contactará para ayudarte a vender/alquilar.</span>
                    </div>
                  </label>
              </div>
            </div>
          )}

          {(userRole === UserRole.EXTERNAL_AGENT || userRole === UserRole.INTERNAL_AGENT || userRole === UserRole.BROKER) && (
             <div>
                <div className="flex items-center justify-between mb-2">
                    <label className={`flex items-center gap-2 ${userRole === UserRole.BROKER ? 'opacity-100' : 'cursor-pointer'}`}>
                        <input 
                        type="checkbox" 
                        checked={formData.isSharedCommission} 
                        onChange={e => {
                            // Broker cannot uncheck this, it's mandatory
                            if (userRole !== UserRole.BROKER) {
                                setFormData({...formData, isSharedCommission: e.target.checked})
                            }
                        }}
                        disabled={userRole === UserRole.BROKER} // Locked for broker
                        className="rounded text-brand-red focus:ring-brand-red w-4 h-4 disabled:opacity-50"
                        />
                        <span className="text-sm font-bold text-gray-800">
                            Compartir Comisión (Red de Agentes)
                            {userRole === UserRole.BROKER && <span className="text-xs text-brand-red ml-2 font-normal">(Obligatorio para Master Broker)</span>}
                        </span>
                    </label>
                </div>

                {formData.isSharedCommission && (
                    <div className="ml-6 pl-4 border-l-2 border-brand-red animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-gray-600 font-medium">Porcentaje a compartir (%):</span>
                            <input 
                                type="number" 
                                value={formData.sharedCommissionPercentage}
                                onChange={e => {
                                    let val = Number(e.target.value);
                                    if(val > 50) val = 50;
                                    if(val < 0) val = 0;
                                    setFormData({...formData, sharedCommissionPercentage: val});
                                }}
                                className="w-20 border border-gray-300 rounded p-1.5 text-sm font-bold text-brand-red focus:border-brand-gold outline-none"
                                placeholder="%"
                                min="0"
                                max="50"
                            />
                            <span className="text-xs text-gray-400 font-medium">(Máx. 50%)</span>
                        </div>
                    </div>
                )}
             </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium">Cancelar</button>
          <button type="submit" className="px-6 py-2 bg-brand-red text-white font-bold rounded-md hover:bg-red-900 shadow-md transition-all">Publicar Propiedad</button>
        </div>
      </form>
    </div>
  );
};
