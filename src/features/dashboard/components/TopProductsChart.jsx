import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import * as XLSX from 'xlsx';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { nombre, cantidad, total } = payload[0].payload;
    return (
      <div className="bg-accent-light p-3 rounded shadow border border-primary">
        <div className="font-bold text-text-main">{nombre}</div>
        <div className="text-primary font-semibold">Cantidad: {cantidad}</div>
        <div className="text-text-main">Total: ${total.toLocaleString('es-CO')}</div>
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
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded shadow transition-all duration-300 hover:scale-105 font-medium text-sm"
          title="Descargar top productos del mes seleccionado"
        >
          <i className="bi bi-download"></i> Descargar informe
        </button>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 50, left: 250, bottom: 10 }}
          barCategoryGap={20}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#D2B48C" />
          <XAxis type="number" tick={{ fill: '#1E1E1E' }} domain={[0, 'dataMax']} />
          <YAxis dataKey="nombre" type="category" tick={{ fill: '#1E1E1E', fontWeight: 500 }} width={240} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="cantidad" fill="#FACC15" radius={[0, 8, 8, 0]}>
            <LabelList dataKey="cantidad" position="right" fill="#A0522D" fontWeight={700} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductsChart; 