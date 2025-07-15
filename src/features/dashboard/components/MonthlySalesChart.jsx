import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

// Espera un prop: data = [{ day: '01', productos: 10000, servicios: 5000 }, ...]
const MonthlySalesChart = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fill: '#333', fontWeight: 500 }} />
          <YAxis tickFormatter={v => `$${v.toLocaleString('es-CO')}`} tick={{ fill: '#333' }} />
          <Tooltip formatter={v => `$${v.toLocaleString('es-CO')}`} labelFormatter={l => `Día ${l}`} />
          <Legend />
          <Bar dataKey="productos" name="Productos" fill="#FFD700" radius={[4, 4, 0, 0]} />
          <Bar dataKey="servicios" name="Servicios" fill="#111" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlySalesChart; 