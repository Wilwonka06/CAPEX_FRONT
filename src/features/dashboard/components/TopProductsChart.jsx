import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import * as XLSX from 'xlsx';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { nombre, cantidad, total } = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded shadow border border-gray-200">
        <div className="font-bold text-gray-800">{nombre}</div>
        <div className="text-purple-700 font-semibold">Cantidad: {cantidad}</div>
        <div className="text-gray-700">Total: ${total.toLocaleString('es-CO')}</div>
      </div>
    );
  }
  return null;
};

const TopProductsChart = ({ data }) => {
  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.map(row => ({
      Producto: row.nombre,
      Cantidad: row.cantidad,
      Total: row.total
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TopProductos');
    XLSX.writeFile(wb, 'top_productos_mes.xlsx');
  };

  return (
    <div className="w-full bg-white rounded-lg shadow p-4">
      <div className="flex justify-end mb-2">
        <button
          onClick={handleDownloadExcel}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded shadow transition font-medium text-sm"
        >
          <i className="bi bi-download"></i> Descargar informe
        </button>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
          barCategoryGap={20}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fill: '#333' }} />
          <YAxis dataKey="nombre" type="category" tick={{ fill: '#333', fontWeight: 500 }} width={200} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="cantidad" fill="#a78bfa" radius={[0, 8, 8, 0]}>
            <LabelList dataKey="cantidad" position="right" fill="#111" fontWeight={700} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductsChart; 