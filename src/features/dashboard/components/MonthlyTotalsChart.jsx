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
        borderColor: "#A0522D", // primary color
        backgroundColor: "#F7DAA2",
        pointBackgroundColor: "#FACC15", // accent color
        pointBorderColor: "#A0522D",
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
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        titleColor: '#1E1E1E',
        bodyColor: '#1E1E1E',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => `${(v / 1e6).toFixed(1)}M`,
          color: "#6B7280",
          font: { size: 12 }
        },
        grid: { color: "#E5E7EB", opacity: 0.3 },
        border: { color: '#D1D5DB' }
      },
      x: {
        ticks: {
          color: "#6B7280",
          font: { size: 12, weight: 500 }
        },
        grid: { color: "#E5E7EB", opacity: 0.3 },
        border: { color: '#D1D5DB' }
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
      line: {
        borderWidth: 3,
      }
    }
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
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleDownloadExcel}
          className="flex items-center gap-2 px-4 py-2 bg-[#FACC15] hover:bg-yellow-400 text-[#1E1E1E] rounded-lg shadow-md transition-all duration-300 hover:scale-105 font-semibold text-sm"
        >
          <i className="bi bi-download text-sm"></i>
          <span>Descargar</span>
        </button>
      </div>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MonthlyTotalsChart;
