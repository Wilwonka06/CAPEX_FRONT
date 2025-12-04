// pages/Dashboard.jsx
import { useState, useEffect } from "react";
import MonthlySalesChart from "./MonthlySalesChart";
import MonthlyTotalsChart from "./MonthlyTotalsChart";
import WeeklySalesChart from "./WeeklySalesChart";
import TopServicesChart from "./TopServicesChart";
import TopProductsChart from "./TopProductsChart";
import { FaMoneyBillWave, FaBoxOpen, FaUserTie } from "react-icons/fa";
import AnnualComparisonChart from "./AnnualComparisonChart";
import ReportsPanel from "./ReportsPanel";
import productsService from "../pages/products/API/productsService";
import AccessCards from "./AccessCards";
import { ChartContentSkeleton, OrdersListSkeleton, TopListContentSkeleton } from "./DashboardSkeleton";
import salesService from "../pages/SaleProducts/API/salesService";
import ordersService from "../pages/orders/API/ordersService";
import { useAuth } from "../../../shared/contexts/AuthContext";
import apiRequest from "../../../shared/config/apiConfig";

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
let mesActual = new Date().getMonth();


// Función helper para agrupar servicios por cliente/cita (fuera del componente)
const groupServicesByClient = (serviceDetails) => {
  const grouped = {};
  
  serviceDetails.forEach(detail => {
    const key = detail.id_cita 
      ? `cita_${detail.id_cita}` 
      : `cliente_${detail.id_cliente}_${detail.fecha_programada || 'sin_fecha'}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        id_cita: detail.id_cita,
        id_cliente: detail.id_cliente,
        cliente: detail.cliente || detail.usuario,
        fecha_programada: detail.fecha_programada || detail.fecha_creacion,
        servicios: []
      };
    }
    
    grouped[key].servicios.push(detail);
  });
  
  return Object.values(grouped);
};

// Función helper para transformar detalles de servicio al formato esperado (fuera del componente)
const transformServiceDetailToOrder = (grupo) => {
  const servicios = grupo.servicios || [];
  
  if (servicios.length === 0) {
    return null;
  }
  
  const primerServicio = servicios[0];
  
  // Calcular totales de servicios
  const totalServices = servicios.reduce((sum, servicio) => {
    const precio = parseFloat(servicio.precio_unitario || servicio.precio || 0);
    const cantidad = parseInt(servicio.cantidad || 1);
    return sum + (precio * cantidad);
  }, 0);

  // Obtener fecha
  const fecha = primerServicio.fecha_programada || primerServicio.fecha_creacion || new Date().toISOString();
  const fechaDate = new Date(fecha);
  
  // Formatear fecha al formato DD/MM/YYYY
  const formattedDate = fechaDate.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Determinar estado
  const estados = servicios.map(s => s.estado || s.status);
  const estado = estados.includes('Pagada') ? 'Pagado' : 
                 estados.includes('Finalizada') ? 'Pagado' :
                 estados.includes('En proceso') ? 'En ejecucion' :
                 estados.includes('Cancelada por el usuario') ? 'Anulado' :
                 estados[0] || 'En ejecucion';

  return {
    id: primerServicio.id_cita || primerServicio.id_detalle_servicio,
    clientName: grupo.cliente?.nombre || primerServicio.cliente?.nombre || primerServicio.usuario?.nombre || 'Cliente no especificado',
    status: estado,
    date: formattedDate,
    servicios: servicios.map(servicio => ({
      id: servicio.id_detalle_servicio,
      name: servicio.servicio?.nombre || 'Servicio',
      quantity: parseInt(servicio.cantidad || 1),
      price: parseFloat(servicio.precio_unitario || servicio.precio || 0),
      subtotal: parseFloat(servicio.precio_unitario || servicio.precio || 0) * parseInt(servicio.cantidad || 1),
      employee: {
        name: servicio.empleado?.nombre || 'Empleado no asignado'
      }
    })),
    productos: [],
    totalServices: totalServices,
    fecha_programada: fecha
  };
};

const getStartOfWeek = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // 0 = lunes
  d.setDate(d.getDate() - day);
  return d;
};

const formatWeekRange = (start, end) => {
  const fmt = (dt) =>
    `${String(dt.getDate()).padStart(2, "0")}/${String(
      dt.getMonth() + 1
    ).padStart(2, "0")}`;
  return `${fmt(start)} - ${fmt(end)}`;
};

const Dashboard = () => {
  const { hasPrivilege, currentUser } = useAuth();
  
  // Estados para datos reales
  const [sales, setSales] = useState([]);
  const [services, setServices] = useState([]);
  const [realOrders, setRealOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [topProductosRentables, setTopProductosRentables] = useState([]);

  // ===== CARGAR DATOS REALES =====
  const loadRealData = async () => {
      setLoading(true);
      try {
        // Cargar ventas de productos reales (con límite alto para obtener todas)
        try {
          const salesResponse = await salesService.getAll({ limit: 100 });
          if (salesResponse.success && salesResponse.data) {
            // Transformar datos de ventas al formato esperado
            const transformedSales = salesResponse.data.map(venta => ({
              fecha: venta.fecha || venta.createdAt || new Date().toISOString().split('T')[0],
              valor: venta.valor || venta.total || 0,
              estado: venta.estado || 'Completada',
              productos: venta.productos || [],
              createdAt: venta.fecha || venta.createdAt,
              total: venta.valor || venta.total || 0
            }));
            setSales(transformedSales);
          }
        } catch (error) {
          console.error("Error loading sales:", error);
          setErrors(prev => [...prev, `Ventas: ${error.message || 'Error interno del servidor'}`]);
          setSales([]);
        }

        // Cargar servicios reales desde la API
        try {
          const servicesResponse = await apiRequest.get('/ventas/detalles-servicios');
          let serviceDetails = [];
          
          if (servicesResponse.success && servicesResponse.data) {
            serviceDetails = Array.isArray(servicesResponse.data) ? servicesResponse.data : [];
          } else if (Array.isArray(servicesResponse)) {
            serviceDetails = servicesResponse;
          }

          // Agrupar servicios por cita/cliente y transformar al formato esperado
          const groupedServices = groupServicesByClient(serviceDetails);
          const transformedServices = groupedServices
            .map(transformServiceDetailToOrder)
            .filter(service => service !== null);
          
          setServices(transformedServices);
        } catch (error) {
          console.error("Error loading services:", error);
          setErrors(prev => [...prev, `Servicios: ${error.message || 'Error interno del servidor'}`]);
          setServices([]);
        }

        // Cargar pedidos reales
        try {
          const ordersResponse = await ordersService.getAll({ limit: 50 });
          if (ordersResponse.success) {
            setRealOrders(ordersResponse.data || []);
          }
        } catch (error) {
          console.error("Error loading orders:", error);
          setErrors(prev => [...prev, `Pedidos: ${error.message || 'Error interno del servidor'}`]);
          setRealOrders([]);
        }

        // Cargar productos para mapa de costos y calcular top rentables
        try {
          const productsResp = await productsService.getAll({ limit: 200 });
          const productsArr = productsResp.success ? (productsResp.data || []) : [];
          const costMap = {};
          productsArr.forEach(p => { costMap[p.id] = parseFloat(p.costo || 0); });
          const profitAgg = {};
          sales.forEach((sale) => {
            if (sale.estado === 'Cancelada' || sale.estado === 'Anulada') return;
            (sale.productos || []).forEach(prod => {
              const name = prod.nombre || prod.name;
              const qty = parseInt(prod.cantidad || prod.quantity || 1);
              const price = parseFloat(prod.precio || prod.price || 0);
              const cost = costMap[prod.id_producto || prod.id] || 0;
              const profit = (price - cost) * qty;
              if (!profitAgg[name]) profitAgg[name] = { nombre: name, cantidad: 0, total: 0 };
              profitAgg[name].cantidad += qty;
              profitAgg[name].total += profit;
            });
          });
          const list = Object.values(profitAgg).sort((a, b) => b.total - a.total).slice(0, 5);
          while (list.length < 5) list.push({ nombre: '', cantidad: 0, total: 0 });
          setTopProductosRentables(list);
        } catch (error) {
          console.error('Error calculating top rentable products:', error);
        }

        // Cargar alertas de stock bajo
        try {
          const lowResp = await productsService.getLowStock(5);
          if (lowResp.success) setLowStock(lowResp.data || []);
        } catch (error) {
          console.error("Error loading low stock:", error);
        }
      } catch (error) {
        console.error("Error loading real data for dashboard:", error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    loadRealData();
    const handler = () => loadRealData();
    window.addEventListener('sales-updated', handler);
    window.addEventListener('services-updated', handler);
    return () => {
      window.removeEventListener('sales-updated', handler);
      window.removeEventListener('services-updated', handler);
    };
  }, []);

  // Selector de mes (actual y tres meses atrás) - Debe estar antes de cualquier return condicional
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  
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

  // Ventas de productos (solo completadas/no canceladas)
  const ventasProductos = sales
    .filter(
      (sale) => sale.estado !== "Cancelada" && sale.estado !== "Anulada"
    )
    .reduce((acc, sale) => acc + (sale.valor || sale.total || 0), 0);

  // Ventas de servicios (solo pagados/no anulados)
  const ventasServicios = services
    .filter(
      (order) => order.status !== "Anulado" && order.status !== "Cancelada" && order.status !== "En ejecucion"
    )
    .reduce((acc, order) => acc + (order.totalServices || 0), 0);

  const totalVentas = ventasProductos + ventasServicios;

  const stats = [
    {
      title: "Total Ventas",
      value: `$${totalVentas.toLocaleString("es-CO")}`,
      color: "bg-gradient-to-r from-[#1E1E1E] to-[#2A2A2A]",
      icon: <FaMoneyBillWave className="text-3xl text-[#FACC15]" />,
    },
    {
      title: "Ventas Productos",
      value: `$${ventasProductos.toLocaleString("es-CO")}`,
      color: "bg-gradient-to-r from-[#FACC15] to-yellow-400",
      icon: <FaBoxOpen className="text-3xl text-[#1E1E1E]" />,
    },
    {
      title: "Ventas Servicios",
      value: `$${ventasServicios.toLocaleString("es-CO")}`,
      color: "bg-gradient-to-r from-gray-700 to-gray-900",
      icon: <FaUserTie className="text-3xl text-[#FACC15]" />,
    },
  ];
  
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
      if (!isNaN(fecha.getTime()) && 
          fecha.getMonth() + 1 === selMonth &&
          fecha.getFullYear() === selYear) {
        const dayIdx = fecha.getDate() - 1;
        if (dayIdx >= 0 && dayIdx < dailyDataFiltered.length) {
          dailyDataFiltered[dayIdx].productos += sale.valor || sale.total || 0;
        }
      }
    }
  });
  services.forEach((order) => {
    if (order.status !== "Anulado" && order.status !== "Cancelada") {
      // Intentar parsear fecha desde diferentes formatos
      let fecha = null;
      if (order.date) {
        // Formato DD/MM/YYYY
        const dateParts = order.date.split("/");
        if (dateParts.length === 3) {
          fecha = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
        }
      }
      // Si no se pudo parsear desde date, intentar desde fecha_programada
      if (!fecha && order.fecha_programada) {
        fecha = new Date(order.fecha_programada);
      }
      
      if (fecha && !isNaN(fecha.getTime()) &&
          fecha.getMonth() + 1 === selMonth &&
          fecha.getFullYear() === selYear) {
        const dayIdx = fecha.getDate() - 1;
        if (dayIdx >= 0 && dayIdx < dailyDataFiltered.length) {
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
      order.status !== "Cancelada"
    ) {
      // Intentar parsear fecha desde diferentes formatos
      let fecha = null;
      if (order.date) {
        const dateParts = order.date.split("/");
        if (dateParts.length === 3) {
          fecha = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
        }
      }
      if (!fecha && order.fecha_programada) {
        fecha = new Date(order.fecha_programada);
      }
      
      if (fecha && !isNaN(fecha.getTime()) &&
          fecha.getMonth() + 1 === selMonth &&
          fecha.getFullYear() === selYear) {
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
      order.status !== "Cancelada"
    ) {
      // Intentar parsear fecha desde diferentes formatos
      let fecha = null;
      if (order.date) {
        const dateParts = order.date.split("/");
        if (dateParts.length === 3) {
          fecha = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
        }
      }
      if (!fecha && order.fecha_programada) {
        fecha = new Date(order.fecha_programada);
      }
      
      if (fecha && !isNaN(fecha.getTime()) &&
          fecha.getMonth() + 1 === selMonth &&
          fecha.getFullYear() === selYear) {
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

  // Calcular ventas semanales (últimas 8 semanas)
  const currentWeekStart = getStartOfWeek(new Date());
  const weekKeys = [];
  const weeksMap = {};
  for (let i = 7; i >= 0; i--) {
    const start = new Date(currentWeekStart);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    const key = start.toISOString();
    weekKeys.push(key);
    weeksMap[key] = {
      start,
      end,
      label: `Semana ${formatWeekRange(start, end)}`,
      productos: 0,
      servicios: 0,
    };
  }

  const addAmountToWeek = (amount, type, dateValue) => {
    if (!dateValue) return;
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return;
    for (const key of weekKeys) {
      const info = weeksMap[key];
      if (date >= info.start && date <= info.end) {
        if (type === "productos") {
          info.productos += amount;
        } else {
          info.servicios += amount;
        }
        return;
      }
    }
  };

  sales.forEach((sale) => {
    if (sale.estado === "Cancelada" || sale.estado === "Anulada") return;
    const amount = sale.valor || sale.total || 0;
    const fecha = sale.fecha || sale.createdAt || sale.date || null;
    addAmountToWeek(amount, "productos", fecha);
  });

  services.forEach((order) => {
    if (order.status === "Anulado" || order.status === "Cancelada") return;
    const amount = order.totalServices || 0;
    let fecha = null;
    if (order.date) {
      const parts = order.date.split("/");
      if (parts.length === 3) {
        fecha = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }
    if (!fecha && order.fecha_programada) {
      fecha = new Date(order.fecha_programada);
    }
    addAmountToWeek(amount, "servicios", fecha);
  });

  const weeklyData = weekKeys.map((key) => {
    const info = weeksMap[key];
    const productos = info.productos || 0;
    const servicios = info.servicios || 0;
    return {
      label: info.label,
      productos,
      servicios,
      total: productos + servicios,
    };
  });

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
        // Intentar parsear fecha desde diferentes formatos
        let fecha = null;
        if (order.date) {
          const dateParts = order.date.split("/");
          if (dateParts.length === 3) {
            fecha = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
          }
        }
        if (!fecha && order.fecha_programada) {
          fecha = new Date(order.fecha_programada);
        }
        
        if (!fecha || isNaN(fecha.getTime())) return false;
        
        return (
          fecha.getMonth() === month &&
          fecha.getFullYear() === year &&
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
    // Intentar parsear fecha desde diferentes formatos
    let fecha = null;
    if (order.date) {
      const dateParts = order.date.split("/");
      if (dateParts.length === 3) {
        fecha = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
      }
    }
    if (!fecha && order.fecha_programada) {
      fecha = new Date(order.fecha_programada);
    }
    
    if (fecha && !isNaN(fecha.getTime())) {
      allYears.add(fecha.getFullYear());
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
    // Intentar parsear fecha desde diferentes formatos
    let fecha = null;
    if (order.date) {
      const dateParts = order.date.split("/");
      if (dateParts.length === 3) {
        fecha = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
      }
    }
    if (!fecha && order.fecha_programada) {
      fecha = new Date(order.fecha_programada);
    }
    
    if (fecha && !isNaN(fecha.getTime())) {
      const year = fecha.getFullYear();
      const month = fecha.getMonth();
      if (annualData[year]) {
        annualData[year][month] += order.totalServices || 0;
      }
    }
  });

  // Ya no retornamos skeleton completo, solo mostramos skeletons en áreas de contenido

  return (
    <div className="min-h-screen rounded-xl bg-gradient-to-br from-white via-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {errors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
            <div className="flex items-center justify-between">
              <span className="text-red-700">{errors[0]}</span>
              <button onClick={loadRealData} className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700">Reintentar</button>
            </div>
            {errors.slice(1).map((e, idx) => (
              <div key={idx} className="text-red-700 mt-1">{e}</div>
            ))}
          </div>
        )}
        {/* Header del Dashboard */}
        <div className="bg-gradient-to-r from-[#1E1E1E] to-[#2A2A2A] text-white py-8 relative overflow-hidden rounded-3xl shadow-xl">
          <div className="relative z-10 px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 font-montserrat">
                  Dashboard
                </h1>
                <p className="text-lg text-white/80 font-lato">
                  Resumen general del sistema y métricas de rendimiento
                </p>
              </div>
              {/* Selector de período */}
              <div className="flex items-center gap-4">
                <span className="text-white/90 font-medium font-lato">Período:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 border border-white/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent bg-white/10 text-white placeholder-white/70 backdrop-blur-sm"
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value} className="text-black">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
        </div>
      </div>

        {/* Cards de Estadísticas - Mostrar skeleton solo en valores si loading */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            // Mostrar skeletons en las cards mientras carga
            [...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1 font-lato">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-[#1E1E1E] font-montserrat">{stat.value}</p>
                  </div>
                  <div className="bg-[#FACC15]/10 rounded-xl p-3">
                    <div className="text-[#FACC15]">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Alertas de Stock Bajo */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-[#1E1E1E]">Alertas de Stock Bajo</h3>
            <p className="text-sm text-gray-600">Productos con stock menor o igual a 5</p>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-500">No hay alertas</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                  <span className="text-xs font-medium text-gray-700">{p.nombre}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>disponibles {p.stock}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <ReportsPanel
          weeklyData={weeklyData}
          topServicios={topServicios}
          topProductos={topProductos}
          mesesData={mesesData}
          annualData={annualData}
        />

        {/* Gráficas y Widgets */}
        <div className="space-y-8">
          {/* Primera fila: Ventas Diarias y Totales Mensuales */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Gráfica de Ventas Mensuales */}
            <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[#1E1E1E] font-montserrat">
                    Ventas Diarias de {mesesES[selMonth - 1]} {selYear}
                  </h3>
              </div>
              {loading ? (
                <ChartContentSkeleton />
              ) : (
                <MonthlySalesChart data={dailyDataFiltered} />
              )}
            </div>

            {/* Gráfica de Totales Mensuales */}
            <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#1E1E1E] mb-2 font-montserrat">
                  Totales Ultimos 6 Meses
                </h3>
              </div>
              {loading ? (
                <ChartContentSkeleton />
              ) : (
                <MonthlyTotalsChart data={mesesData} />
              )}
            </div>
          </div>

          {/* Segunda fila: Ventas Semanales */}
          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100">
            <div className="mb-6">
              <div className="gap-2 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-[#1E1E1E] font-montserrat">
                  Ventas Semanales (últimas 8 semanas)
                </h3>
                <div className="flex items-center px-3 py-2 bg-gray-50 rounded-xl border">
                  <h4 className="text-lg font-semibold text-[#1E1E1E] font-montserrat">{mesesES[selMonth - 1]} {selYear}</h4>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-lato">
                Comparativo de productos y servicios por semana
              </p>
            </div>
            {loading ? (
              <ChartContentSkeleton />
            ) : (
              <WeeklySalesChart data={weeklyData} />
            )}
          </div>

          {/* Tercera fila: Top Servicios y Productos */}
          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100">
            <div className="mb-6">
              <div className="gap-2 flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#1E1E1E] mb-2 font-montserrat">
                  Top Servicios y Productos (rentabilidad)
                </h3>
                <div className="flex items-center px-3 py-2 bg-gray-50 rounded-xl border">
                <h4 className="text-lg font-semibold text-[#1E1E1E] font-montserrat">{mesesES[selMonth - 1]} {selYear}</h4>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-lato">Más solicitados y vendidos este mes</p>
            </div>
            {loading ? (
              <TopListContentSkeleton />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-[#1E1E1E] mb-4 font-montserrat">Top 5 Servicios</h4>
                  <TopServicesChart data={topServicios} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[#1E1E1E] mb-4 font-montserrat">Top 5 Productos Rentables</h4>
                  <TopProductsChart data={topProductosRentables.length ? topProductosRentables : topProductos} />
                </div>
              </div>
            )}
          </div>

          {/* Tercera fila: Pedidos Recientes y Comparativa Anual */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Widget de Pedidos Recientes */}
            <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#1E1E1E] mb-1 font-montserrat">
                    Pedidos Recientes
                  </h3>
                  <p className="text-sm text-gray-600 font-lato">Últimos 5 pedidos pendientes</p>
                </div>
                <div className="p-3 bg-[#FACC15]/10 rounded-2xl">
                  <i className="bi bi-receipt text-[#FACC15] text-2xl"></i>
                </div>
              </div>
              {loading ? (
                <OrdersListSkeleton />
              ) : (
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
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300 cursor-pointer group hover:shadow-md"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-[#FACC15] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <span className="text-sm font-bold text-[#1E1E1E]">
                                  {idx + 1}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800 group-hover:text-[#FACC15] transition-colors duration-300 font-montserrat">
                                  PED-{id > 0 ? id.toString().padStart(6, "0") : "000000"}
                                </p>
                                <p className="text-xs text-gray-600 font-lato">
                                  {typeof fecha === "string"
                                    ? fecha.split("T")[0]
                                    : "Sin fecha"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-800 font-montserrat">
                                ${!isNaN(total) ? total.toLocaleString("es-CO") : "0"}
                              </p>
                              <span
                                className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                                  estado === "Completado" || estado === "Completada"
                                    ? "bg-gray-100 text-gray-700"
                                    : estado === "Pendiente"
                                    ? "bg-[#FACC15]/20 text-[#FACC15]"
                                    : estado === "En proceso"
                                    ? "bg-gray-200 text-gray-800"
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
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📦</div>
                      <p className="text-gray-500 font-lato">No hay pedidos pendientes</p>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  className="w-full bg-[#FACC15] hover:bg-yellow-400 text-[#1E1E1E] font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-lato"
                  onClick={() => (window.location.href = "/dashboard/pedidos")}
                >
                  Ir al módulo
                </button>
              </div>
            </div>

            {/* Gráfica Comparativa Anual */}
            <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#1E1E1E] mb-2 font-montserrat">
                  Comparativa Anual
                </h3>
                <p className="text-sm text-gray-600 font-lato">Evolución de ventas por año</p>
              </div>
              {loading ? (
                <ChartContentSkeleton />
              ) : (
                <AnnualComparisonChart data={annualData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
