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
    <div className="w-full h-80">
      <div className="flex justify-end mb-2">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-1 bg-primary hover:bg-primary-dark text-white rounded shadow transition-all duration-300 hover:scale-105 font-medium text-xs"
          title="Descargar resumen diario del mes seleccionado"
        >
          <i className="bi bi-download"></i> Descargar
        </button>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D2B48C" />
          <XAxis dataKey="day" tick={{ fill: '#1E1E1E', fontWeight: 500 }} />
          <YAxis tickFormatter={v => `$${v.toLocaleString('es-CO')}`} tick={{ fill: '#1E1E1E' }} />
          <Tooltip
            formatter={v => `$${v.toLocaleString('es-CO')}`}
            labelFormatter={l => `Día ${l}`}
            contentStyle={{
              backgroundColor: '#F7DAA2',
              border: '1px solid #A0522D',
              borderRadius: '8px',
              color: '#1E1E1E'
            }}
          />
          <Legend />
          <Bar dataKey="productos" name="Productos" fill="#FACC15" radius={[4, 4, 0, 0]} />
          <Bar dataKey="servicios" name="Servicios" fill="#A0522D" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlySalesChart; 