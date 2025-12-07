
import React, { useState, useRef } from 'react';
import { SystemConfig } from '../types';
import { Save, Image, Type, Share2, Rocket, Settings2, Phone, Upload, Trash2 } from 'lucide-react';

interface SystemConfigFormProps {
  config: SystemConfig;
  onSave: (config: SystemConfig) => void;
  onCancel: () => void;
}

export const SystemConfigForm: React.FC<SystemConfigFormProps> = ({ config, onSave, onCancel }) => {
  const [formData, setFormData] = useState<SystemConfig>({ ...config });
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof SystemConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (network: keyof SystemConfig['socialLinks'], value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [network]: value
      }
    }));
  };

  const handleBannerImageChange = (index: number, value: string) => {
    const newImages = [...formData.bannerImages];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, bannerImages: newImages }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          handleChange('logoUrl', reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in duration-300">
      <div className="bg-brand-black text-white p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
            <Rocket className="w-5 h-5 text-brand-gold" /> Configuración del Sistema
        </h2>
        <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-brand-gold">Modo Master</span>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        
        {/* Branding Section */}
        <section>
            <h3 className="flex items-center gap-2 font-bold text-gray-800 text-lg mb-4 pb-2 border-b border-gray-100">
                <Rocket className="w-5 h-5 text-brand-red" /> Identidad Visual
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de Marca</label>
                    <input type="text" value={formData.brandName} onChange={e => handleChange('brandName', e.target.value)} className="w-full border p-2 rounded focus:border-brand-gold outline-none" />
                </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subtítulo de Marca</label>
                    <input type="text" value={formData.brandSubtitle} onChange={e => handleChange('brandSubtitle', e.target.value)} className="w-full border p-2 rounded focus:border-brand-gold outline-none" />
                </div>
                
                {/* Logo Upload Section */}
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Logo del Sistema</label>
                    <div className="flex items-center gap-6">
                        {/* Logo Preview */}
                        <div className="w-20 h-20 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                            {formData.logoUrl ? (
                                <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Rocket className="w-8 h-8 text-gray-300" />
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex-1 space-y-3">
                            <div className="flex gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => logoInputRef.current?.click()}
                                    className="bg-brand-black text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition"
                                >
                                    <Upload className="w-3 h-3" /> Cargar Logo
                                </button>
                                {formData.logoUrl && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleChange('logoUrl', '')}
                                        className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-red-200 transition"
                                    >
                                        <Trash2 className="w-3 h-3" /> Eliminar
                                    </button>
                                )}
                            </div>
                            
                            <input 
                                type="file" 
                                ref={logoInputRef} 
                                onChange={handleLogoUpload} 
                                className="hidden" 
                                accept="image/*"
                            />
                            
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="O pega una URL de imagen aquí..." 
                                    value={formData.logoUrl} 
                                    onChange={e => handleChange('logoUrl', e.target.value)} 
                                    className="w-full border p-2 rounded text-xs text-gray-600 focus:border-brand-gold outline-none bg-white" 
                                />
                            </div>
                            <p className="text-[10px] text-gray-400">Recomendado: Imagen cuadrada (PNG/JPG), mín 200x200px.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL Favicon</label>
                    <input type="text" placeholder="https://..." value={formData.faviconUrl} onChange={e => handleChange('faviconUrl', e.target.value)} className="w-full border p-2 rounded focus:border-brand-gold outline-none text-sm" />
                </div>
            </div>
        </section>

        {/* Property & Leads Configuration */}
        <section>
             <h3 className="flex items-center gap-2 font-bold text-gray-800 text-lg mb-4 pb-2 border-b border-gray-100">
                <Settings2 className="w-5 h-5 text-brand-red" /> Configuración Operativa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Máximo de Imágenes en Galería</label>
                    <input 
                        type="number" 
                        min="1" 
                        max="20"
                        value={formData.maxGalleryImages} 
                        onChange={e => handleChange('maxGalleryImages', parseInt(e.target.value))} 
                        className="w-full border p-2 rounded focus:border-brand-gold outline-none font-bold text-gray-800" 
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Límite visual para el usuario final.</p>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> WhatsApp Central (Broker)
                    </label>
                    <input 
                        type="text" 
                        placeholder="51999888777"
                        value={formData.centralWhatsAppNumber} 
                        onChange={e => handleChange('centralWhatsAppNumber', e.target.value)} 
                        className="w-full border p-2 rounded focus:border-brand-gold outline-none font-bold text-brand-red" 
                    />
                    <p className="text-[10px] text-gray-400 mt-1">A este número llegarán todos los contactos iniciales.</p>
                </div>
            </div>
        </section>

        {/* Banner Section */}
        <section>
             <h3 className="flex items-center gap-2 font-bold text-gray-800 text-lg mb-4 pb-2 border-b border-gray-100">
                <Image className="w-5 h-5 text-brand-red" /> Banner Principal
            </h3>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título Principal</label>
                        <input type="text" value={formData.bannerTitle} onChange={e => handleChange('bannerTitle', e.target.value)} className="w-full border p-2 rounded focus:border-brand-gold outline-none font-bold" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subtítulo (Descripción)</label>
                        <textarea rows={2} value={formData.bannerSubtitle} onChange={e => handleChange('bannerSubtitle', e.target.value)} className="w-full border p-2 rounded focus:border-brand-gold outline-none text-sm" />
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-gray-700">Imágenes del Banner (Carrusel)</label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={formData.enableCarousel} 
                                onChange={e => handleChange('enableCarousel', e.target.checked)}
                                className="w-4 h-4 text-brand-red rounded focus:ring-brand-red"
                            />
                            <span className="text-xs font-bold text-gray-500 uppercase">Activar Carrusel</span>
                        </label>
                    </div>
                    <div className="space-y-3">
                        {formData.bannerImages.map((img, idx) => (
                            <div key={idx} className="flex gap-3 items-center">
                                <span className="text-xs font-bold text-gray-400 w-6">#{idx + 1}</span>
                                <input 
                                    type="text" 
                                    placeholder={`URL Imagen ${idx + 1}`}
                                    value={img} 
                                    onChange={e => handleBannerImageChange(idx, e.target.value)} 
                                    className="flex-1 border p-2 rounded text-sm focus:border-brand-gold outline-none" 
                                />
                                {img && <img src={img} alt="Preview" className="w-10 h-10 object-cover rounded border border-gray-300" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* Social Media */}
        <section>
             <h3 className="flex items-center gap-2 font-bold text-gray-800 text-lg mb-4 pb-2 border-b border-gray-100">
                <Share2 className="w-5 h-5 text-brand-red" /> Redes Sociales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Facebook URL</label>
                    <input type="text" value={formData.socialLinks.facebook} onChange={e => handleSocialChange('facebook', e.target.value)} className="w-full border p-2 rounded focus:border-brand-gold outline-none text-sm" />
                </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instagram URL</label>
                    <input type="text" value={formData.socialLinks.instagram} onChange={e => handleSocialChange('instagram', e.target.value)} className="w-full border p-2 rounded focus:border-brand-gold outline-none text-sm" />
                </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">TikTok URL</label>
                    <input type="text" value={formData.socialLinks.tiktok} onChange={e => handleSocialChange('tiktok', e.target.value)} className="w-full border p-2 rounded focus:border-brand-gold outline-none text-sm" />
                </div>
            </div>
        </section>

        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={onCancel} className="px-6 py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
            <button type="submit" className="px-6 py-3 rounded-lg font-bold text-white bg-brand-red hover:bg-red-900 shadow-lg flex items-center gap-2">
                <Save className="w-4 h-4" /> Guardar Cambios
            </button>
        </div>

      </form>
    </div>
  );
};
