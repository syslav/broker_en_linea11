
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { UserPlus, Save, ArrowLeft, Shield, Briefcase } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: User) => void;
  onBack: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onBack }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  
  // New User Form State
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    role: UserRole.INTERNAL_AGENT,
    phoneNumber: '',
    about: '',
    experience: '1 año'
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name) return;

    const user: User = {
      id: `u_gen_${Date.now()}`,
      name: newUser.name || 'Nuevo Usuario',
      role: newUser.role || UserRole.INTERNAL_AGENT,
      avatar: `https://i.pravatar.cc/300?u=${Date.now()}`,
      phoneNumber: newUser.phoneNumber || '',
      about: newUser.about || 'Agente inmobiliario',
      experience: newUser.experience,
      dealStats: { rented: 0, sold: 0 },
      motivationThreshold: 1.5
    };

    onAddUser(user);
    // Reset and go back to list
    setNewUser({ name: '', role: UserRole.INTERNAL_AGENT, phoneNumber: '', about: '', experience: '1 año' });
    setActiveTab('list');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
           <button onClick={onBack} className="text-sm font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-2">
               <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
           </button>
           <h2 className="text-2xl font-black text-gray-900">Gestión de Usuarios</h2>
           <p className="text-gray-500 text-sm">Administra el acceso y crea nuevos agentes para tu equipo.</p>
        </div>
        {activeTab === 'list' && (
             <button 
                onClick={() => setActiveTab('create')}
                className="bg-brand-red text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:bg-red-800 transition flex items-center gap-2"
             >
                 <UserPlus className="w-5 h-5" /> Crear Usuario
             </button>
        )}
      </div>

      {activeTab === 'list' ? (
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                          <tr>
                              <th className="px-6 py-4">Usuario</th>
                              <th className="px-6 py-4">Rol</th>
                              <th className="px-6 py-4">Estadísticas</th>
                              <th className="px-6 py-4">Estado</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {users.filter(u => u.role !== UserRole.PUBLIC).map(u => (
                              <tr key={u.id} className="hover:bg-gray-50 transition">
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                          <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                                          <div>
                                              <p className="font-bold text-gray-900">{u.name}</p>
                                              <p className="text-xs text-gray-400">ID: {u.id}</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                          u.role === UserRole.BROKER ? 'bg-black text-brand-gold border-black' :
                                          u.role === UserRole.INTERNAL_AGENT ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                          u.role === UserRole.EXTERNAL_AGENT ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                          'bg-gray-100 text-gray-600'
                                      }`}>
                                          {u.role.replace('_', ' ')}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-xs text-gray-600">
                                      <div>{u.dealStats?.sold || 0} Ventas</div>
                                      <div>{u.dealStats?.rented || 0} Alquileres</div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div> Activo
                                      </span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 p-6 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center text-white">
                      <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                      <h3 className="font-bold text-lg text-gray-900">Registrar Nuevo Miembro</h3>
                      <p className="text-xs text-gray-500">Completa los datos para dar de alta a un nuevo usuario.</p>
                  </div>
              </div>
              
              <form onSubmit={handleCreate} className="p-8 space-y-6">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Completo</label>
                      <input 
                        type="text" 
                        required
                        className="w-full border p-3 rounded-lg focus:border-brand-gold outline-none"
                        value={newUser.name}
                        onChange={e => setNewUser({...newUser, name: e.target.value})}
                        placeholder="Ej. Ana García"
                      />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Rol del Sistema
                          </label>
                          <select 
                            className="w-full border p-3 rounded-lg focus:border-brand-gold outline-none bg-white"
                            value={newUser.role}
                            onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                          >
                              <option value={UserRole.INTERNAL_AGENT}>Agente Interno</option>
                              <option value={UserRole.EXTERNAL_AGENT}>Agente Externo</option>
                              <option value={UserRole.BROKER}>Co-Broker (Admin)</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" /> Experiencia
                          </label>
                          <input 
                            type="text" 
                            className="w-full border p-3 rounded-lg focus:border-brand-gold outline-none"
                            value={newUser.experience}
                            onChange={e => setNewUser({...newUser, experience: e.target.value})}
                            placeholder="Ej. 2 años"
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono (WhatsApp)</label>
                      <input 
                        type="text" 
                        className="w-full border p-3 rounded-lg focus:border-brand-gold outline-none"
                        value={newUser.phoneNumber}
                        onChange={e => setNewUser({...newUser, phoneNumber: e.target.value})}
                        placeholder="51999..."
                      />
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio / Descripción</label>
                      <textarea 
                        rows={3}
                        className="w-full border p-3 rounded-lg focus:border-brand-gold outline-none"
                        value={newUser.about}
                        onChange={e => setNewUser({...newUser, about: e.target.value})}
                        placeholder="Breve descripción profesional..."
                      />
                  </div>

                  <div className="pt-4 flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => setActiveTab('list')}
                        className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                      >
                          Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 py-3 bg-brand-black text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2"
                      >
                          <Save className="w-4 h-4" /> Guardar Usuario
                      </button>
                  </div>
              </form>
          </div>
      )}
    </div>
  );
};
