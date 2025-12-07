
import React from 'react';
import { Plan } from '../types';
import { Check, Star } from 'lucide-react';

interface PricingPlansProps {
  plans: Plan[];
  onSelectPlan: (plan: Plan) => void;
  onCancel: () => void;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ plans, onSelectPlan, onCancel }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-8 duration-500">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Elige el plan ideal para tu propiedad</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
                Selecciona la opción que mejor se adapte a tus necesidades de visibilidad y velocidad de venta.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {plans.map(plan => (
                <div 
                    key={plan.id} 
                    className={`relative bg-white rounded-2xl transition-all duration-300 flex flex-col h-full
                        ${plan.isRecommended 
                            ? 'shadow-2xl border-2 border-brand-gold scale-105 z-10' 
                            : 'shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1'
                        }
                    `}
                >
                    {plan.isRecommended && (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand-gold text-black font-black text-xs uppercase px-4 py-1.5 rounded-full shadow-md flex items-center gap-1">
                            <Star className="w-3 h-3 fill-black" /> Recomendado
                        </div>
                    )}

                    <div className="p-8 text-center border-b border-gray-50">
                        <h3 className="font-bold text-gray-800 text-lg uppercase tracking-wide mb-2" style={{color: plan.color}}>{plan.name}</h3>
                        <div className="flex items-center justify-center gap-1 mb-2">
                            <span className="text-4xl font-black text-gray-900">{plan.currency === 'USD' ? '$' : 'S/'}{plan.price}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                            por {plan.durationDays} días
                        </span>
                    </div>

                    <div className="p-8 flex-1">
                        <ul className="space-y-4">
                            {plan.features.map((feat, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                    <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-green-600" />
                                    </div>
                                    <span className="font-medium">{feat}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-8 pt-0 mt-auto">
                        <button 
                            onClick={() => onSelectPlan(plan)}
                            className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl
                                ${plan.isRecommended 
                                    ? 'bg-brand-red text-white hover:bg-red-800' 
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                                }
                            `}
                        >
                            Seleccionar Plan
                        </button>
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-12 text-center">
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 font-bold text-sm underline">
                Cancelar y volver
            </button>
        </div>
    </div>
  );
};