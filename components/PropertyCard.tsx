import React from 'react';
import { Property, UserRole } from '../types';
import { Bed, Bath, Maximize, UserCheck, Handshake, MapPin, Camera } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  currentUserRole: UserRole;
  onAction: (propertyId: string, action: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, currentUserRole, onAction }) => {
  
  const showAgentSupportBadge = (currentUserRole === UserRole.INTERNAL_AGENT || currentUserRole === UserRole.BROKER) && property.isAgentSupport;
  const showSharedCommissionBadge = (currentUserRole === UserRole.INTERNAL_AGENT || currentUserRole === UserRole.EXTERNAL_AGENT || currentUserRole === UserRole.BROKER) && property.isSharedCommission;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 group flex flex-col h-full">
      <div 
        className="relative h-56 overflow-hidden cursor-pointer"
        onClick={() => onAction(property.id, 'view')} // Trigger view action
      >
        <img 
          src={property.imageUrl} 
          alt={property.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm z-10">
          {property.type === 'SALE' ? 'Venta' : 'Alquiler'}
        </div>
        
        {/* Gallery Indicator */}
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 hover:bg-black/70 transition-colors z-10">
            <Camera className="w-3 h-3" /> {property.images?.length || 1}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white font-bold text-lg">{property.currency} {property.price.toLocaleString()}</p>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Badges for Agents/Brokers */}
        <div className="flex flex-wrap gap-2 mb-3 min-h-[24px]">
          {showAgentSupportBadge && (
            <span className="inline-flex items-center gap-1 bg-brand-gold/20 text-yellow-700 border border-brand-gold text-[10px] font-bold px-2 py-1 rounded">
              <UserCheck className="w-3 h-3" /> Apoyo Agente ({property.agentSupportPercentage}%)
            </span>
          )}
          {showSharedCommissionBadge && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-1 rounded">
              <Handshake className="w-3 h-3" /> Comisión Compartida
            </span>
          )}
        </div>

        <h3 
            className="font-bold text-gray-900 mb-1 truncate hover:text-brand-red cursor-pointer"
            onClick={() => onAction(property.id, 'view')}
        >
            {property.title}
        </h3>
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin className="w-3 h-3 mr-1" />
          {property.location}
        </div>

        <div className="flex items-center justify-between text-gray-600 text-sm mb-4 py-3 border-t border-b border-gray-100">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" /> <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" /> <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4" /> <span>{property.area} m²</span>
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <button 
            onClick={() => onAction(property.id, 'contact')}
            className="flex-1 bg-brand-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
          >
            Contactar
          </button>
          {(currentUserRole === UserRole.BROKER && property.isAgentSupport && !property.assignedAgentId) && (
             <button 
             onClick={() => onAction(property.id, 'assign')}
             className="flex-1 bg-brand-gold text-black py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition-colors shadow-sm"
           >
             Asignar
           </button>
          )}
        </div>
      </div>
    </div>
  );
};