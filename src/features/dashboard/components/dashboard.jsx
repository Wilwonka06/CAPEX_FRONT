// pages/Dashboard.jsx
import { useState } from 'react';
import { useSales } from '../pages/SaleProducts/context/SalesContext';
import MonthlySalesChart from './MonthlySalesChart';
import MonthlyTotalsChart from './MonthlyTotalsChart';
import TopServicesChart from './TopServicesChart';
import TopProductsChart from './TopProductsChart';

// Mock temporal de servicios (puedes reemplazarlo por el hook/contexto real si lo tienes)
const mockServices = [
  {
    id: 1,
    clientName: "Jolyne",
    status: "En ejecucion",
    date: "14/12/2025",
    time: "2:45 PM",
    dineroProporcionado: 60000,
    devolucion: 10000,
    servicios: [
      { id: 1, name: "Manicura", quantity: 1, price: 50000, subtotal: 50000, employee: { name: "Wilson" } }
    ],
    productos: [],
    totalServices: 50000,
    totalProducts: 0,
    totalGeneral: 50000
  },
  {
    id: 2,
    clientName: "Maria",
    status: "Pagado",
    date: "12/08/2026",
    time: "4:00 PM",
    dineroProporcionado: 50000,
    devolucion: 0,
    servicios: [
      { id: 2, name: "Barbería", quantity: 1, price: 30000, subtotal: 30000, employee: { name: "Cruz" } }
    ],
    productos: [
      { id: 1, name: "Shampoo", quantity: 2, price: 10000, subtotal: 20000 }
    ],
    totalServices: 30000,
    totalProducts: 20000,
    totalGeneral: 50000
  },
  // ... (puedes agregar más del mock si lo deseas)
];

