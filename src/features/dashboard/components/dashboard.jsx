// pages/Dashboard.jsx
import { useState } from 'react';
import { useSales } from '../pages/SaleProducts/context/SalesContext';
import MonthlySalesChart from './MonthlySalesChart';
import MonthlyTotalsChart from './MonthlyTotalsChart';
import TopServicesChart from './TopServicesChart';
import TopProductsChart from './TopProductsChart';
import { FaMoneyBillWave, FaBoxOpen, FaUserTie } from 'react-icons/fa';
import AnnualComparisonChart from './AnnualComparisonChart';

// Mock de ventas de productos (2023-2025)
const mockSales = [
  // 2023
  { fecha: '2023-01-10', valor: 3000000, estado: 'Completada', productos: [{ nombre: 'Shampoo', cantidad: 10, precio: 30000 }] },
  { fecha: '2023-02-15', valor: 5000000, estado: 'Completada', productos: [{ nombre: 'Acondicionador', cantidad: 15, precio: 35000 }] },
  { fecha: '2023-03-20', valor: 7000000, estado: 'Completada', productos: [{ nombre: 'Tinte', cantidad: 20, precio: 35000 }] },
  { fecha: '2023-04-05', valor: 4000000, estado: 'Completada', productos: [{ nombre: 'Gel', cantidad: 8, precio: 50000 }] },
  { fecha: '2023-05-12', valor: 6000000, estado: 'Completada', productos: [{ nombre: 'Cera', cantidad: 12, precio: 50000 }] },
  { fecha: '2023-06-18', valor: 8000000, estado: 'Completada', productos: [{ nombre: 'Laca', cantidad: 16, precio: 50000 }] },
  { fecha: '2023-07-22', valor: 9000000, estado: 'Completada', productos: [{ nombre: 'Peine', cantidad: 18, precio: 50000 }] },
  { fecha: '2023-08-30', valor: 10000000, estado: 'Completada', productos: [{ nombre: 'Secador', cantidad: 20, precio: 50000 }] },
  { fecha: '2023-09-10', valor: 11000000, estado: 'Completada', productos: [{ nombre: 'Plancha', cantidad: 22, precio: 50000 }] },
  { fecha: '2023-10-15', valor: 12000000, estado: 'Completada', productos: [{ nombre: 'Cepillo', cantidad: 24, precio: 50000 }] },
  { fecha: '2023-11-20', valor: 13000000, estado: 'Completada', productos: [{ nombre: 'Mascarilla', cantidad: 26, precio: 50000 }] },
  { fecha: '2023-12-25', valor: 14000000, estado: 'Completada', productos: [{ nombre: 'Serum', cantidad: 28, precio: 50000 }] },
  // 2024
  { fecha: '2024-01-10', valor: 4000000, estado: 'Completada', productos: [{ nombre: 'Shampoo', cantidad: 12, precio: 35000 }] },
  { fecha: '2024-02-15', valor: 6000000, estado: 'Completada', productos: [{ nombre: 'Acondicionador', cantidad: 18, precio: 35000 }] },
  { fecha: '2024-03-20', valor: 8000000, estado: 'Completada', productos: [{ nombre: 'Tinte', cantidad: 24, precio: 35000 }] },
  { fecha: '2024-04-05', valor: 5000000, estado: 'Completada', productos: [{ nombre: 'Gel', cantidad: 10, precio: 50000 }] },
  { fecha: '2024-05-12', valor: 7000000, estado: 'Completada', productos: [{ nombre: 'Cera', cantidad: 14, precio: 50000 }] },
  { fecha: '2024-06-18', valor: 9000000, estado: 'Completada', productos: [{ nombre: 'Laca', cantidad: 18, precio: 50000 }] },
  { fecha: '2024-07-22', valor: 10000000, estado: 'Completada', productos: [{ nombre: 'Peine', cantidad: 20, precio: 50000 }] },
  { fecha: '2024-08-30', valor: 11000000, estado: 'Completada', productos: [{ nombre: 'Secador', cantidad: 22, precio: 50000 }] },
  { fecha: '2024-09-10', valor: 12000000, estado: 'Completada', productos: [{ nombre: 'Plancha', cantidad: 24, precio: 50000 }] },
  { fecha: '2024-10-15', valor: 13000000, estado: 'Completada', productos: [{ nombre: 'Cepillo', cantidad: 26, precio: 50000 }] },
  { fecha: '2024-11-20', valor: 14000000, estado: 'Completada', productos: [{ nombre: 'Mascarilla', cantidad: 28, precio: 50000 }] },
  { fecha: '2024-12-25', valor: 15000000, estado: 'Completada', productos: [{ nombre: 'Serum', cantidad: 30, precio: 50000 }] },
  // 2025
  { fecha: '2025-01-10', valor: 5000000, estado: 'Completada', productos: [{ nombre: 'Shampoo', cantidad: 14, precio: 35000 }] },
  { fecha: '2025-02-15', valor: 7000000, estado: 'Completada', productos: [{ nombre: 'Acondicionador', cantidad: 21, precio: 35000 }] },
  { fecha: '2025-03-20', valor: 9000000, estado: 'Completada', productos: [{ nombre: 'Tinte', cantidad: 27, precio: 35000 }] },
  { fecha: '2025-04-05', valor: 6000000, estado: 'Completada', productos: [{ nombre: 'Gel', cantidad: 12, precio: 50000 }] },
  { fecha: '2025-05-12', valor: 8000000, estado: 'Completada', productos: [{ nombre: 'Cera', cantidad: 16, precio: 50000 }] },
  { fecha: '2025-06-18', valor: 10000000, estado: 'Completada', productos: [{ nombre: 'Laca', cantidad: 20, precio: 50000 }] },
  { fecha: '2025-07-22', valor: 11000000, estado: 'Completada', productos: [{ nombre: 'Peine', cantidad: 22, precio: 50000 }] },
  { fecha: '2025-08-30', valor: 12000000, estado: 'Completada', productos: [{ nombre: 'Secador', cantidad: 24, precio: 50000 }] },
  { fecha: '2025-09-10', valor: 13000000, estado: 'Completada', productos: [{ nombre: 'Plancha', cantidad: 26, precio: 50000 }] },
  { fecha: '2025-10-15', valor: 14000000, estado: 'Completada', productos: [{ nombre: 'Cepillo', cantidad: 28, precio: 50000 }] },
  { fecha: '2025-11-20', valor: 15000000, estado: 'Completada', productos: [{ nombre: 'Mascarilla', cantidad: 30, precio: 50000 }] },
  { fecha: '2025-12-25', valor: 16000000, estado: 'Completada', productos: [{ nombre: 'Serum', cantidad: 32, precio: 50000 }] },
];

