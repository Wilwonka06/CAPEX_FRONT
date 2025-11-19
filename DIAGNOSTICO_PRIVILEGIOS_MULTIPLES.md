# 📋 DIAGNÓSTICO: Bug en Asignación de Múltiples Privilegios por Permiso

## ✅ ANÁLISIS COMPLETADO

### 🔍 FLUJO DE DATOS VERIFICADO

1. **PrivilegesTable.jsx** → Checkboxes llaman `onChange(mod, action, checked)` ✅
2. **CreateRole.jsx** → `handlePrivilegeChange` actualiza estado con spread operator ✅
3. **CreateRole.jsx** → `handleSubmit` pasa `(formData, privileges)` a `onCreate` ✅
4. **RolesPage.jsx** → `handleCreateRole` combina: `{ ...newRole, privileges }` ✅
5. **useRoles.jsx** → `addRole(roleData)` recibe objeto con `privileges` ✅
6. **RolesApiService.js** → `createRole(roleData)` llama `DataMapper.mapRoleToBackend(roleData)` ✅
7. **DataMapper.js** → `convertPrivilegesToBackendFormat(roleData.privileges)` procesa ✅

### 📊 ESTRUCTURA DEL ESTADO DE PRIVILEGIOS

**Formato correcto (verificado en código):**
```javascript
{
  "Gestión de Usuarios": {
    "Crear": true,
    "Visualizar": true,
    "Editar": false,
    "Eliminar": false
  },
  "Dashboard": {
    "Visualizar": true
  }
}
```

✅ **Confirmado:** El estado es un objeto anidado, NO un array plano.

### 🔧 HANDLER DE CHECKBOXES

**Código actual en CreateRole.jsx (líneas 49-63):**
```javascript
const handlePrivilegeChange = (modulo, accion, checked) => {
  setPrivileges(prev => {
    const newPrivileges = {
      ...prev,
      [modulo]: {
        ...prev[modulo],
        [accion]: checked
      }
    };
    console.log(`🔄 Actualizando privilegio: ${modulo} → ${accion} = ${checked}`);
    console.log(`   Estado anterior:`, prev[modulo]);
    console.log(`   Estado nuevo:`, newPrivileges[modulo]);
    return newPrivileges;
  });
};
```

✅ **Verificado:** 
- Usa spread operator correctamente
- Actualiza el estado inmutably
- **LOGS AGREGADOS** para verificar cada cambio

### 🔄 SERIALIZACIÓN EN DATAMAPPER

**Código en DataMapper.js (líneas 147-225):**

La función `convertPrivilegesToBackendFormat`:
1. ✅ Itera sobre cada módulo
2. ✅ Filtra solo privilegios con `=== true`
3. ✅ Crea array de privilegios para cada módulo
4. ✅ Solo agrega módulo si tiene privilegios activos

**LOGS MEJORADOS:**
- Input completo en JSON
- Cada módulo procesado con detalle
- Cada privilegio marcado como ACTIVO/INACTIVO
- Array final con conteo de privilegios

### 📤 PAYLOAD HTTP FINAL

**Logs agregados en RolesApiService.js (líneas 49-68):**
- Input `roleData` completo
- `roleData.privileges` específicamente
- `formattedRole` completo en JSON
- Cada permiso con conteo de privilegios
- Cada privilegio individual con ID

**Interceptor agregado en apiConfig.js (líneas 35-63):**
- Intercepta requests POST/PUT a `/roles`
- Parsea y muestra el body completo
- Verifica estructura de `permisos_privilegios`
- Cuenta privilegios por módulo

### 🧪 CÓMO PROBAR

1. **Abrir DevTools → Console**
2. **Crear un nuevo rol:**
   - Seleccionar 3 privilegios del mismo módulo (ej: Gestión de Usuarios → Crear, Visualizar, Editar)
3. **Revisar logs en consola:**
   - `=== DEBUG CREATE ROLE ===` → Verifica estado antes de enviar
   - `🔄 Actualizando privilegio` → Verifica cada checkbox
   - `🔄 CONVERTIR A BACKEND FORMAT` → Verifica conversión
   - `🚀 CREATE ROLE` → Verifica payload final
   - `🚀 INTERCEPTED REQUEST TO /roles` → Verifica HTTP request

