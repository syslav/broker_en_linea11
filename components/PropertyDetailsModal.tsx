

import React, { useState } from 'react';
import { Property, SystemConfig } from '../types';
import { X, ChevronLeft, ChevronRight, MapPin, Bed, Bath, Maximize, User, Phone, Video, PawPrint } from 'lucide-react';

interface PropertyDetailsModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onContact: () => void;
  config: SystemConfig;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({ property, isOpen, onClose, onContact, config }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !property) return null;

  // Limit images based on Broker configuration
  const displayImages = property.images ? property.images.slice(0, config.maxGalleryImages) : [property.imageUrl];

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleOpenVideo = () => {
      if (property.videoUrl) {
          window.open(property.videoUrl, '_blank');
      }
  };

  const getPetText = (policy: string) => {
      switch(policy) {
          case 'NO_PETS': return 'No se permiten';
          case 'SMALL_PETS': return 'Sí (Pequeñas)';
          case 'LARGE_PETS': return 'Sí (Grandes)';
          default: return 'Consultar';
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 z-50 text-white hover:text-brand-red p-2 bg-black/50 rounded-full transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT: GALLERY (70%) */}
        <div className="w-full md:w-[70%] h-[50vh] md:h-full relative flex flex-col justify-center bg-black">
           
           {/* Main Image */}
           <div className="relative flex-1 flex items-center justify-center p-4">
              <img 
                src={displayImages[currentImageIndex]} 
                alt={`Vista ${currentImageIndex + 1}`} 
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
              />
              
              {/* Navigation Arrows */}
              {displayImages.length > 1 && (
                  <>
                    <button onClick={handlePrev} className="absolute left-4 bg-black/50 text-white p-2 rounded-full hover:bg-brand-red transition-colors">
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button onClick={handleNext} className="absolute right-4 bg-black/50 text-white p-2 rounded-full hover:bg-brand-red transition-colors">
                        <ChevronRight className="w-8 h-8" />
                    </button>
                  </>
              )}
              
              {/* Video Overlay Button (If video exists) */}
              {property.videoUrl && (
                  <button 
                    onClick={handleOpenVideo}
                    className="absolute bottom-8 right-8 bg-brand-red/90 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-600 transition-all shadow-lg hover:scale-105 z-20 animate-pulse"
                  >
                      <Video className="w-5 h-5" /> Ver Video del Recorrido
                  </button>
              )}
           </div>

           {/* Thumbnails */}
           {displayImages.length > 1 && (
               <div className="h-24 bg-black/80 flex items-center gap-2 overflow-x-auto p-4 justify-center">
                   {displayImages.map((img, idx) => (
                       <button 
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-20 h-16 rounded overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-brand-gold scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                       >
                           <img src={img} alt="thumb" className="w-full h-full object-cover" />
                       </button>
                   ))}
               </div>
           )}
        </div>

        {/* RIGHT: DETAILS (30%) */}
        <div className="w-full md:w-[30%] bg-white h-full overflow-y-auto p-8 relative">
            <span className="inline-block px-3 py-1 bg-brand-red text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                {property.type === 'SALE' ? 'En Venta' : 'En Alquiler'}
            </span>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{property.title}</h2>
            
            <div className="flex items-center text-gray-500 mb-6 text-sm">
                <MapPin className="w-4 h-4 mr-1 text-brand-red" /> {property.location}
            </div>

            <div className="text-3xl font-black text-gray-900 mb-8 border-b border-gray-100 pb-6">
                {property.currency} {property.price.toLocaleString()}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 text-center">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Bed className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                    <span className="block font-bold text-gray-800">{property.bedrooms}</span>
                    <span className="text-[10px] text-gray-500 uppercase">Hab.</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Bath className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                    <span className="block font-bold text-gray-800">{property.bathrooms}</span>
                    <span className="text-[10px] text-gray-500 uppercase">Baños</span>
                </div>
                 <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <Maximize className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                    <span className="block font-bold text-gray-800">{property.area}</span>
                    <span className="text-[10px] text-gray-500 uppercase">m²</span>
                </div>
                 <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <PawPrint className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                    <span className="block font-bold text-gray-800 text-xs">{getPetText(property.petsPolicy || 'NO_PETS')}</span>
                    <span className="text-[10px] text-gray-500 uppercase">Mascotas</span>
                </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase">Descripción</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
                {property.description}
            </p>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8 flex items-center gap-4">
                 <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    <User className="w-6 h-6" />
                 </div>
                 <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">Publicado por</p>
                     <p className="font-bold text-gray-900">{property.ownerName}</p>
                 </div>
            </div>

            <button 
                onClick={onContact}
                className="w-full bg-brand-black text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group"
            >
                <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" /> Contactar Ahora
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
                ID de Propiedad: {property.id}
            </p>
        </div>
      </div>
    </div>
  );
};
