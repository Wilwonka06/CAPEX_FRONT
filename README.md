# CAPEX Frontend

Aplicación web desarrollada con **React + Vite** para la operación de una plataforma CAPEX orientada a gestión comercial y de servicios, con módulos para administración, ventas, inventario, clientes, compras, agenda y experiencia de cliente.

## 1) Objetivo del proyecto

Estandarizar y digitalizar los procesos principales del negocio mediante una interfaz moderna, modular y escalable que permita:

- Gestión de usuarios, roles y privilegios.
- Gestión de productos, servicios, categorías y proveedores.
- Registro de ventas de productos y ventas de servicios.
- Gestión de órdenes, compras, cotizaciones y citas.
- Visualización de métricas operativas mediante dashboards.
- Flujo de cliente para catálogo, carrito, checkout y seguimiento.

## 2) Stack tecnológico

### Lenguajes y tecnologías base

- **JavaScript (ES Modules)**
- **JSX**
- **CSS3**
- **HTML5**

### Frameworks y librerías principales

- **React 18** (arquitectura de componentes).
- **Vite 5** (build tool y servidor de desarrollo).
- **React Router DOM 7** (enrutamiento).
- **Tailwind CSS 3** (estilos utilitarios).
- **Axios** (consumo de APIs HTTP).
- **Vitest + Testing Library** (pruebas unitarias e integración de UI).
- **ESLint 9** (calidad estática de código).

### Librerías de dominio/UI destacadas

- **FullCalendar** (agenda/planificación).
- **Chart.js + Recharts** (analítica y visualización).
- **React Hot Toast / SweetAlert2** (feedback transaccional).
- **jsPDF / xlsx** (exportación documental).

## 3) Arquitectura y organización técnica

El proyecto está organizado por **features** para mejorar mantenibilidad y escalabilidad:

- `src/features/auth`: autenticación, recuperación de contraseña y control de acceso.
- `src/features/dashboard`: módulos internos (usuarios, productos, servicios, compras, ventas, citas, etc.).
- `src/features/landing`: experiencia pública/cliente (home, catálogo, carrito, checkout, órdenes).
- `src/shared`: utilidades transversales, servicios compartidos, componentes comunes, estilos y configuración.
- `src/routes`: definición de rutas de aplicación.

Patrones aplicados:

- **Separación por capas funcionales** (UI, servicios API, utilidades).
- **Composición de componentes** reutilizables.
- **Context API** para estado global de autenticación y carritos donde aplica.
- **Servicios desacoplados** para interacción con backend.

## 4) Metodología de trabajo recomendada

Para la evolución del proyecto se recomienda una metodología **ágil incremental** basada en:

1. **Planificación por iteraciones cortas** (sprints de 1–2 semanas).
2. **Definición de historias de usuario** con criterios de aceptación claros.
3. **Desarrollo guiado por tickets** (feature, bugfix, chore, refactor).
4. **Validación técnica previa al merge**:
   - `npm run lint`
   - `npm run test`
   - `npm run build`
5. **Revisión de código (Pull Request)** con checklist técnico:
   - Cobertura funcional mínima.
   - Consistencia de estilos y naming.
   - Verificación de impactos colaterales.

## 5) Flujo de desarrollo local

### Prerrequisitos

- **Node.js 20+** (recomendado).
- **npm 10+** (o equivalente compatible).

### Instalación

```bash
npm install
```

### Ejecución en desarrollo

```bash
npm run dev
```

### Build de producción

```bash
npm run build
```

### Vista previa local del build

```bash
npm run preview
```

### Calidad y pruebas

```bash
npm run lint
npm run test
```

## 6) Convenciones de colaboración

Para trabajo colaborativo profesional:

- Utilizar ramas con prefijos: `feature/`, `fix/`, `refactor/`, `chore/`.
- Registrar cambios con commits semánticos (ej.: `feat:`, `fix:`, `docs:`).
- Acompañar cada PR con:
  - contexto de negocio,
  - alcance técnico,
  - evidencia de pruebas,
  - riesgos conocidos.

### Roles de colaboradores (referencia)

- **Product Owner**: prioriza backlog y criterios de aceptación.
- **Frontend Engineer**: desarrolla features UI/UX y lógica de cliente.
- **QA Engineer**: valida criterios funcionales y regresiones.
- **Tech Lead / Reviewer**: aprueba arquitectura, calidad y estándares.

> Sugerencia: mantener un archivo `CONTRIBUTORS.md` con responsables y ownership por módulo.

## 7) Seguridad y buenas prácticas

- No versionar secretos ni credenciales en el repositorio.
- Centralizar endpoints y configuración en archivos de `shared/config`.
- Validar entradas de usuario y normalizar payloads antes de enviarlos al backend.
- Mantener dependencias actualizadas y auditar cambios en cada release.

## 8) Estado funcional (alto nivel)

La base actual contempla módulos operativos de:

- Autenticación y gestión de accesos.
- Gestión administrativa integral (catálogos, operaciones y seguimiento).
- Front de cliente para consulta y compra.
- Reportería y analítica básica en paneles.

## 9) Usuarios de prueba (entorno local)

- `jhoser@gmail.com` / `Jhoser@2025` → cliente
- `admin@capex.com` / `Admin@2025` → administrador

---

Si deseas, en una siguiente iteración puedo extender esta documentación con:

- diagrama de arquitectura (C4 nivel contenedor/componente),
- matriz de módulos vs servicios API,
- guía de despliegue por entorno (dev/qa/prod),
- política de versionado y changelog.
