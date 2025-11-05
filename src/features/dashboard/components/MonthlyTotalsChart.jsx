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

const MonthlyTotalsChart = ({ data }) => {
  const chartData = {
    labels: data.map((d) => d.mes),
    datasets: [
      {
        label: "Total Ventas",
        data: data.map((d) => d.total),
        borderColor: "#7c3aed", // violeta premium
        backgroundColor: "#fff",
        pointBackgroundColor: "#FFD700", // dorado
        pointBorderColor: "#7c3aed",
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `$${ctx.parsed.y.toLocaleString("es-CO")}`,
        },
      },
      datalabels: {
        display: true,
        color: "#111",
        font: { weight: "bold", size: 14 },
        formatter: (v) => `$${v.toLocaleString("es-CO")}`,
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

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((row) => ({
        Mes: row.mes,
        "Total Ventas": row.total,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "VentasMensuales");
    XLSX.writeFile(wb, "ventas_mensuales.xlsx");
  };

  return (
    <div className="w-full h-96 bg-white rounded-lg shadow p-4">
      <div className="flex justify-end mb-2">
        <button
          onClick={handleDownloadExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow transition font-medium text-sm"
        >
          <i className="bi bi-download"></i> Descargar Excel
        </button>
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default MonthlyTotalsChart;
