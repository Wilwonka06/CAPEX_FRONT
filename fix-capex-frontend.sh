#!/bin/bash

# ============================================================================
# CAPEX FRONTEND - Script de Correcciones Automáticas
# ============================================================================
# Ejecutar desde la raíz del proyecto frontend:
#   chmod +x fix-capex-frontend.sh && ./fix-capex-frontend.sh
#
# Correcciones incluidas:
#   1. 🔴 ServicesDataService.js - Eliminar funciones rotas con localStorage
#   2. 🔴 apiConfig.js - Mejorar interceptor 401 (sin hard redirect)
#   3. 🟠 OrdersService.js - Eliminar console.logs sensibles en producción
#   4. 🟠 ServicesService.js - Eliminar console.logs en producción
#   5. 🟡 ProfessionalsDataService.js - Agregar feedback al usuario
# ============================================================================

set -e  # Salir si hay error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}  CAPEX FRONTEND - Aplicando correcciones automáticas${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde la raíz del proyecto frontend${NC}"
    echo -e "${YELLOW}   El directorio debe contener package.json y src/${NC}"
    exit 1
fi

# Verificar que es el proyecto CAPEX frontend
if ! grep -q '"name": "capex"' package.json 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Advertencia: No se detectó 'capex' en package.json${NC}"
    read -p "¿Continuar de todos modos? (s/N): " confirm
    if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
        echo -e "${RED}Cancelado.${NC}"
        exit 1
    fi
fi

# Crear backup
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
echo -e "${BLUE}📁 Creando backup en ${BACKUP_DIR}...${NC}"
mkdir -p "$BACKUP_DIR"

# ============================================================================
# FIX 1: ServicesDataService.js - Reescribir completamente
# ============================================================================
echo ""
echo -e "${YELLOW}[1/5] 🔴 Corrigiendo ServicesDataService.js...${NC}"

FILE1="src/shared/services/ServicesDataService.js"
if [ -f "$FILE1" ]; then
    cp "$FILE1" "$BACKUP_DIR/"
    
    cat > "$FILE1" << 'ENDOFFILE'
/**
 * ServicesDataService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Servicio de datos de servicios - SOLO LECTURA desde API
 * 
 * NOTA: Las operaciones de escritura (add/update/delete) deben hacerse
 * directamente con el servicio de API en:
 *   src/features/dashboard/pages/services/API/ServicesService.js
 * 
 * Este archivo existe para compatibilidad con componentes que aún lo importan.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { getAllServices } from '../../features/landing/pages/ServicesPage/api/servicesApi';

// Función para normalizar servicios del backend al formato esperado por el frontend
const normalizeService = (item) => {
  return {
    id: item.id_servicio ?? item.id ?? item.idServicio ?? item.ID,
    name: item.nombre ?? item.name ?? "",
    nombre: item.nombre ?? item.name ?? "",
    descripcion: item.descripcion ?? item.description ?? "",
    duracion: item.duracion ?? item.duration ?? 0,
    precio: item.precio ?? item.price ?? 0,
    price: item.precio ?? item.price ?? 0,
    active: item.estado === "Activo" || item.isActive !== false,
    estado: item.estado ?? (item.isActive === false ? "Inactivo" : "Activo"),
    imagen: item.foto ?? item.imagen ?? item.img ?? null,
    img: item.foto ?? item.imagen ?? item.img ?? null,
    foto: item.foto ?? item.imagen ?? item.img ?? null,
    category: item.categoria?.nombre ?? item.categoriaServicio?.nombre ?? item.category_name ?? item.categoria ?? "General",
    id_categoria_servicio: item.id_categoria_servicio ?? item.categoryId ?? null,
    createdAt: item.createdAt ?? item.fecha_creacion ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? item.fecha_actualizacion ?? new Date().toISOString(),
  };
};

/**
 * Obtener todos los servicios desde la API
 * @returns {Promise<Array>} Array de servicios normalizados
 */
export const getServices = async () => {
  try {
    const services = await getAllServices();
    return (services || []).map(normalizeService);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching services from API:', error);
    }
    return [];
  }
};

/**
 * @deprecated Usar servicesService.create() de src/features/dashboard/pages/services/API/ServicesService.js
 */
export const addService = async () => {
  throw new Error(
    'addService() está deprecado. Usa servicesService.create() de src/features/dashboard/pages/services/API/ServicesService.js'
  );
};

