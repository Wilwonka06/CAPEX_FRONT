# 🚀 Migración de Datos de Empleados

## Problema
Los empleados registrados localmente no aparecen en la API desplegada en producción.

## Solución

### Opción 1: Migración Automática (Recomendada)
1. **Ejecuta el script de migración:**
   ```bash
   cd src/features/dashboard/pages/employees
   node migrateData.js
   ```

2. **El script automáticamente:**
   - Lee empleados de tu base local
   - Los crea en la base de producción
   - Evita duplicados
   - Muestra progreso y estadísticas

### Opción 2: Recrear Manualmente con Interfaz Web
1. **Abre `testApi.html` en tu navegador**
2. **Cambia la URL a producción** (ya está configurada por defecto)
3. **Haz clic en "Poblar Datos de Prueba"**
4. **O crea empleados individualmente** con el formulario

### Opción 3: Usar Script de Bash
1. **Ejecuta el script de pruebas:**
   ```bash
   cd src/features/dashboard/pages/employees
   chmod +x testApi.sh
   ./testApi.sh
   ```

## Verificación
Después de migrar, verifica que los empleados aparezcan en:
- ✅ La tabla de empleados en tu app React
- ✅ La interfaz de `testApi.html`
- ✅ Las llamadas directas a la API

## Archivos de Migración
- `migrateData.js` - Script de migración automática
- `testApi.html` - Interfaz web para gestión manual
- `testApi.sh` - Script de línea de comandos
- `seedEmployees.js` - Para poblar datos de prueba localmente
- `checkLocalData.js` - Para verificar qué datos tienes localmente

## 🔧 Solución de Problemas

### Si la migración falla con errores de validación:

1. **Verifica tus datos locales:**
   ```bash
   node checkLocalData.js
   ```

2. **Campos requeridos que deben existir:**
   - `nombre` (no vacío)
   - `apellido` (no vacío)
   - `documento` (no vacío, único)
   - `correo` (no vacío, válido, único)

3. **Campos opcionales con valores por defecto:**
   - `tipo_documento`: 'CC' (si no existe)
   - `estado`: 'Activo' (si no existe)
   - `rol`: 'Empleado' (si no existe)

4. **Si faltan datos, crea empleados válidos:**
   ```bash
   node seedEmployees.js
   ```

### Errores comunes:
- **SequelizeValidationError**: Campos requeridos faltantes o formato inválido
- **Duplicados**: Documentos o correos ya existen en producción
- **Campos requeridos**: nombre, documento, correo (apellido ya no es requerido)

## Notas Importantes
- La migración evita duplicados verificando el campo `documento`
- Los empleados se crean con rol 'Empleado' automáticamente
- Las contraseñas se generan automáticamente en el backend
- Revisa los logs de Render si hay errores durante la migración