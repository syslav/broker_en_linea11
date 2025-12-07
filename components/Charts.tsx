import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Property } from '../types';

interface ChartsProps {
  properties: Property[];
}

export const AnalyticsCharts: React.FC<ChartsProps> = ({ properties }) => {
  const data = properties.map(p => ({
    name: p.title.substring(0, 15) + '...',
    "Vistas": p.stats.views,
    "Apariciones": p.stats.searchAppearances,
    "Contactos": p.stats.contacts
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-6 border-l-4 border-brand-gold pl-3">Análisis de Rendimiento</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{fontSize: 12}} />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', border: 'none', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="Vistas" fill="#A51B0B" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Apariciones" fill="#FFC40C" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Contactos" fill="#000000" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};