/**
 * @deprecated Usar servicesService.update() de src/features/dashboard/pages/services/API/ServicesService.js
 */
export const updateService = async () => {
  throw new Error(
    'updateService() está deprecado. Usa servicesService.update() de src/features/dashboard/pages/services/API/ServicesService.js'
  );
};

/**
 * @deprecated Usar servicesService.delete() de src/features/dashboard/pages/services/API/ServicesService.js
 */
export const deleteService = async () => {
  throw new Error(
    'deleteService() está deprecado. Usa servicesService.delete() de src/features/dashboard/pages/services/API/ServicesService.js'
  );
};

export default {
  getServices,
  addService,
  updateService,
  deleteService,
};
ENDOFFILE

    echo -e "${GREEN}   ✅ ServicesDataService.js corregido${NC}"
else
    echo -e "${RED}   ❌ Archivo no encontrado: $FILE1${NC}"
fi

# ============================================================================
# FIX 2: apiConfig.js - Mejorar interceptor 401
# ============================================================================
echo ""
echo -e "${YELLOW}[2/5] 🔴 Corrigiendo apiConfig.js (interceptor 401)...${NC}"

FILE2="src/shared/config/apiConfig.js"
if [ -f "$FILE2" ]; then
    cp "$FILE2" "$BACKUP_DIR/"
    
    cat > "$FILE2" << 'ENDOFFILE'
import axios from 'axios';
import { showError } from '../utils/toastUtils';

// ─────────────────────────────────────────────────────────────
// URL BASE — Resuelta por entorno usando variables de Vite
// ─────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : import.meta.env.DEV
    ? 'http://localhost:3000/api'
    : 'https://capex-back.onrender.com/api';

if (import.meta.env.DEV) {
  console.log('🔵 API Config:', {
    BASE_URL,
    MODE: import.meta.env.MODE,
    TIP: 'Configura VITE_API_URL en .env.local para cambiar el backend',
  });
}

// ─────────────────────────────────────────────────────────────
// FLAG PARA PREVENIR MÚLTIPLES REDIRECTS EN 401
// ─────────────────────────────────────────────────────────────
let isRedirecting = false;

