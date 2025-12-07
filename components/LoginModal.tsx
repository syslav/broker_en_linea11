import React from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../constants';
import { UserCircle2, KeyRound, Building2, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProfile: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSelectProfile }) => {
  if (!isOpen) return null;

  // Mapping UI cards to specific mock users for the demo
  const handleSelection = (type: 'OWNER' | 'AGENT' | 'BROKER') => {
    let selectedUser;
    
    switch (type) {
        case 'OWNER':
            // Select Carlos (Owner)
            selectedUser = MOCK_USERS.find(u => u.role === UserRole.OWNER);
            break;
        case 'AGENT':
            // Select Luis (External Agent/Corredor)
            selectedUser = MOCK_USERS.find(u => u.role === UserRole.EXTERNAL_AGENT);
            break;
        case 'BROKER':
            // Select Master Broker (Constructora/Desarrolladora equivalent for demo)
            selectedUser = MOCK_USERS.find(u => u.role === UserRole.BROKER);
            break;
    }

    if (selectedUser) {
        onSelectProfile(selectedUser);
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 bg-gray-100 rounded-full transition-colors"
        >
            <X className="w-6 h-6" />
        </button>

        <div className="text-center pt-12 pb-8 px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">¿Con qué perfil te identificas?</h2>
            <p className="text-gray-500">Selecciona el que se ajusta a tus intereses.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 md:p-12 bg-gray-50/50">
            
            {/* Card 1: Particular */}
            <button 
                onClick={() => handleSelection('OWNER')}
                className="group bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-brand-red transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <div className="mb-6 p-4 bg-gray-50 rounded-full group-hover:bg-red-50 transition-colors">
                    <UserCircle2 className="w-12 h-12 text-gray-700 group-hover:text-brand-red transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Particular</h3>
                <p className="text-sm text-gray-500 font-medium">Dueño Directo</p>
            </button>

            {/* Card 2: Inmobiliaria */}
            <button 
                onClick={() => handleSelection('AGENT')}
                className="group bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-brand-red transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <div className="mb-6 p-4 bg-gray-50 rounded-full group-hover:bg-red-50 transition-colors">
                    <KeyRound className="w-12 h-12 text-gray-700 group-hover:text-brand-red transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Inmobiliaria</h3>
                <p className="text-sm text-gray-500 font-medium">Corredor</p>
            </button>

            {/* Card 3: Constructora */}
            <button 
                onClick={() => handleSelection('BROKER')}
                className="group bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-brand-red transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <div className="mb-6 p-4 bg-gray-50 rounded-full group-hover:bg-red-50 transition-colors">
                    <Building2 className="w-12 h-12 text-gray-700 group-hover:text-brand-red transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Constructora</h3>
                <p className="text-sm text-gray-500 font-medium">Desarrolladora</p>
            </button>

        </div>
        
        <div className="text-center py-6 bg-white border-t border-gray-100">
            <p className="text-xs text-gray-400">
                Al ingresar aceptas nuestros <span className="underline cursor-pointer hover:text-brand-red">Términos y Condiciones</span>
            </p>
        </div>
      </div>
    </div>
  );
};