// Mock de servicios (2023-2025)
const mockServices = [
  // 2023
  { id: 1, clientName: 'Ana', status: 'Pagado', date: '10/01/2023', servicios: [{ id: 1, name: 'Corte', quantity: 1, price: 20000, subtotal: 20000, employee: { name: 'Wilson' } }], totalServices: 20000, productos: [] },
  { id: 2, clientName: 'Luis', status: 'Pagado', date: '15/02/2023', servicios: [{ id: 2, name: 'Manicura', quantity: 2, price: 15000, subtotal: 30000, employee: { name: 'Maria' } }], totalServices: 30000, productos: [] },
  { id: 3, clientName: 'Sofia', status: 'Pagado', date: '20/03/2023', servicios: [{ id: 3, name: 'Barbería', quantity: 1, price: 25000, subtotal: 25000, employee: { name: 'Cruz' } }], totalServices: 25000, productos: [] },
  { id: 4, clientName: 'Pedro', status: 'Pagado', date: '05/04/2023', servicios: [{ id: 4, name: 'Color', quantity: 1, price: 30000, subtotal: 30000, employee: { name: 'Ana' } }], totalServices: 30000, productos: [] },
  { id: 5, clientName: 'Lucia', status: 'Pagado', date: '12/05/2023', servicios: [{ id: 5, name: 'Peinado', quantity: 1, price: 18000, subtotal: 18000, employee: { name: 'Luis' } }], totalServices: 18000, productos: [] },
  { id: 6, clientName: 'Carlos', status: 'Pagado', date: '18/06/2023', servicios: [{ id: 6, name: 'Depilación', quantity: 1, price: 22000, subtotal: 22000, employee: { name: 'Sofia' } }], totalServices: 22000, productos: [] },
  { id: 7, clientName: 'Marta', status: 'Pagado', date: '22/07/2023', servicios: [{ id: 7, name: 'Masaje', quantity: 1, price: 35000, subtotal: 35000, employee: { name: 'Pedro' } }], totalServices: 35000, productos: [] },
  { id: 8, clientName: 'Jorge', status: 'Pagado', date: '30/08/2023', servicios: [{ id: 8, name: 'Tratamiento', quantity: 1, price: 40000, subtotal: 40000, employee: { name: 'Lucia' } }], totalServices: 40000, productos: [] },
  { id: 9, clientName: 'Elena', status: 'Pagado', date: '10/09/2023', servicios: [{ id: 9, name: 'Corte', quantity: 1, price: 20000, subtotal: 20000, employee: { name: 'Carlos' } }], totalServices: 20000, productos: [] },
  { id: 10, clientName: 'Raul', status: 'Pagado', date: '15/10/2023', servicios: [{ id: 10, name: 'Manicura', quantity: 2, price: 15000, subtotal: 30000, employee: { name: 'Marta' } }], totalServices: 30000, productos: [] },
  { id: 11, clientName: 'Paula', status: 'Pagado', date: '20/11/2023', servicios: [{ id: 11, name: 'Barbería', quantity: 1, price: 25000, subtotal: 25000, employee: { name: 'Jorge' } }], totalServices: 25000, productos: [] },
  { id: 12, clientName: 'Nina', status: 'Pagado', date: '25/12/2023', servicios: [{ id: 12, name: 'Color', quantity: 1, price: 30000, subtotal: 30000, employee: { name: 'Elena' } }], totalServices: 30000, productos: [] },
  // 2024 y 2025 (agrega más si lo deseas)
];