// ─────────────────────────────────────────────────────────────
// INSTANCIA DE AXIOS
// ─────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// ─────────────────────────────────────────────────────────────
// INTERCEPTOR DE REQUEST
// ─────────────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`🔵 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────
// INTERCEPTOR DE RESPONSE
// ─────────────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Log de errores sin datos sensibles (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
      });
    }

    // Si el caller quiere manejar el error él mismo, lo respetamos
    if (error.config?.skipGlobalErrorHandling === true) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      // Limpiar datos del usuario
      try { localStorage.removeItem('currentUser'); } catch { /* noop */ }
      
      // Emitir evento para que AuthContext lo maneje
      window.dispatchEvent(new CustomEvent('auth-session-expired', { 
        detail: { reason: 'token_expired' } 
      }));

      // Mostrar error solo una vez y redirigir sin hard reload
      if (!isRedirecting && window.location.pathname !== '/iniciar-sesion') {
        isRedirecting = true;
        showError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        
        // Usar setTimeout para dar tiempo al toast de mostrarse
        setTimeout(() => {
          // Usar history.pushState para evitar reload completo
          window.history.pushState({}, '', '/iniciar-sesion');
          window.dispatchEvent(new PopStateEvent('popstate'));
          
          // Reset flag después de un momento
          setTimeout(() => { isRedirecting = false; }, 2000);
        }, 500);
      }
      
      return Promise.reject(error);
    }

    if (status === 403) {
      showError('No tienes permisos para realizar esta acción.');
      return Promise.reject(error);
    }

    if (status === 404) {
      // No mostrar toast para 404 — el componente lo maneja
      return Promise.reject(error);
    }

    if (status >= 500) {
      showError(message || 'Error interno del servidor. Intenta de nuevo más tarde.');
      return Promise.reject(error);
    }

    if (!error.response) {
      showError('No se puede conectar al servidor. Verifica tu conexión a internet.');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL DE REQUEST
// ─────────────────────────────────────────────────────────────
const apiRequest = {
  get: (url, config = {}) =>
    apiClient.get(url, config).then(r => r.data),

  post: (url, data, config = {}) =>
    apiClient.post(url, data, config).then(r => r.data),

  put: (url, data, config = {}) =>
    apiClient.put(url, data, config).then(r => r.data),

  patch: (url, data, config = {}) =>
    apiClient.patch(url, data, config).then(r => r.data),

  delete: (url, config = {}) =>
    apiClient.delete(url, config).then(r => r.data),
};

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
export const API_CONFIG = {
  BASE_URL,
  TIMEOUT: 15000,
};

export const API_ENDPOINTS = {
  ROLES: '/roles',
  PRIVILEGES: '/privileges',
  USERS: '/usuarios',
  AUTH: '/auth',
  CUSTOMERS: '/customers',
};

export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

export { apiClient, BASE_URL, apiRequest };
export default apiRequest;
ENDOFFILE

    echo -e "${GREEN}   ✅ apiConfig.js corregido${NC}"
else
    echo -e "${RED}   ❌ Archivo no encontrado: $FILE2${NC}"
fi

# ============================================================================
# FIX 3: OrdersService.js - Eliminar console.logs sensibles
# ============================================================================
echo ""
echo -e "${YELLOW}[3/5] 🟠 Corrigiendo OrdersService.js (eliminar logs sensibles)...${NC}"

FILE3="src/features/landing/pages/orders/API/OrdersService.js"
if [ -f "$FILE3" ]; then
    cp "$FILE3" "$BACKUP_DIR/"
    
    # Reemplazar console.log por versiones condicionales
    sed -i.bak "s/console\.log('📡 Fetching orders from:', url);/if (import.meta.env.DEV) console.log('📡 Fetching orders from:', url);/g" "$FILE3"
    sed -i.bak "s/console\.log('📦 Orders response:',/if (import.meta.env.DEV) console.log('📦 Orders response:',/g" "$FILE3"
    sed -i.bak "s/console\.log('ℹ️ No orders found/if (import.meta.env.DEV) console.log('ℹ️ No orders found/g" "$FILE3"
    sed -i.bak "s/console\.log('🚫 Authentication error/if (import.meta.env.DEV) console.log('🚫 Authentication error/g" "$FILE3"
    
    # Eliminar fullResponse de los logs (expone datos sensibles)
    sed -i.bak 's/fullResponse: response/\/\/ fullResponse omitido por seguridad/g' "$FILE3"
    sed -i.bak 's/fullError: error/\/\/ fullError omitido por seguridad/g' "$FILE3"
    
    # Limpiar archivos .bak
    rm -f "$FILE3.bak"
    
    echo -e "${GREEN}   ✅ OrdersService.js corregido${NC}"
else
    echo -e "${YELLOW}   ⚠️ Archivo no encontrado: $FILE3 (puede estar en otra ruta)${NC}"
fi

# ============================================================================
# FIX 4: ServicesService.js (dashboard) - Eliminar console.logs
# ============================================================================
echo ""
echo -e "${YELLOW}[4/5] 🟠 Corrigiendo ServicesService.js (dashboard)...${NC}"

FILE4="src/features/dashboard/pages/services/API/ServicesService.js"
if [ -f "$FILE4" ]; then
    cp "$FILE4" "$BACKUP_DIR/"
    
    # Reemplazar console.log por versiones condicionales
    sed -i.bak "s/console\.log('API Service:/if (import.meta.env.DEV) console.log('API Service:/g" "$FILE4"
    sed -i.bak "s/console\.log('Front-end:/if (import.meta.env.DEV) console.log('Front-end:/g" "$FILE4"
    
    # Limpiar archivos .bak
    rm -f "$FILE4.bak"
    
    echo -e "${GREEN}   ✅ ServicesService.js corregido${NC}"
else
    echo -e "${YELLOW}   ⚠️ Archivo no encontrado: $FILE4${NC}"
fi

# ============================================================================
# FIX 5: ProfessionalsDataService.js - Agregar feedback al usuario
# ============================================================================
echo ""
echo -e "${YELLOW}[5/5] 🟡 Corrigiendo ProfessionalsDataService.js...${NC}"

FILE5="src/shared/services/ProfessionalsDataService.js"
if [ -f "$FILE5" ]; then
    cp "$FILE5" "$BACKUP_DIR/"
    
    cat > "$FILE5" << 'ENDOFFILE'
import { employeesService, recurringSchedulingService } from '../../features/dashboard/pages/employees/API/employeesService';

// ─────────────────────────────────────────────────────────────────────────────
// Convierte empleados al formato de profesionales para el selector de citas
// ─────────────────────────────────────────────────────────────────────────────
const convertEmployeesToProfessionals = (employees) => {
  return employees
    .filter(emp => emp.estado === 'Activo' || emp.estado === true)
    .map(emp => {
      const nombreCompleto = emp.nombre || emp.name || '';
      return {
        id:     emp.id_empleado ?? emp.id_usuario ?? emp.id,
        name:   nombreCompleto,
        active: emp.estado === 'Activo' || emp.estado === true,
        role:   'Empleado',
        phone:  emp.telefono || '',
        email:  emp.correo   || ''
      };
    });
};

const getEmployeesWithSchedule = async () => {
  try {
    const allSchedules = await recurringSchedulingService.getAll();

    // Solo programaciones activas
    const ids = new Set(
      allSchedules
        .filter(s => s.estado === 'Activa' || s.estado === 'Activo')
        .map(s => s.id_usuario || s.idUsuario)
        .filter(Boolean)
    );

    return ids;

  } catch (error) {
    // 401 = sesión expirada → relanzar para que getProfessionals lo maneje
    if (error?.response?.status === 401 || error?.status === 401) {
      throw error;
    }

    // Otros errores (red, 500, etc.) → retornar null como señal de "fallo parcial"
    if (import.meta.env.DEV) {
      console.error('⚠️ Error obteniendo programaciones recurrentes:', error.message || error);
    }
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Resultado con metadata para que el componente pueda mostrar feedback
// ─────────────────────────────────────────────────────────────────────────────
export const getProfessionalsWithStatus = async () => {
  try {
    // 1. Empleados desde la API
    const employees = await employeesService.getAll();
    const allProfessionals = convertEmployeesToProfessionals(employees || []);

    // 2. IDs con programación activa
    let employeesWithSchedule;
    try {
      employeesWithSchedule = await getEmployeesWithSchedule();
    } catch (scheduleError) {
      if (scheduleError?.response?.status === 401 || scheduleError?.status === 401) {
        throw scheduleError;
      }
      employeesWithSchedule = null;
    }

    // 3. Determinar estado y filtrar
    if (employeesWithSchedule === null) {
      return {
        professionals: [],
        status: 'error',
        message: 'No se pudo verificar la disponibilidad de los profesionales. Por favor, intenta de nuevo.'
      };
    }

    if (employeesWithSchedule.size === 0) {
      return {
        professionals: [],
        status: 'empty',
        message: 'No hay profesionales con horario disponible en este momento.'
      };
    }

    const professionals = allProfessionals.filter(p =>
      employeesWithSchedule.has(p.id)
    );

    return {
      professionals,
      status: 'success',
      message: null
    };

  } catch (error) {
    if (error?.response?.status === 401 || error?.status === 401) {
      throw error;
    }
    if (import.meta.env.DEV) {
      console.error('❌ Error obteniendo profesionales:', error.message || error);
    }
    return {
      professionals: [],
      status: 'error',
      message: 'Error al cargar los profesionales. Por favor, intenta de nuevo.'
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Exportación compatible con código existente (retorna solo el array)
// ─────────────────────────────────────────────────────────────────────────────
export const getProfessionals = async () => {
  const result = await getProfessionalsWithStatus();
  return result.professionals;
};

export default {
  getProfessionals,
  getProfessionalsWithStatus,
};
ENDOFFILE

    echo -e "${GREEN}   ✅ ProfessionalsDataService.js corregido${NC}"
else
    echo -e "${RED}   ❌ Archivo no encontrado: $FILE5${NC}"
fi

# ============================================================================
# RESUMEN
# ============================================================================
echo ""
echo -e "${BLUE}============================================================================${NC}"
echo -e "${GREEN}  ✅ CORRECCIONES APLICADAS EXITOSAMENTE${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""
echo -e "${YELLOW}Archivos modificados:${NC}"
echo "  • src/shared/services/ServicesDataService.js"
echo "  • src/shared/config/apiConfig.js"
echo "  • src/features/landing/pages/orders/API/OrdersService.js"
echo "  • src/features/dashboard/pages/services/API/ServicesService.js"
echo "  • src/shared/services/ProfessionalsDataService.js"
echo ""
echo -e "${YELLOW}Backup guardado en:${NC} $BACKUP_DIR"
echo ""
echo -e "${BLUE}Próximos pasos:${NC}"
echo "  1. Ejecutar: npm run build"
echo "  2. Verificar que no haya errores de compilación"
echo "  3. Probar en desarrollo: npm run dev"
echo "  4. Hacer commit de los cambios"
echo ""
echo -e "${GREEN}¡Listo!${NC}"