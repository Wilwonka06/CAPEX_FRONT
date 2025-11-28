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
  "#A0522D", // primary
  "#FACC15", // accent
  "#D2B48C", // accent-light
  "#4B2A2A", // primary-dark
  "#1E1E1E", // text-main
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
        backgroundColor: '#F7DAA2',
        borderColor: '#A0522D',
        borderWidth: 1,
        titleColor: '#1E1E1E',
        bodyColor: '#1E1E1E',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => `${(v / 1e6).toFixed(1)}M`,
          color: "#1E1E1E",
        },
        grid: { color: "#D2B48C" },
      },
      x: {
        ticks: { color: "#1E1E1E" },
        grid: { color: "#D2B48C" },
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart',
    },
  };

  

  return (
    <div className="w-full h-[500px] bg-white rounded-lg shadow p-4 mt-8">
      
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Comparativa Anual de Ventas
      </h3>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default AnnualComparisonChart;
