import * as XLSX from 'xlsx';

const mesesCortos = [
  'Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'
];

const ReportsPanel = ({ weeklyData = [], topServicios = [], topProductos = [], mesesData = [], annualData = {} }) => {
  const exportSemanal = () => {
    const ws = XLSX.utils.json_to_sheet(
      weeklyData.map(row => ({
        Semana: row.label,
        Productos: row.productos,
        Servicios: row.servicios,
        Total: row.total
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'VentasSemanales');
    XLSX.writeFile(wb, 'ventas_semanales.xlsx');
  };

  const exportTopPeriodo = () => {
    const wsServicios = XLSX.utils.json_to_sheet(
      (topServicios || []).map(row => ({
        Servicio: row.nombre,
        Cantidad: row.cantidad,
        Total: row.total
      }))
    );
    const wsProductos = XLSX.utils.json_to_sheet(
      (topProductos || []).map(row => ({
        Producto: row.nombre,
        Cantidad: row.cantidad,
        Total: row.total
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsServicios, 'TopServicios');
    XLSX.utils.book_append_sheet(wb, wsProductos, 'TopProductos');
    XLSX.writeFile(wb, 'top_periodo.xlsx');
  };

  const exportTendenciaYoY = () => {
    const wsMensual = XLSX.utils.json_to_sheet(
      (mesesData || []).map(row => ({ Mes: row.mes, Total: row.total }))
    );
    const rowsYoY = Object.keys(annualData)
      .sort()
      .map(year => {
        const r = { Año: year };
        mesesCortos.forEach((m, idx) => {
          r[m] = (annualData[year] && annualData[year][idx]) ? annualData[year][idx] : 0;
        });
        return r;
      });
    const wsYoY = XLSX.utils.json_to_sheet(rowsYoY);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsMensual, 'Mensual6m');
    XLSX.utils.book_append_sheet(wb, wsYoY, 'YoY');
    XLSX.writeFile(wb, 'tendencia_yoy.xlsx');
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-[#1E1E1E]">Reportes</h3>
        <p className="text-sm text-gray-600">Descarga de reportes críticos para análisis</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={exportSemanal}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#FACC15] hover:bg-yellow-400 text-[#1E1E1E] rounded-xl shadow-md transition-all duration-300 hover:scale-105 font-semibold text-sm"
        >
          <i className="bi bi-download" /> Ventas semanales
        </button>
        <button
          onClick={exportTopPeriodo}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1E1E1E] hover:bg-black text-white rounded-xl shadow-md transition-all duration-300 hover:scale-105 font-semibold text-sm"
        >
          <i className="bi bi-download" /> Top servicios y productos
        </button>
        <button
          onClick={exportTendenciaYoY}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#A0522D] hover:bg-[#4B2A2A] text-white rounded-xl shadow-md transition-all duration-300 hover:scale-105 font-semibold text-sm"
        >
          <i className="bi bi-download" /> Tendencia mensual
        </button>
      </div>
    </div>
  );
};

export default ReportsPanel;
