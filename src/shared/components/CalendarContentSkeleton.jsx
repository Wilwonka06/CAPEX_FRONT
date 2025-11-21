/**
 * Componente de Skeleton solo para el contenido del calendario
 * No incluye header ni barra de búsqueda
 */

const CalendarContentSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      {/* Header del calendario */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded"></div>
        ))}
      </div>

      {/* Celdas del calendario */}
      <div className="grid grid-cols-7 gap-2">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-50 rounded border border-gray-200 p-2">
            <div className="h-4 bg-gray-200 rounded w-6 mb-2"></div>
            <div className="space-y-1">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarContentSkeleton;
