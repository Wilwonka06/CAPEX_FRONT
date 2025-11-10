// pages/Dashboard.jsx
import { useState, useEffect } from "react";
import MonthlySalesChart from "./MonthlySalesChart";
import MonthlyTotalsChart from "./MonthlyTotalsChart";
import TopServicesChart from "./TopServicesChart";
import TopProductsChart from "./TopProductsChart";
import { FaMoneyBillWave, FaBoxOpen, FaUserTie } from "react-icons/fa";
import AnnualComparisonChart from "./AnnualComparisonChart";
import AccessCards from "./AccessCards";
import purchasesService from "../pages/purchases/API/purchasesService";
import salesService from "../pages/SaleProducts/API/salesService";
import ordersService from "../pages/orders/API/ordersService";
import { useAuth } from "../../../shared/contexts/AuthContext";

// Mock de ventas de productos (2023-2025)
const mockSales = [
  // 2023
  {
    fecha: "2023-01-10",
    valor: 3000000,
    estado: "Completada",
    productos: [{ nombre: "Shampoo", cantidad: 10, precio: 30000 }],
  },
  {
    fecha: "2023-02-15",
    valor: 5000000,
    estado: "Completada",
    productos: [{ nombre: "Acondicionador", cantidad: 15, precio: 35000 }],
  },
  {
    fecha: "2023-03-20",
    valor: 7000000,
    estado: "Completada",
    productos: [{ nombre: "Tinte", cantidad: 20, precio: 35000 }],
  },
  {
    fecha: "2023-04-05",
    valor: 4000000,
    estado: "Completada",
    productos: [{ nombre: "Gel", cantidad: 8, precio: 50000 }],
  },
  {
    fecha: "2023-05-12",
    valor: 6000000,
    estado: "Completada",
    productos: [{ nombre: "Cera", cantidad: 12, precio: 50000 }],
  },
  {
    fecha: "2023-06-18",
    valor: 8000000,
    estado: "Completada",
    productos: [{ nombre: "Laca", cantidad: 16, precio: 50000 }],
  },
  {
    fecha: "2023-07-22",
    valor: 9000000,
    estado: "Completada",
    productos: [{ nombre: "Peine", cantidad: 18, precio: 50000 }],
  },
  {
    fecha: "2023-08-30",
    valor: 10000000,
    estado: "Completada",
    productos: [{ nombre: "Secador", cantidad: 20, precio: 50000 }],
  },
  {
    fecha: "2023-09-10",
    valor: 11000000,
    estado: "Completada",
    productos: [{ nombre: "Plancha", cantidad: 22, precio: 50000 }],
  },
  {
    fecha: "2023-10-15",
    valor: 12000000,
    estado: "Completada",
    productos: [{ nombre: "Cepillo", cantidad: 24, precio: 50000 }],
  },
  {
    fecha: "2023-11-20",
    valor: 13000000,
    estado: "Completada",
    productos: [{ nombre: "Mascarilla", cantidad: 26, precio: 50000 }],
  },
  {
    fecha: "2023-12-25",
    valor: 14000000,
    estado: "Completada",
    productos: [{ nombre: "Serum", cantidad: 28, precio: 50000 }],
  },
  // 2024
  {
    fecha: "2024-01-10",
    valor: 4000000,
    estado: "Completada",
    productos: [{ nombre: "Shampoo", cantidad: 12, precio: 35000 }],
  },
  {
    fecha: "2024-02-15",
    valor: 6000000,
    estado: "Completada",
    productos: [{ nombre: "Acondicionador", cantidad: 18, precio: 35000 }],
  },
  {
    fecha: "2024-03-20",
    valor: 8000000,
    estado: "Completada",
    productos: [{ nombre: "Tinte", cantidad: 24, precio: 35000 }],
  },
  {
    fecha: "2024-04-05",
    valor: 5000000,
    estado: "Completada",
    productos: [{ nombre: "Gel", cantidad: 10, precio: 50000 }],
  },
  {
    fecha: "2024-05-12",
    valor: 7000000,
    estado: "Completada",
    productos: [{ nombre: "Cera", cantidad: 14, precio: 50000 }],
  },
  {
    fecha: "2024-06-18",
    valor: 9000000,
    estado: "Completada",
    productos: [{ nombre: "Laca", cantidad: 18, precio: 50000 }],
  },
  {
    fecha: "2024-07-22",
    valor: 10000000,
    estado: "Completada",
    productos: [{ nombre: "Peine", cantidad: 20, precio: 50000 }],
  },
  {
    fecha: "2024-08-30",
    valor: 11000000,
    estado: "Completada",
    productos: [{ nombre: "Secador", cantidad: 22, precio: 50000 }],
  },
  {
    fecha: "2024-09-10",
    valor: 12000000,
    estado: "Completada",
    productos: [{ nombre: "Plancha", cantidad: 24, precio: 50000 }],
  },
  {
    fecha: "2024-10-15",
    valor: 13000000,
    estado: "Completada",
    productos: [{ nombre: "Cepillo", cantidad: 26, precio: 50000 }],
  },
  {
    fecha: "2024-11-20",
    valor: 14000000,
    estado: "Completada",
    productos: [{ nombre: "Mascarilla", cantidad: 28, precio: 50000 }],
  },
  {
    fecha: "2024-12-25",
    valor: 15000000,
    estado: "Completada",
    productos: [{ nombre: "Serum", cantidad: 30, precio: 50000 }],
  },
  // 2025
  {
    fecha: "2025-01-10",
    valor: 5000000,
    estado: "Completada",
    productos: [{ nombre: "Shampoo", cantidad: 14, precio: 35000 }],
  },
  {
    fecha: "2025-02-15",
    valor: 7000000,
    estado: "Completada",
    productos: [{ nombre: "Acondicionador", cantidad: 21, precio: 35000 }],
  },
  {
    fecha: "2025-03-20",
    valor: 9000000,
    estado: "Completada",
    productos: [{ nombre: "Tinte", cantidad: 27, precio: 35000 }],
  },
  {
    fecha: "2025-04-05",
    valor: 6000000,
    estado: "Completada",
    productos: [{ nombre: "Gel", cantidad: 12, precio: 50000 }],
  },
  {
    fecha: "2025-05-12",
    valor: 8000000,
    estado: "Completada",
    productos: [{ nombre: "Cera", cantidad: 16, precio: 50000 }],
  },
  {
    fecha: "2025-06-18",
    valor: 10000000,
    estado: "Completada",
    productos: [{ nombre: "Laca", cantidad: 20, precio: 50000 }],
  },
  {
    fecha: "2025-07-22",
    valor: 11000000,
    estado: "Completada",
    productos: [{ nombre: "Peine", cantidad: 22, precio: 50000 }],
  },
  {
    fecha: "2025-08-30",
    valor: 12000000,
    estado: "Completada",
    productos: [{ nombre: "Secador", cantidad: 24, precio: 50000 }],
  },
  {
    fecha: "2025-09-10",
    valor: 13000000,
    estado: "Completada",
    productos: [{ nombre: "Plancha", cantidad: 26, precio: 50000 }],
  },
  {
    fecha: "2025-10-15",
    valor: 14000000,
    estado: "Completada",
    productos: [{ nombre: "Cepillo", cantidad: 28, precio: 50000 }],
  },
  {
    fecha: "2025-11-20",
    valor: 15000000,
    estado: "Completada",
    productos: [{ nombre: "Mascarilla", cantidad: 30, precio: 50000 }],
  },
  {
    fecha: "2025-12-25",
    valor: 16000000,
    estado: "Completada",
    productos: [{ nombre: "Serum", cantidad: 32, precio: 50000 }],
  },
];

