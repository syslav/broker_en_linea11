import React, { useState } from 'react';
import { Property, SystemConfig } from '../types';
import { MessageCircle, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  config?: SystemConfig;
  onSaveLead: (name: string, phone: string, property: Property) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ property, isOpen, onClose, config, onSaveLead }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen || !property) return null;

  // Validación estricta: Nombre no vacío y Celular exactamente 9 dígitos numéricos
  const cleanPhone = phone.replace(/\D/g, ''); // Elimina todo lo que no sea número
  const isPhoneValid = cleanPhone.length === 9;
  const isFormValid = name.trim().length > 0 && isPhoneValid;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir solo números y máximo 9 caracteres
    const val = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhone(val);
  };

  const handleContact = () => {
    if (!isFormValid) return;

    // 1. Save Lead to System
    onSaveLead(name, phone, property);

    // 2. Open WhatsApp (Central Broker/Configured Number)
    const baseUrl = window.location.origin; 
    const imageLink = property.imageUrl;

    const message = `Hola, mi nombre es ${name}. Me gustaría más información sobre esta propiedad: ${property.title} (${property.location}). Link referencia: ${imageLink}`;
    
    // Encode for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Use Central Broker Number if available, otherwise property owner (fallback)
    const targetPhone = config?.centralWhatsAppNumber || property.ownerPhone || '51999999999';

    // Open WhatsApp
    window.open(`https://wa.me/${targetPhone}?text=${encodedMessage}`, '_blank');
    
    onClose();
    setName('');
    setPhone('');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-brand-red p-6 text-white text-center relative">
             <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
                <X className="w-6 h-6" />
             </button>
             <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md shadow-inner">
                <MessageCircle className="w-8 h-8 text-white" />
             </div>
             <h3 className="text-xl font-bold">Contactar Anunciante</h3>
             <p className="text-white/80 text-sm mt-1">Completa tus datos para iniciar el chat.</p>
        </div>

        {/* Property Preview */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
             <img src={property.imageUrl} alt="prop" className="w-16 h-16 rounded-lg object-cover shadow-sm" />
             <div>
                 <p className="font-bold text-sm text-gray-800 line-clamp-1">{property.title}</p>
                 <p className="text-xs text-gray-500">{property.location}</p>
                 <p className="text-xs font-bold text-brand-red mt-1">{property.currency} {property.price.toLocaleString()}</p>
             </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tu Nombre Completo</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all"
                    placeholder="Ej. Juan Pérez"
                    autoFocus
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex justify-between">
                    <span>Tu número de WhatsApp</span>
                    <span className={`text-[10px] ${isPhoneValid ? 'text-green-600' : 'text-gray-400'}`}>
                        {cleanPhone.length} / 9 dígitos
                    </span>
                </label>
                <div className="relative">
                    <input 
                        type="tel" 
                        value={phone}
                        onChange={handlePhoneChange}
                        className={`w-full border rounded-lg p-3 text-sm outline-none transition-all ${
                            phone.length > 0 && !isPhoneValid 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-300 focus:border-brand-gold focus:ring-brand-gold'
                        }`}
                        placeholder="Ej. 999888777"
                    />
                    {isPhoneValid && (
                        <CheckCircle2 className="absolute right-3 top-3 w-4 h-4 text-green-500 animate-in zoom-in" />
                    )}
                    {phone.length > 0 && !isPhoneValid && (
                         <AlertCircle className="absolute right-3 top-3 w-4 h-4 text-red-400" />
                    )}
                </div>
                {phone.length > 0 && !isPhoneValid && (
                    <p className="text-[10px] text-red-500 mt-1 font-medium">Debes ingresar exactamente 9 dígitos.</p>
                )}
            </div>

            <button 
                onClick={handleContact}
                disabled={!isFormValid}
                className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg duration-300
                    ${isFormValid 
                        ? 'bg-[#25D366] hover:bg-[#20bd5a] hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer' 
                        : 'bg-gray-300 cursor-not-allowed opacity-70'
                    }`}
            >
                <MessageCircle className={`w-5 h-5 ${isFormValid ? 'animate-pulse' : ''}`} />
                {isFormValid ? 'Abrir WhatsApp' : 'Completa los datos'}
            </button>
            
            <p className="text-[10px] text-gray-400 text-center">
                Al hacer clic, se guardarán tus datos y se abrirá WhatsApp Web/App para contactar al Broker.
            </p>
        </div>

      </div>
    </div>
  );
};