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

  

  return (
    <div className="w-full">
      
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MonthlyTotalsChart;
