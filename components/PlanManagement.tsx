
import React, { useState } from 'react';
import { Plan } from '../types';
import { Plus, Trash2, Edit2, Save, X, Check, CreditCard, Sparkles } from 'lucide-react';

interface PlanManagementProps {
  plans: Plan[];
  onUpdatePlans: (plans: Plan[]) => void;
}

export const PlanManagement: React.FC<PlanManagementProps> = ({ plans, onUpdatePlans }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<Plan>>({
    name: '',
    price: 0,
    currency: 'USD',
    durationDays: 30,
    features: [''],
    isRecommended: false,
    color: '#000000'
  });

  const handleEdit = (plan: Plan) => {
    setEditingPlan({ ...plan });
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditingPlan({
      id: `p_${Date.now()}`,
      name: 'Nuevo Plan',
      price: 0,
      currency: 'USD',
      durationDays: 30,
      features: ['Característica 1'],
      isRecommended: false,
      color: '#A51B0B'
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este plan?')) {
      onUpdatePlans(plans.filter(p => p.id !== id));
    }
  };

  const handleSave = () => {
    if (!editingPlan.name || !editingPlan.id) return;
    
    // Clean features
    const cleanFeatures = editingPlan.features?.filter(f => f.trim() !== '') || [];
    
    const newPlan = { ...editingPlan, features: cleanFeatures } as Plan;
    
    const exists = plans.some(p => p.id === newPlan.id);
    if (exists) {
      onUpdatePlans(plans.map(p => p.id === newPlan.id ? newPlan : p));
    } else {
      onUpdatePlans([...plans, newPlan]);
    }
    setIsEditing(false);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(editingPlan.features || [])];
    newFeatures[index] = value;
    setEditingPlan({ ...editingPlan, features: newFeatures });
  };

  const addFeature = () => {
    setEditingPlan({ ...editingPlan, features: [...(editingPlan.features || []), ''] });
  };

  const removeFeature = (index: number) => {
     setEditingPlan({ ...editingPlan, features: editingPlan.features?.filter((_, i) => i !== index) });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in">
       {/* Header */}
       <div className="bg-brand-black p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-brand-gold" />
              <h2 className="text-xl font-bold">Gestión de Planes de Publicación</h2>
          </div>
          {!isEditing && (
              <button 
                onClick={handleCreate}
                className="bg-brand-red px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-800 transition flex items-center gap-2"
              >
                  <Plus className="w-4 h-4" /> Crear Nuevo Plan
              </button>
          )}
       </div>

       <div className="p-8">
           {isEditing ? (
               <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-3xl mx-auto">
                   <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                       {editingPlan.id && plans.some(p => p.id === editingPlan.id) ? 'Editar Plan' : 'Crear Plan'}
                   </h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                       <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Plan</label>
                           <input 
                              type="text" 
                              value={editingPlan.name} 
                              onChange={e => setEditingPlan({...editingPlan, name: e.target.value})}
                              className="w-full border p-2 rounded focus:border-brand-gold outline-none"
                           />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Color (Hex)</label>
                           <div className="flex gap-2">
                               <input 
                                  type="color" 
                                  value={editingPlan.color} 
                                  onChange={e => setEditingPlan({...editingPlan, color: e.target.value})}
                                  className="h-10 w-12 border p-0 rounded cursor-pointer"
                               />
                               <input 
                                  type="text" 
                                  value={editingPlan.color} 
                                  onChange={e => setEditingPlan({...editingPlan, color: e.target.value})}
                                  className="flex-1 border p-2 rounded focus:border-brand-gold outline-none uppercase"
                               />
                           </div>
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Precio</label>
                           <div className="flex gap-2">
                               <input 
                                  type="number" 
                                  value={editingPlan.price} 
                                  onChange={e => setEditingPlan({...editingPlan, price: parseFloat(e.target.value)})}
                                  className="flex-1 border p-2 rounded focus:border-brand-gold outline-none"
                               />
                               <select 
                                  value={editingPlan.currency}
                                  onChange={e => setEditingPlan({...editingPlan, currency: e.target.value as 'USD' | 'PEN'})}
                                  className="border p-2 rounded bg-white"
                               >
                                   <option value="USD">USD</option>
                                   <option value="PEN">PEN</option>
                               </select>
                           </div>
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duración (Días)</label>
                           <input 
                              type="number" 
                              value={editingPlan.durationDays} 
                              onChange={e => setEditingPlan({...editingPlan, durationDays: parseInt(e.target.value)})}
                              className="w-full border p-2 rounded focus:border-brand-gold outline-none"
                           />
                       </div>
                   </div>

                   <div className="mb-6">
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Características (Items)</label>
                       <div className="space-y-2">
                           {editingPlan.features?.map((feat, idx) => (
                               <div key={idx} className="flex gap-2">
                                   <input 
                                      type="text"
                                      value={feat}
                                      onChange={e => handleFeatureChange(idx, e.target.value)}
                                      className="flex-1 border p-2 rounded text-sm focus:border-brand-gold outline-none"
                                      placeholder="Ej. Visibilidad Premium"
                                   />
                                   <button onClick={() => removeFeature(idx)} className="text-red-400 hover:text-red-600">
                                       <Trash2 className="w-4 h-4" />
                                   </button>
                               </div>
                           ))}
                           <button onClick={addFeature} className="text-xs font-bold text-brand-red flex items-center gap-1 mt-2 hover:underline">
                               <Plus className="w-3 h-3" /> Agregar Item
                           </button>
                       </div>
                   </div>

                   <div className="mb-6">
                       <label className="flex items-center gap-2 cursor-pointer bg-white p-3 border rounded-lg">
                           <input 
                              type="checkbox"
                              checked={editingPlan.isRecommended}
                              onChange={e => setEditingPlan({...editingPlan, isRecommended: e.target.checked})}
                              className="w-4 h-4 text-brand-gold rounded focus:ring-brand-gold"
                           />
                           <span className="font-bold text-gray-700 text-sm">Marcar como "Recomendado"</span>
                       </label>
                   </div>

                   <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                       <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                       <button onClick={handleSave} className="px-6 py-2 bg-brand-black text-white font-bold rounded-lg hover:bg-gray-800 flex items-center gap-2">
                           <Save className="w-4 h-4" /> Guardar Plan
                       </button>
                   </div>
               </div>
           ) : (
               /* List View */
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {plans.map(plan => (
                       <div key={plan.id} className="border border-gray-200 rounded-2xl p-6 relative group hover:shadow-xl transition-all bg-white flex flex-col">
                           {plan.isRecommended && (
                               <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand-gold text-black text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
                                   Más Popular
                               </div>
                           )}
                           
                           <div className="flex justify-between items-start mb-4">
                               <div>
                                   <h3 className="font-bold text-xl text-gray-900">{plan.name}</h3>
                                   <div className="flex items-baseline gap-1 mt-1">
                                       <span className="text-2xl font-black text-brand-red">{plan.currency === 'USD' ? '$' : 'S/'}{plan.price}</span>
                                       <span className="text-sm text-gray-500 font-medium">/ {plan.durationDays} días</span>
                                   </div>
                               </div>
                               <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: `${plan.color}20`}}>
                                   <Sparkles className="w-4 h-4" style={{color: plan.color}} />
                               </div>
                           </div>

                           <ul className="space-y-3 mb-6 flex-1">
                               {plan.features.map((feat, i) => (
                                   <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                       <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                       <span>{feat}</span>
                                   </li>
                               ))}
                           </ul>

                           <div className="flex gap-2 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => handleEdit(plan)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-1">
                                   <Edit2 className="w-3 h-3" /> Editar
                               </button>
                               <button onClick={() => handleDelete(plan.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition">
                                   <Trash2 className="w-4 h-4" />
                               </button>
                           </div>
                       </div>
                   ))}
               </div>
           )}
       </div>
    </div>
  );
};