// Declarar mesesES al inicio del archivo para evitar errores de hoisting
const mesesES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const Dashboard = () => {
  const sales = mockSales;
  // Usa los mocks de ejemplo
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
      icon: <FaMoneyBillWave className="text-3xl text-purple-600" />,
    },
    {
      title: 'Ventas Productos',
      value: `$${ventasProductos.toLocaleString('es-CO')}`,
      color: 'bg-gradient-to-r from-purple-500 to-purple-700',
      icon: <FaBoxOpen className="text-3xl text-green-600" />,
    },
    {
      title: 'Ventas Servicios',
      value: `$${ventasServicios.toLocaleString('es-CO')}`,
      color: 'bg-gradient-to-r from-purple-500 to-purple-700',
      icon: <FaUserTie className="text-3xl text-blue-600" />,
    },
  ];

  // Selector de mes (actual y tres meses atrás)
  const [selectedMonth, setSelectedMonth] = useState(() => {
  const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  // Generar opciones de meses
  const monthOptions = [];
  for (let i = 0; i < 4; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    monthOptions.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: `${mesesES[date.getMonth()]} ${date.getFullYear()}`
    });
  }
  // Parsear mes seleccionado
  const [selYear, selMonth] = selectedMonth.split('-').map(Number);

  // Filtrar datos según mes seleccionado
  const dailyDataFiltered = Array.from({ length: new Date(selYear, selMonth, 0).getDate() }, (_, i) => ({
    day: String(i + 1).padStart(2, '0'),
    productos: 0,
    servicios: 0,
  }));
  sales.forEach(sale => {
    if (sale.estado !== 'Cancelada' && sale.estado !== 'Anulada') {
      const fecha = new Date(sale.fecha || sale.createdAt || sale.date || null);
      if (fecha.getMonth() + 1 === selMonth && fecha.getFullYear() === selYear) {
        const dayIdx = fecha.getDate() - 1;
        dailyDataFiltered[dayIdx].productos += sale.valor || sale.total || 0;
      }
    }
  });
  services.forEach(order => {
    if (order.status !== 'Anulado' && order.status !== 'Cancelada') {
      if (order.date) {
        const [day, monthStr, yearStr] = order.date.split('/');
        const fecha = new Date(`${yearStr}-${monthStr}-${day}`);
        if (fecha.getMonth() + 1 === selMonth && fecha.getFullYear() === selYear) {
          const dayIdx = fecha.getDate() - 1;
          dailyDataFiltered[dayIdx].servicios += order.totalServices || 0;
        }
      }
    }
  });
  // Top servicios filtrados
  const serviciosMes = {};
  services.forEach(order => {
    if (order.status !== 'Anulado' && order.status !== 'Cancelada' && order.date) {
      const [d, m, y] = order.date.split('/');
      const fecha = new Date(`${y}-${m}-${d}`);
      if (fecha.getMonth() + 1 === selMonth && fecha.getFullYear() === selYear) {
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
    .slice(0, 5);
  while (topServicios.length < 5) {
    topServicios.push({ nombre: '', cantidad: 0, total: 0 });
  }
  // Top productos filtrados
  const productosMes = {};
  sales.forEach(sale => {
    if (sale.estado !== 'Cancelada' && sale.estado !== 'Anulada') {
      const fecha = new Date(sale.fecha || sale.createdAt || sale.date || null);
      if (fecha.getMonth() + 1 === selMonth && fecha.getFullYear() === selYear) {
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
  services.forEach(order => {
    if (order.status !== 'Anulado' && order.status !== 'Cancelada' && order.date) {
      const [d, m, y] = order.date.split('/');
      const fecha = new Date(`${y}-${m}-${d}`);
      if (fecha.getMonth() + 1 === selMonth && fecha.getFullYear() === selYear) {
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
  while (topProductos.length < 5) {
    topProductos.push({ nombre: '', cantidad: 0, total: 0 });
  }

  // Calcular totales de ventas por mes (últimos 6 meses)
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

  // Calcular datos anuales para la gráfica comparativa
  const annualData = {};
  // Recolectar todos los años presentes en ventas y servicios
  const allYears = new Set();
  sales.forEach(sale => {
    const fecha = new Date(sale.fecha || sale.createdAt || sale.date || null);
    if (!isNaN(fecha)) allYears.add(fecha.getFullYear());
  });
  services.forEach(order => {
    if (order.date) {
      const [d, m, y] = order.date.split('/');
      const fecha = new Date(`${y}-${m}-${d}`);
      if (!isNaN(fecha)) allYears.add(fecha.getFullYear());
    }
  });
  Array.from(allYears).sort().forEach(year => {
    annualData[year] = Array(12).fill(0);
  });
  sales.forEach(sale => {
    const fecha = new Date(sale.fecha || sale.createdAt || sale.date || null);
    if (!isNaN(fecha)) {
      const year = fecha.getFullYear();
      const month = fecha.getMonth();
      if (annualData[year]) annualData[year][month] += sale.valor || sale.total || 0;
    }
  });
  services.forEach(order => {
    if (order.date) {
      const [d, m, y] = order.date.split('/');
      const fecha = new Date(`${y}-${m}-${d}`);
      if (!isNaN(fecha)) {
        const year = fecha.getFullYear();
        const month = fecha.getMonth();
        if (annualData[year]) annualData[year][month] += order.totalServices || 0;
      }
    }
  });

  return (
    <div className="space-y-6 bg-gray-200 min-h-screen p-6">
      {/* Welcome Section + Selector de mes */}
      <div className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">¡Bienvenido de vuelta!</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <label className="text-sm font-semibold text-gray-700" htmlFor="mes-selector">Selecciona el mes a visualizar:</label>
          <select
            id="mes-selector"
            className="w-full sm:w-auto px-4 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-gray-50"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-4">
            <div>{stat.icon}</div>
            <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen diario del mes seleccionado */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Resumen Diario ({mesesES[selMonth-1]} {selYear})
          </h3>
          <MonthlySalesChart data={dailyDataFiltered} />
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
            Servicios Más Vendidos <span className="text-gray-500 font-normal">{mesesES[selMonth-1]} {selYear}</span>
          </h3>
          <TopServicesChart data={topServicios} />
        </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Productos Más Vendidos <span className="text-gray-500 font-normal">{mesesES[selMonth-1]} {selYear}</span>
        </h3>
          <TopProductsChart data={topProductos} />
        </div>
      </div>
      {/* Comparativa anual */}
      <div className="bg-white rounded-lg shadow p-6 mt-6 overflow-x-auto">
        <AnnualComparisonChart data={annualData} />
      </div>
    </div>
  );
};

export default Dashboard;