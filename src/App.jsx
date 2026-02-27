require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { connectDB } = require('./config/database');
const { corsOptions } = require('./config/cors');
const { registerPublicRoutes, registerApiRoutes } = require('./routes');
const ErrorMiddleware = require('./middlewares/ErrorMiddleware');
const AuthMiddleware = require('./middlewares/auth/AuthMiddleware');
const { timeoutMiddleware } = require('./middlewares/timeoutMiddleware');
const { initializeRoles } = require('./config/initRoles');
const { setupAssociations } = require('./config/associations');

const app = express();
const isDev = process.env.NODE_ENV === 'development';

// ============================================
// MIDDLEWARES DE PARSING (DEBEN IR PRIMERO)
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(timeoutMiddleware);

// ============================================
// BASE DE DATOS Y ASOCIACIONES
// ============================================
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}
setupAssociations();
initializeRoles();

// ============================================
// CORS
// ============================================
app.use(cors(corsOptions()));
app.options('*', cors(corsOptions()));

// ============================================
// RUTAS PÚBLICAS (SIN AUTENTICACIÓN)
// ============================================
registerPublicRoutes(app);

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================
app.use('/api', (req, res, next) => {
  // Rutas GET públicas — no requieren autenticación
  const publicRoutes = [
    '/productos',
    '/servicios',
    '/categorias-servicios',
    '/categorias-productos',
    '/empleados',
  ];

  if (isDev) {
    console.log('🔍 Verificando ruta:', req.method, req.path);
  }

  const isPublicRoute =
    req.method === 'GET' &&
    publicRoutes.some(route =>
      req.path === route || req.path.startsWith(route + '/')
    );

  if (isPublicRoute) {
    if (isDev) console.log('✅ Ruta pública, sin autenticación:', req.path);
    return next();
  }

  if (isDev) console.log('🔒 Ruta protegida, requiere token:', req.method, req.path);
  AuthMiddleware.authenticateToken(req, res, next);
});
registerApiRoutes(app);


// 1. Rutas no encontradas (no es un error de Express, es un 404)
app.use(ErrorMiddleware.handleNotFound);

// 2. Errores de sintaxis JSON en el body
app.use(ErrorMiddleware.handleJsonError);

// 3. Errores de validación (express-validator, Sequelize)
app.use(ErrorMiddleware.handleValidationError);

// 4. Errores de base de datos (MySQL/Sequelize)
app.use(ErrorMiddleware.handleDatabaseError);

// 5. Cualquier otro error no manejado — SIEMPRE AL FINAL
app.use(ErrorMiddleware.handleGeneralError);

module.exports = app;
