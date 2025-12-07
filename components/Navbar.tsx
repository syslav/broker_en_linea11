import React, { useState } from 'react';
import { User, UserRole, SystemConfig, Notification } from '../types';
import { MOCK_USERS } from '../constants';
import { Menu, User as UserIcon, Bell, Users, Rocket, Handshake, Building2, CheckCheck, Calendar, LayoutDashboard, UserPlus, LogOut } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onUserSwitch: (user: User) => void;
  onNavigate: (page: string) => void;
  onLoginClick: () => void;
  systemConfig: SystemConfig;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onUserSwitch, onNavigate, onLoginClick, systemConfig, notifications, onMarkAsRead }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif: Notification) => {
      onMarkAsRead(notif.id);
      // Optional: Navigate to property if ID exists
  };

  const getTimeAgo = (timestamp: number) => {
      const minutes = Math.floor((Date.now() - timestamp) / 60000);
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h`;
      return `${Math.floor(hours / 24)}d`;
  };

  return (
    <nav className="bg-white text-gray-800 sticky top-0 z-50 shadow-sm font-sans border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          {/* Logo & Left Links */}
          <div className="flex items-center gap-10">
            <div className="flex items-center cursor-pointer group gap-3" onClick={() => onNavigate('home')}>
                {/* Dynamic Logo Implementation */}
                {systemConfig.logoUrl ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300 border-2 border-brand-red flex items-center justify-center bg-white">
                        <img src={systemConfig.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 border-2 border-brand-red">
                        <Rocket className="w-7 h-7 text-brand-red fill-brand-red" />
                    </div>
                )}
                
                <div className="flex flex-col justify-center">
                    <h1 className="text-3xl font-black tracking-tighter text-brand-red leading-none uppercase">{systemConfig.brandName}</h1>
                    <span className="text-sm font-bold text-brand-gold tracking-[0.2em] uppercase leading-none">{systemConfig.brandSubtitle}</span>
                </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6 text-sm font-bold text-gray-600">
              <button onClick={() => onNavigate('home')} className="hover:text-brand-red transition-colors uppercase tracking-wide text-xs">Comprar</button>
              <button onClick={() => onNavigate('home')} className="hover:text-brand-red transition-colors uppercase tracking-wide text-xs">Alquilar</button>
              <button className="hover:text-brand-red transition-colors uppercase tracking-wide text-xs">Proyectos</button>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* TEAM BEL Button (Only for Internal/Broker) */}
            {(currentUser.role === UserRole.INTERNAL_AGENT || currentUser.role === UserRole.BROKER) && (
                <button 
                    onClick={() => onNavigate('team-bel')}
                    className="flex items-center gap-1 text-xs font-black bg-brand-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-all shadow-md transform hover:-translate-y-0.5 border border-brand-gold/30"
                >
                   <Calendar className="w-4 h-4 text-brand-gold" /> 
                   <span className="tracking-wide">TEAM BEL</span>
                </button>
            )}

            {/* NOTIFICATIONS */}
            <div className="relative" onMouseLeave={() => setIsNotifOpen(false)}>
                <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors relative ${isNotifOpen ? 'text-brand-red' : 'text-gray-600 hover:text-brand-red'}`}
                >
                   <Bell className="w-5 h-5" /> 
                   {unreadCount > 0 && (
                       <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                           {unreadCount}
                       </span>
                   )}
                   <span className="hidden lg:inline ml-1">Notificaciones</span>
                </button>

                {isNotifOpen && (
                    <div className="absolute right-0 top-full pt-3 w-80 z-50">
                        <div className="bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <span className="text-xs font-bold text-gray-700 uppercase">Tus Notificaciones</span>
                                {unreadCount > 0 && <span className="text-xs text-brand-red font-bold">{unreadCount} nuevas</span>}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length > 0 ? notifications.map(notif => (
                                    <div 
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 flex gap-3 ${notif.read ? 'opacity-60 bg-white' : 'bg-red-50/30'}`}
                                    >
                                        <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${notif.type === 'SHARED_COMMISSION' ? 'bg-green-100 text-green-600' : 'bg-brand-red/10 text-brand-red'}`}>
                                            {notif.type === 'SHARED_COMMISSION' ? <Handshake className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className={`text-sm ${notif.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                                                    {notif.title}
                                                </p>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{getTimeAgo(notif.timestamp)}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                                            {!notif.read && (
                                                <div className="mt-2 flex items-center gap-1 text-[10px] text-brand-red font-bold">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-red"></div> Marcar como leído
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-gray-400 text-sm">
                                        No tienes notificaciones.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <button 
                onClick={() => onNavigate('agents')}
                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-red transition-colors"
            >
               <Users className="w-4 h-4" /> Agentes
            </button>
            
            <div className="h-8 w-px bg-gray-200 mx-2"></div>

            <button 
                onClick={() => currentUser.role !== UserRole.PUBLIC ? onNavigate('dashboard') : onLoginClick()}
                className="text-sm font-bold text-gray-800 hover:text-brand-red transition-colors"
            >
                Publicar Propiedad
            </button>

            {/* User Dropdown / Login */}
            <div className="relative" onMouseLeave={() => setIsUserMenuOpen(false)}>
              {currentUser.role === UserRole.PUBLIC ? (
                 <button 
                  onClick={onLoginClick}
                  className="flex items-center gap-2 bg-brand-red text-white px-6 py-2.5 rounded-full hover:bg-red-900 transition-all font-bold shadow-md transform hover:-translate-y-0.5"
                >
                  Ingresar
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 bg-gray-100 text-brand-red border-2 border-transparent hover:border-brand-red/20 px-4 py-2 rounded-full hover:bg-red-50 transition-all font-bold shadow-sm"
                  >
                    {currentUser.name.split(' ')[0]}
                    <UserIcon className="w-4 h-4" />
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full pt-2 w-72 z-50">
                        <div className="bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 py-1 max-h-96 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Sesión Activa</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p>
                                <p className="text-xs text-brand-red font-medium">{currentUser.role.replace('_', ' ')}</p>
                            </div>
                            
                            {/* 1. Cerrar Sesión (Ahora arriba por solicitud) */}
                            <button
                                onClick={() => { onUserSwitch(MOCK_USERS[0]); setIsUserMenuOpen(false); onNavigate('home'); }}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 font-bold border-b border-gray-100 flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" /> Cerrar Sesión
                            </button>
                            
                            {/* 2. Opciones Administrativas (Debajo de Cerrar Sesión) */}
                            <div className="py-2 border-b border-gray-100 bg-gray-50/50">
                                {currentUser.role !== UserRole.PUBLIC && (
                                    <button 
                                        onClick={() => { onNavigate('dashboard'); setIsUserMenuOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:text-brand-red hover:bg-white transition-colors flex items-center gap-2 font-medium"
                                    >
                                        <LayoutDashboard className="w-4 h-4 text-brand-gold" /> Panel de Gestión
                                    </button>
                                )}
                                
                                {currentUser.role === UserRole.BROKER && (
                                    <button 
                                        onClick={() => { onNavigate('dashboard-users'); setIsUserMenuOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:text-brand-red hover:bg-white transition-colors flex items-center gap-2 font-medium"
                                    >
                                        <UserPlus className="w-4 h-4 text-brand-gold" /> Crear Agentes
                                    </button>
                                )}
                            </div>

                            {/* Dev Tool: Quick Switch */}
                            <div className="pt-2 pb-2">
                                <p className="px-4 text-[10px] text-gray-400 uppercase font-bold mb-2">Cambiar Perfil (Demo)</p>
                                {MOCK_USERS.slice(0, 8).filter(u => u.id !== currentUser.id && u.role !== UserRole.PUBLIC).map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => { onUserSwitch(user); setIsUserMenuOpen(false); }}
                                        className="block w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-brand-red transition-colors flex justify-between"
                                    >
                                        <span>{user.name}</span>
                                        <span className="opacity-50 text-[10px]">{user.role.replace('_', ' ')}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-brand-red focus:outline-none">
              <Menu className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full z-50">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <button onClick={() => onNavigate('home')} className="block px-4 py-3 rounded-lg text-base font-bold text-gray-700 hover:bg-gray-50 hover:text-brand-red w-full text-left">Explorar Propiedades</button>
             <button onClick={() => onNavigate('agents')} className="block px-4 py-3 rounded-lg text-base font-bold text-gray-700 hover:bg-gray-50 hover:text-brand-red w-full text-left">Red de Agentes</button>
            {currentUser.role !== UserRole.PUBLIC && (
               <button onClick={() => onNavigate('dashboard')} className="block px-4 py-3 rounded-lg text-base font-bold text-brand-red bg-red-50 w-full text-left">Panel de Gestión</button>
            )}
            
            {/* Team BEL Mobile Link */}
            {(currentUser.role === UserRole.INTERNAL_AGENT || currentUser.role === UserRole.BROKER) && (
               <button onClick={() => onNavigate('team-bel')} className="block px-4 py-3 rounded-lg text-base font-bold text-white bg-brand-black w-full text-left flex items-center gap-2">
                   <Calendar className="w-4 h-4 text-brand-gold" /> TEAM BEL
               </button>
            )}

            <div className="border-t border-gray-100 my-2 pt-2">
                {currentUser.role === UserRole.PUBLIC ? (
                    <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="block px-4 py-3 rounded-lg text-base font-bold text-white bg-brand-red w-full text-center shadow-md">Ingresar / Registrarse</button>
                ) : (
                    <button onClick={() => { onUserSwitch(MOCK_USERS[0]); setIsMenuOpen(false); }} className="block px-4 py-3 rounded-lg text-base font-bold text-red-600 hover:bg-red-50 w-full text-left">Cerrar Sesión</button>
                )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};