// Mock de servicios (2023-2025)
const mockServices = [
  // 2023
  {
    id: 1,
    clientName: "Ana",
    status: "Pagado",
    date: "10/01/2023",
    servicios: [
      {
        id: 1,
        name: "Corte",
        quantity: 1,
        price: 20000,
        subtotal: 20000,
        employee: { name: "Wilson" },
      },
    ],
    totalServices: 20000,
    productos: [],
  },
  {
    id: 2,
    clientName: "Luis",
    status: "Pagado",
    date: "15/02/2023",
    servicios: [
      {
        id: 2,
        name: "Manicura",
        quantity: 2,
        price: 15000,
        subtotal: 30000,
        employee: { name: "Maria" },
      },
    ],
    totalServices: 30000,
    productos: [],
  },
  {
    id: 3,
    clientName: "Sofia",
    status: "Pagado",
    date: "20/03/2023",
    servicios: [
      {
        id: 3,
        name: "Barbería",
        quantity: 1,
        price: 25000,
        subtotal: 25000,
        employee: { name: "Cruz" },
      },
    ],
    totalServices: 25000,
    productos: [],
  },
  {
    id: 4,
    clientName: "Pedro",
    status: "Pagado",
    date: "05/04/2023",
    servicios: [
      {
        id: 4,
        name: "Color",
        quantity: 1,
        price: 30000,
        subtotal: 30000,
        employee: { name: "Ana" },
      },
    ],
    totalServices: 30000,
    productos: [],
  },
  {
    id: 5,
    clientName: "Lucia",
    status: "Pagado",
    date: "12/05/2023",
    servicios: [
      {
        id: 5,
        name: "Peinado",
        quantity: 1,
        price: 18000,
        subtotal: 18000,
        employee: { name: "Luis" },
      },
    ],
    totalServices: 18000,
    productos: [],
  },
  {
    id: 6,
    clientName: "Carlos",
    status: "Pagado",
    date: "18/06/2023",
    servicios: [
      {
        id: 6,
        name: "Depilación",
        quantity: 1,
        price: 22000,
        subtotal: 22000,
        employee: { name: "Sofia" },
      },
    ],
    totalServices: 22000,
    productos: [],
  },
  {
    id: 7,
    clientName: "Marta",
    status: "Pagado",
    date: "22/07/2023",
    servicios: [
      {
        id: 7,
        name: "Masaje",
        quantity: 1,
        price: 35000,
        subtotal: 35000,
        employee: { name: "Pedro" },
      },
    ],
    totalServices: 35000,
    productos: [],
  },
  {
    id: 8,
    clientName: "Jorge",
    status: "Pagado",
    date: "30/08/2023",
    servicios: [
      {
        id: 8,
        name: "Tratamiento",
        quantity: 1,
        price: 40000,
        subtotal: 40000,
        employee: { name: "Lucia" },
      },
    ],
    totalServices: 40000,
    productos: [],
  },
  {
    id: 9,
    clientName: "Elena",
    status: "Pagado",
    date: "10/09/2023",
    servicios: [
      {
        id: 9,
        name: "Corte",
        quantity: 1,
        price: 20000,
        subtotal: 20000,
        employee: { name: "Carlos" },
      },
    ],
    totalServices: 20000,
    productos: [],
  },
  {
    id: 10,
    clientName: "Raul",
    status: "Pagado",
    date: "15/10/2023",
    servicios: [
      {
        id: 10,
        name: "Manicura",
        quantity: 2,
        price: 15000,
        subtotal: 30000,
        employee: { name: "Marta" },
      },
    ],
    totalServices: 30000,
    productos: [],
  },
  {
    id: 11,
    clientName: "Paula",
    status: "Pagado",
    date: "20/11/2023",
    servicios: [
      {
        id: 11,
        name: "Barbería",
        quantity: 1,
        price: 25000,
        subtotal: 25000,
        employee: { name: "Jorge" },
      },
    ],
    totalServices: 25000,
    productos: [],
  },
  {
    id: 12,
    clientName: "Nina",
    status: "Pagado",
    date: "25/12/2023",
    servicios: [
      {
        id: 12,
        name: "Color",
        quantity: 1,
        price: 30000,
        subtotal: 30000,
        employee: { name: "Elena" },
      },
    ],
    totalServices: 30000,
    productos: [],
  },
  // 2024 y 2025 (agrega más si lo deseas)
];