const Dashboard = () => {
  const { sales } = useSales();
  // Si tienes un contexto real de servicios, reemplaza mockServices por ese estado
  const [services] = useState(mockServices);

  // Ventas de productos (solo completadas/no canceladas)
  const ventasProductos = sales
    .filter(sale => sale.estado !== 'Cancelada' && sale.estado !== 'Anulada')
    .reduce((acc, sale) => acc + (sale.valor || sale.total || 0), 0);

  // Ventas de servicios (solo pagados/no anulados)
  const ventasServicios = services
    .filter(order => order.status !== 'Anulado' && order.status !== 'Cancelada')
    .reduce((acc, order) => acc + (order.totalServices || 0), 0);

  const totalVentas = ventasProductos + ventasServicios;

  const stats = [
    {
      title: 'Total Ventas',
      value: `$${totalVentas.toLocaleString('es-CO')}`,
      color: 'bg-gradient-to-r from-purple-500 to-purple-700',
    },
    {
      title: 'Ventas Productos',
      value: `$${ventasProductos.toLocaleString('es-CO')}`,
      color: 'bg-gradient-to-r from-purple-500 to-purple-700',
    },
    {
      title: 'Ventas Servicios',
      value: `$${ventasServicios.toLocaleString('es-CO')}`,
      color: 'bg-gradient-to-r from-purple-500 to-purple-700',
    },
  ];

  // Generar datos diarios del mes actual para la gráfica
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // Días del mes actual
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Inicializar arreglo de días
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
    day: String(i + 1).padStart(2, '0'),
    productos: 0,
    servicios: 0,
  }));
  // Acumular ventas de productos por día
  sales.forEach(sale => {
    if (sale.estado !== 'Cancelada' && sale.estado !== 'Anulada') {
      const fecha = new Date(sale.fecha || sale.createdAt || sale.date || null);
      if (fecha.getMonth() === month && fecha.getFullYear() === year) {
        const dayIdx = fecha.getDate() - 1;
        dailyData[dayIdx].productos += sale.valor || sale.total || 0;
      }
    }
  });
  // Acumular ventas de servicios por día usando la fecha real (DD/MM/YYYY)
  services.forEach(order => {
    if (order.status !== 'Anulado' && order.status !== 'Cancelada') {
      // Parsear fecha en formato DD/MM/YYYY
      if (order.date) {
        const [day, monthStr, yearStr] = order.date.split('/');
        const fecha = new Date(`${yearStr}-${monthStr}-${day}`);
        if (fecha.getMonth() === month && fecha.getFullYear() === year) {
          const dayIdx = fecha.getDate() - 1;
          dailyData[dayIdx].servicios += order.totalServices || 0;
        }
      }
    }
  });

  // Calcular totales de ventas por mes (últimos 6 meses)
  const mesesES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const hoy = new Date();
  const mesesData = [];
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const year = fecha.getFullYear();
    const month = fecha.getMonth();
    // Sumar ventas de productos de ese mes
    const totalProductos = sales.filter(sale => {
      const f = new Date(sale.fecha || sale.createdAt || sale.date || null);
      return f.getMonth() === month && f.getFullYear() === year && sale.estado !== 'Cancelada' && sale.estado !== 'Anulada';
    }).reduce((acc, sale) => acc + (sale.valor || sale.total || 0), 0);
    // Sumar ventas de servicios de ese mes
    const totalServicios = services.filter(order => {
      if (!order.date) return false;
      const [d, m, y] = order.date.split('/');
      const f = new Date(`${y}-${m}-${d}`);
      return f.getMonth() === month && f.getFullYear() === year && order.status !== 'Anulado' && order.status !== 'Cancelada';
    }).reduce((acc, order) => acc + (order.totalServices || 0), 0);
    mesesData.push({
      mes: `${mesesES[month]}`,
      total: totalProductos + totalServicios
    });
  }

  // Calcular top 3 servicios más vendidos del mes actual
  const serviciosMes = {};
  services.forEach(order => {
    if (order.status !== 'Anulado' && order.status !== 'Cancelada' && order.date) {
      const [d, m, y] = order.date.split('/');
      const fecha = new Date(`${y}-${m}-${d}`);
      if (fecha.getMonth() === month && fecha.getFullYear() === year) {
        (order.servicios || []).forEach(serv => {
          if (!serviciosMes[serv.name]) {
            serviciosMes[serv.name] = { nombre: serv.name, cantidad: 0, total: 0 };
          }
          serviciosMes[serv.name].cantidad += serv.quantity || 1;
          serviciosMes[serv.name].total += serv.subtotal || 0;
        });
      }
    }
  });
  const topServicios = Object.values(serviciosMes)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 3);

  // Calcular top 5 productos más vendidos del mes actual
  const productosMes = {};
  sales.forEach(sale => {
    if (sale.estado !== 'Cancelada' && sale.estado !== 'Anulada') {
      const fecha = new Date(sale.fecha || sale.createdAt || sale.date || null);
      if (fecha.getMonth() === month && fecha.getFullYear() === year) {
        (sale.productos || []).forEach(prod => {
          if (!productosMes[prod.nombre || prod.name]) {
            productosMes[prod.nombre || prod.name] = { nombre: prod.nombre || prod.name, cantidad: 0, total: 0 };
          }
          productosMes[prod.nombre || prod.name].cantidad += prod.cantidad || prod.quantity || 1;
          productosMes[prod.nombre || prod.name].total += (prod.precio || prod.price || 0) * (prod.cantidad || prod.quantity || 1);
        });
      }
    }
  });
  // Sumar también productos de servicios
  services.forEach(order => {
    if (order.status !== 'Anulado' && order.status !== 'Cancelada' && order.date) {
      const [d, m, y] = order.date.split('/');
      const fecha = new Date(`${y}-${m}-${d}`);
      if (fecha.getMonth() === month && fecha.getFullYear() === year) {
        (order.productos || []).forEach(prod => {
          if (!productosMes[prod.name]) {
            productosMes[prod.name] = { nombre: prod.name, cantidad: 0, total: 0 };
          }
          productosMes[prod.name].cantidad += prod.quantity || 1;
          productosMes[prod.name].total += prod.subtotal || 0;
        });
      }
    }
  });
  const topProductos = Object.values(productosMes)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  return (
    <div className="space-y-6 bg-gray-200 min-h-screen p-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ¡Bienvenido de vuelta!
        </h2>
        <p className="text-gray-600">
          Aquí tienes un resumen de la actividad de tu sistema.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen diario del mes actual */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Resumen Diario (Mes Actual)
          </h3>
          <MonthlySalesChart data={dailyData} />
        </div>
        {/* Gráfica de ventas mensuales (últimos 6 meses) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Ventas Mensual (Comparativo 6 meses)
          </h3>
          <MonthlyTotalsChart data={mesesData} />
        </div>
      </div>

      {/* Top más vendidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Servicios Más Vendidos <span className="text-gray-500 font-normal">{mesesES[month]} {year}</span>
          </h3>
          <TopServicesChart data={topServicios} />
        </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Productos Más Vendidos <span className="text-gray-500 font-normal">{mesesES[month]} {year}</span>
        </h3>
          <TopProductsChart data={topProductos} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;