/**
 * Componentes de Skeleton para el Dashboard
 * Solo para áreas de contenido (gráficos, tablas, listas)
 */

// Skeleton solo para el contenido de gráficos
export const ChartContentSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-100 rounded-lg"></div>
  </div>
);

// Skeleton solo para el contenido de pedidos (lista)
export const OrdersListSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-2xl"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-20"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="h-5 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-6 bg-gray-100 rounded-full w-24"></div>
        </div>
      </div>
    ))}
  </div>
);

// Skeleton solo para el contenido de Top Services/Products
export const TopListContentSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
    <div>
      <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div>
      <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Componente completo de skeleton para el dashboard (solo contenido)
const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen rounded-xl bg-gradient-to-br from-white via-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header del Dashboard - Mantener visible */}
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
            </div>
          </div>
        </div>

        {/* Cards de Estadísticas - Mostrar skeleton solo en valores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Gráficas - Mantener headers, skeleton solo en contenido */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#1E1E1E] font-montserrat">
                  Ventas Diarias del Mes
                </h3>
                <p className="text-sm text-gray-600 font-lato">Análisis detallado de ventas por día</p>
              </div>
              <ChartContentSkeleton />
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#1E1E1E] mb-2 font-montserrat">
                  Totales por Mes
                </h3>
                <p className="text-sm text-gray-600 font-lato">Últimos 6 meses de actividad</p>
              </div>
              <ChartContentSkeleton />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#1E1E1E] mb-2 font-montserrat">
                Top Servicios y Productos
              </h3>
              <p className="text-sm text-gray-600 font-lato">Más solicitados y vendidos este mes</p>
            </div>
            <TopListContentSkeleton />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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
              <OrdersListSkeleton />
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#1E1E1E] mb-2 font-montserrat">
                  Comparativa Anual
                </h3>
                <p className="text-sm text-gray-600 font-lato">Comparación de ventas año a año</p>
              </div>
              <ChartContentSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;

