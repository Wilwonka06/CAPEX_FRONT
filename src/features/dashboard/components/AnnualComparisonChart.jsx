import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import * as XLSX from "xlsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const colores = [
  "#7c3aed", // violeta
  "#22d3ee", // cyan
  "#a3e635", // verde
  "#f472b6", // rosa
  "#facc15", // amarillo
];

const mesesES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const AnnualComparisonChart = ({ data }) => {
  const years = Object.keys(data).sort();
  const chartData = {
    labels: mesesES,
    datasets: years.map((year, idx) => ({
      label: year,
      data: data[year],
      borderColor: colores[idx % colores.length],
      backgroundColor: colores[idx % colores.length],
      pointBackgroundColor: colores[idx % colores.length],
      pointBorderColor: colores[idx % colores.length],
      pointRadius: 5,
      pointHoverRadius: 7,
      fill: false,
      tension: 0.3,
    })),
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx) => `$${ctx.parsed.y.toLocaleString("es-CO")}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => `${(v / 1e6).toFixed(1)}M`,
          color: "#333",
        },
        grid: { color: "#eee" },
      },
      x: {
        ticks: { color: "#333" },
        grid: { color: "#eee" },
      },
    },
  };

  const handleDownload = () => {
    // Construir tabla: columnas = meses, filas = años
    const rows = Object.keys(data)
      .sort()
      .map((year) => {
        const row = { Año: year };
        mesesES.forEach((mes, idx) => {
          row[mes] = data[year][idx] || 0;
        });
        return row;
      });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ComparativaAnual");
    XLSX.writeFile(wb, "comparativa_anual.xlsx");
  };

  return (
    <div className="w-full h-96 bg-white rounded-lg shadow p-4 mt-8">
      <div className="flex justify-end mb-2">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded shadow transition font-medium text-xs"
          title="Descargar comparativa anual"
        >
          <i className="bi bi-download"></i> Descargar
        </button>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Comparativa Anual de Ventas
      </h3>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default AnnualComparisonChart;