// Declarar mesesES al inicio del archivo para evitar errores de hoisting
const mesesES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const Dashboard = () => {
  const { hasPrivilege, currentUser } = useAuth();
  
  // Estados para datos reales
  const [realSales, setRealSales] = useState([]);
  const [realOrders, setRealOrders] = useState([]);

  // Estados para datos calculados - Usar datos reales cuando estén disponibles
  const [sales] = useState(mockSales); // Mantener mock para gráficas por ahora
  const [services] = useState(mockServices); // Mantener mock para gráficas por ahora

  // ===== CARGAR DATOS REALES =====
  useEffect(() => {
    const loadRealData = async () => {
      try {
        // Cargar ventas reales
        const salesResponse = await salesService.getAll({ limit: 50 });
        if (salesResponse.success) {
          setRealSales(salesResponse.data || []);
        }

        // Cargar pedidos reales
        const ordersResponse = await ordersService.getAll({ limit: 50 });
        if (ordersResponse.success) {
          setRealOrders(ordersResponse.data || []);
        }
      } catch (error) {
        console.error("Error loading real data for dashboard:", error);
      }
    };

    loadRealData();
  }, []);
  
  // Verificar si el usuario tiene acceso completo al dashboard
  const hasFullDashboardAccess = hasPrivilege('Dashboard', 'Visualizar');
  
  // Verificar si el usuario tiene acceso a algún módulo administrativo
  // Lista de módulos administrativos
  const administrativeModules = [
    'Dashboard',
    'Gestión de Usuarios',
    'Gestión de Compras',
    'Gestión de Servicios',
    'Clientes',
    'Citas',
    'Pedidos',
    'Ventas',
    'Venta de Productos',
    'Productos',
    'Compras',
    'Proveedores',
    'Categorías de Productos',
    'Categorías de Servicios',
    'Servicios',
    'Empleados',
    'Programación'
  ];
  
  // Verificar si tiene acceso a algún módulo
  const hasAnyModuleAccess = currentUser?.privileges && administrativeModules.some(module => {
    const modulePrivileges = currentUser.privileges[module];
    return modulePrivileges && (
      modulePrivileges.Visualizar === true || 
      modulePrivileges['Visualizar'] === true ||
      modulePrivileges.Read === true
    );
  });
  
  // Si no tiene acceso completo al dashboard pero tiene acceso a algún módulo, mostrar AccessCards
  // Si no tiene acceso a ningún módulo, redirigir
  if (!hasFullDashboardAccess) {
    if (hasAnyModuleAccess) {
      return <AccessCards />;
    } else {
      // Si no tiene acceso a ningún módulo, mostrar mensaje de acceso denegado
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sin acceso</h2>
            <p className="text-gray-600">
              No tienes permisos para acceder a ningún módulo del sistema.
              Contacta a un administrador para obtener los permisos necesarios.
            </p>
          </div>
        </div>
      );
    }
  }

  // Ventas de productos (solo completadas/no canceladas) - Usar datos reales cuando estén disponibles
  const ventasProductos =
    realSales.length > 0
      ? realSales
          .filter(
            (sale) => sale.estado !== "Cancelada" && sale.estado !== "Anulada"
          )
          .reduce((acc, sale) => acc + (sale.total || sale.valor || 0), 0)
      : sales
          .filter(
            (sale) => sale.estado !== "Cancelada" && sale.estado !== "Anulada"
          )
          .reduce((acc, sale) => acc + (sale.valor || sale.total || 0), 0);

  // Ventas de servicios (solo pagados/no anulados) - Mantener mock por ahora
  const ventasServicios = services
    .filter(
      (order) => order.status !== "Anulado" && order.status !== "Cancelada"
    )
    .reduce((acc, order) => acc + (order.totalServices || 0), 0);

  const totalVentas = ventasProductos + ventasServicios;

  const stats = [
    {
      title: "Total Ventas",
      value: `$${totalVentas.toLocaleString("es-CO")}`,
      color: "bg-gradient-to-r from-purple-500 to-green-700",
      icon: <FaMoneyBillWave className="text-3xl text-green-600" />,
    },
    {
      title: "Ventas Productos",
      value: `$${ventasProductos.toLocaleString("es-CO")}`,
      color: "bg-gradient-to-r from-purple-500 to-[cfb997]-700",
      icon: <FaBoxOpen className="text-3xl text-[cfb997]-600" />,
    },
    {
      title: "Ventas Servicios",
      value: `$${ventasServicios.toLocaleString("es-CO")}`,
      color: "bg-gradient-to-r from-purple-500 to-purple-700",
      icon: <FaUserTie className="text-3xl text-blue-600" />,
    },
  ];

  // Selector de mes (actual y tres meses atrás)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  // Generar opciones de meses
  const monthOptions = [];
  for (let i = 0; i < 4; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    monthOptions.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`,
      label: `${mesesES[date.getMonth()]} ${date.getFullYear()}`,
    });
  }
  // Parsear mes seleccionado
  const [selYear, selMonth] = selectedMonth.split("-").map(Number);

  // Filtrar datos según mes seleccionado
  const dailyDataFiltered = Array.from(
    { length: new Date(selYear, selMonth, 0).getDate() },
    (_, i) => ({
      day: String(i + 1).padStart(2, "0"),
      productos: 0,
      servicios: 0,
    })
  );
  sales.forEach((sale) => {
    if (sale.estado !== "Cancelada" && sale.estado !== "Anulada") {
      const fecha = new Date(sale.fecha || sale.createdAt || sale.date || null);
      if (
        fecha.getMonth() + 1 === selMonth &&
        fecha.getFullYear() === selYear
      ) {
        const dayIdx = fecha.getDate() - 1;
        dailyDataFiltered[dayIdx].productos += sale.valor || sale.total || 0;
      }
    }
  });
  services.forEach((order) => {
    if (order.status !== "Anulado" && order.status !== "Cancelada") {
      if (order.date) {
        const [day, monthStr, yearStr] = order.date.split("/");
        const fecha = new Date(`${yearStr}-${monthStr}-${day}`);
        if (
          fecha.getMonth() + 1 === selMonth &&
          fecha.getFullYear() === selYear
        ) {
          const dayIdx = fecha.getDate() - 1;
          dailyDataFiltered[dayIdx].servicios += order.totalServices || 0;
        }
      }
    }
  });
  // Top servicios filtrados
  const serviciosMes = {};
  services.forEach((order) => {
    if (
      order.status !== "Anulado" &&
      order.status !== "Cancelada" &&
      order.date
    ) {
      const [d, m, y] = order.date.split("/");
      const fecha = new Date(`${y}-${m}-${d}`);
      if (
        fecha.getMonth() + 1 === selMonth &&
        fecha.getFullYear() === selYear
      ) {
        (order.servicios || []).forEach((serv) => {
          if (!serviciosMes[serv.name]) {
            serviciosMes[serv.name] = {
              nombre: serv.name,
              cantidad: 0,
              total: 0,
            };
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
    topServicios.push({ nombre: "", cantidad: 0, total: 0 });
  }
  // Top productos filtrados
  const productosMes = {};
  sales.forEach((sale) => {
    if (sale.estado !== "Cancelada" && sale.estado !== "Anulada") {
      const fecha = new Date(sale.fecha || sale.createdAt || sale.date || null);
      if (
        fecha.getMonth() + 1 === selMonth &&
        fecha.getFullYear() === selYear
      ) {
        (sale.productos || []).forEach((prod) => {
          if (!productosMes[prod.nombre || prod.name]) {
            productosMes[prod.nombre || prod.name] = {
              nombre: prod.nombre || prod.name,
              cantidad: 0,
              total: 0,
            };
          }
          productosMes[prod.nombre || prod.name].cantidad +=
            prod.cantidad || prod.quantity || 1;
          productosMes[prod.nombre || prod.name].total +=
            (prod.precio || prod.price || 0) *
            (prod.cantidad || prod.quantity || 1);
        });
      }
    }
  });
  services.forEach((order) => {
    if (
      order.status !== "Anulado" &&
      order.status !== "Cancelada" &&
      order.date
    ) {
      const [d, m, y] = order.date.split("/");
      const fecha = new Date(`${y}-${m}-${d}`);
      if (
        fecha.getMonth() + 1 === selMonth &&
        fecha.getFullYear() === selYear
      ) {
        (order.productos || []).forEach((prod) => {
          if (!productosMes[prod.name]) {
            productosMes[prod.name] = {
              nombre: prod.name,
              cantidad: 0,
              total: 0,
            };
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
    topProductos.push({ nombre: "", cantidad: 0, total: 0 });
  }

  // Calcular totales de ventas por mes (últimos 6 meses)
  const hoy = new Date();
  const mesesData = [];
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const year = fecha.getFullYear();
    const month = fecha.getMonth();
    // Sumar ventas de productos de ese mes
    const totalProductos = sales
      .filter((sale) => {
        const f = new Date(sale.fecha || sale.createdAt || sale.date || null);
        return (
          f.getMonth() === month &&
          f.getFullYear() === year &&
          sale.estado !== "Cancelada" &&
          sale.estado !== "Anulada"
        );
      })
      .reduce((acc, sale) => acc + (sale.valor || sale.total || 0), 0);
    // Sumar ventas de servicios de ese mes
    const totalServicios = services
      .filter((order) => {
        if (!order.date) return false;
        const [d, m, y] = order.date.split("/");
        const f = new Date(`${y}-${m}-${d}`);
        return (
          f.getMonth() === month &&
          f.getFullYear() === year &&
          order.status !== "Anulado" &&
          order.status !== "Cancelada"
        );
      })
      .reduce((acc, order) => acc + (order.totalServices || 0), 0);
    mesesData.push({
      mes: `${mesesES[month]}`,
      total: totalProductos + totalServicios,
    });
  }

  // Calcular datos anuales para la gráfica comparativa
  const annualData = {};
  // Recolectar todos los años presentes en ventas y servicios
  const allYears = new Set();
  sales.forEach((sale) => {
    const fecha = new Date(sale.fecha || sale.createdAt || sale.date || null);
    if (!isNaN(fecha)) allYears.add(fecha.getFullYear());
  });
  services.forEach((order) => {
    if (order.date) {
      const [d, m, y] = order.date.split("/");
      const fecha = new Date(`${y}-${m}-${d}`);
      if (!isNaN(fecha)) allYears.add(fecha.getFullYear());
    }
  });
  Array.from(allYears)
    .sort()
    .forEach((year) => {
      annualData[year] = Array(12).fill(0);
    });
  sales.forEach((sale) => {
    const fecha = new Date(sale.fecha || sale.createdAt || sale.date || null);
    if (!isNaN(fecha)) {
      const year = fecha.getFullYear();
      const month = fecha.getMonth();
      if (annualData[year])
        annualData[year][month] += sale.valor || sale.total || 0;
    }
  });
  services.forEach((order) => {
    if (order.date) {
      const [d, m, y] = order.date.split("/");
      const fecha = new Date(`${y}-${m}-${d}`);
      if (!isNaN(fecha)) {
        const year = fecha.getFullYear();
        const month = fecha.getMonth();
        if (annualData[year])
          annualData[year][month] += order.totalServices || 0;
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Título del Dashboard */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Resumen general del sistema
          </p>
        </div>

        {/* Cards de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.color} rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gráficas y Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Gráfica de Ventas Mensuales */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Ventas Diarias del Mes
              </h3>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <MonthlySalesChart data={dailyDataFiltered} />
          </div>

          {/* Widget de Pedidos Recientes */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  Pedidos Recientes
                </h3>
                <p className="text-sm text-gray-600">Últimos 5 pedidos</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <i className="bi bi-receipt text-blue-500 text-xl"></i>
              </div>
            </div>
            <div className="space-y-4">
              {realOrders && realOrders.length > 0 ? (
                realOrders
                  .filter((order) => {
                    if (!order) return false;
                    const estado = order.estado || order.status || "";
                    return estado === "Pendiente" || estado === "En proceso";
                  })
                  .slice(0, 5)
                  .map((order, idx) => {
                    const id = order.id_pedido || order.id || 0;
                    const fecha =
                      order.fecha_pedido ||
                      order.fecha ||
                      order.createdAt ||
                      "Sin fecha";
                    const total = parseFloat(order.total || order.valor || 0);
                    const estado = order.estado || order.status || "Pendiente";

                    return (
                      <div
                        key={id || `order-${idx}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#FACC15] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-xs font-bold text-[#1E1E1E]">
                              {idx + 1}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 group-hover:text-[#FACC15] transition-colors">
                              PED-{id > 0 ? id.toString().padStart(6, "0") : "000000"}
                            </p>
                            <p className="text-xs text-gray-600">
                              {typeof fecha === "string"
                                ? fecha.split("T")[0]
                                : "Sin fecha"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-800">
                            ${!isNaN(total) ? total.toLocaleString("es-CO") : "0"}
                          </p>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                              estado === "Completado" || estado === "Completada"
                                ? "bg-green-100 text-green-800"
                                : estado === "Pendiente"
                                ? "bg-yellow-100 text-yellow-800"
                                : estado === "En proceso"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {estado}
                          </span>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-sm text-gray-500">No hay pedidos pendientes</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                className="w-full bg-[#FACC15] hover:bg-yellow-400 text-[#1E1E1E] font-semibold py-2 px-4 rounded-lg transition-colors"
                onClick={() => (window.location.href = "/dashboard/pedidos")}
              >
                Gestionar pedidos
              </button>
            </div>
          </div>

          {/* Gráfica de Totales Mensuales */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Totales por Mes (Últimos 6 meses)
            </h3>
            <MonthlyTotalsChart data={mesesData} />
          </div>

          {/* Top Servicios */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Top 5 Servicios
            </h3>
            <TopServicesChart data={topServicios} />
          </div>

          {/* Top Productos */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Top 5 Productos
            </h3>
            <TopProductsChart data={topProductos} />
          </div>

          {/* Gráfica Comparativa Anual */}
          <div className="xl:col-span-3 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Comparativa Anual
            </h3>
            <AnnualComparisonChart data={annualData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