4. **Abrir DevTools → Network:**
   - Filtrar por "roles"
   - Click en el request POST
   - Ver pestaña "Payload" o "Request"
   - **Verificar que `permisos_privilegios[0].privilegios` tenga 3 elementos**

### 🎯 HIPÓTESIS VALIDADAS

#### ✅ Hipótesis 1: "Los checkboxes NO actualizan correctamente el estado"
**ESTADO:** REFUTADA
- El código usa spread operator correctamente
- Los logs ahora muestran cada cambio de estado
- **ACCIÓN:** Si el bug persiste, los logs mostrarán dónde se pierde el estado

#### ✅ Hipótesis 2: "La función `convertPrivilegesToBackendFormat` está sobrescribiendo el array"
**ESTADO:** REFUTADA
- El código usa `.push()` correctamente
- Los logs muestran cada privilegio agregado
- **ACCIÓN:** Los logs mostrarán si algún privilegio no se agrega

#### ⚠️ Hipótesis 3: "Los mapeos de DataMapper retornan `undefined`"
**ESTADO:** POR VERIFICAR
- Los mapeos están hardcodeados en `DataMapper.js`
- Los logs ahora muestran si un ID no se encuentra
- **ACCIÓN:** Si un privilegio tiene `id=undefined`, los logs lo mostrarán

### 📝 CÓDIGO EXACTO QUE PODRÍA FALLAR

**Si el bug persiste, revisar:**

1. **CreateRole.jsx línea 49-63:** `handlePrivilegeChange`
   - Si hay race conditions con múltiples clicks rápidos
   - Si el estado previo no se actualiza correctamente

2. **DataMapper.js línea 179-196:** Loop de privilegios
   - Si `permisos[accion] === true` no se evalúa correctamente
   - Si `this.PRIVILEGE_IDS[accion]` retorna `undefined`

3. **RolesPage.jsx línea 48:** `handleCreateRole`
   - Si `{ ...newRole, privileges }` no combina correctamente

### 🔍 PRÓXIMOS PASOS

1. **Ejecutar la aplicación con los logs agregados**
2. **Crear un rol con 3 privilegios del mismo módulo**
3. **Revisar la consola completa:**
   - ¿Cuántos privilegios muestra "Total privilegios seleccionados"?
   - ¿Cuántos privilegios muestra "Total privilegios para [módulo]"?
   - ¿Cuántos privilegios muestra el interceptor HTTP?
4. **Revisar Network tab:**
   - ¿El payload HTTP tiene el array completo?
5. **Si el bug persiste:**
   - Los logs mostrarán exactamente dónde se pierden los privilegios
   - Comparar los 3 puntos de verificación (estado → conversión → HTTP)

### ✅ CRITERIO DE ÉXITO

El payload HTTP debe verse así:

```json
{
  "permisos_privilegios": [
    {
      "id_permiso": 4,
      "nombre": "Gestión de Usuarios",
      "privilegios": [
        {"id_privilegio": 1, "nombre": "Crear"},
        {"id_privilegio": 2, "nombre": "Visualizar"},
        {"id_privilegio": 3, "nombre": "Editar"}
      ]
    }
  ]
}
```

**Si `privilegios.length` es 3 → ✅ BUG RESUELTO**
**Si `privilegios.length` es 0 o 1 → ❌ BUG CONFIRMADO, los logs mostrarán dónde**

---

## 📦 CAMBIOS IMPLEMENTADOS

### 1. CreateRole.jsx
- ✅ Logs detallados en `handleSubmit` (líneas 71-90)
- ✅ Logs en `handlePrivilegeChange` (líneas 58-60)
- ✅ Conteo de privilegios seleccionados

### 2. DataMapper.js
- ✅ Logs detallados en `convertPrivilegesToBackendFormat` (líneas 148-224)
- ✅ Verificación de cada privilegio (ACTIVO/INACTIVO)
- ✅ Conteo de privilegios por módulo

### 3. RolesApiService.js
- ✅ Logs en `createRole` (líneas 51-68)
- ✅ Verificación del payload antes de enviar

### 4. apiConfig.js
- ✅ Interceptor específico para `/roles` (líneas 35-63)
- ✅ Parseo y visualización del body HTTP

---

**Fecha:** $(date)
**Estado:** Logs agregados, listo para pruebas

