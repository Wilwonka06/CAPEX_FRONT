import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import * as XLSX from 'xlsx';

// Espera un prop: data = [{ day: '01', productos: 10000, servicios: 5000 }, ...]
const MonthlySalesChart = ({ data }) => {
  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(data.map(row => ({
      Día: row.day,
      Productos: row.productos,
      Servicios: row.servicios
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ResumenDiario');
    XLSX.writeFile(wb, 'resumen_diario_mes.xlsx');
  };
  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-[#FACC15] hover:bg-yellow-400 text-[#1E1E1E] rounded-lg shadow-md transition-all duration-300 hover:scale-105 font-semibold text-sm"
          title="Descargar resumen diario del mes seleccionado"
        >
          <i className="bi bi-download text-sm"></i>
          <span>Descargar</span>
        </button>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
          <XAxis
            dataKey="day"
            tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          <YAxis
            tickFormatter={v => `$${v.toLocaleString('es-CO')}`}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          <Tooltip
            formatter={(v, name) => [`$${v.toLocaleString('es-CO')}`, name]}
            labelFormatter={l => `Día ${l}`}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              color: '#1E1E1E',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
          />
          <Bar dataKey="productos" name="Productos" fill="#FACC15" radius={[4, 4, 0, 0]} opacity={0.9} />
          <Bar dataKey="servicios" name="Servicios" fill="#1E1E1E" radius={[4, 4, 0, 0]} opacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlySalesChart; 