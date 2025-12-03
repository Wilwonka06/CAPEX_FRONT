# Prompt para Cursor Pro Trial - Ordenamiento de Usuarios

## Contexto del Problema

En el archivo `src/features/dashboard/pages/users/users.jsx`, necesito restaurar el ordenamiento original que tenía la lista de usuarios y luego modificarlo para que un usuario específico aparezca primero.

**Situación actual:**
- El ordenamiento original mostraba primero a los usuarios con rol "Superadmin" o "Administrador"
- Actualmente el ordenamiento está roto y muestra primero a "Isabel Muñoz" en lugar del orden correcto
- Necesito que "Ronald Erazo Valencia" (documento: "1033488966") aparezca siempre primero en la lista

## Requerimientos

1. **Restaurar el ordenamiento original:**
   - Los usuarios deben ordenarse primero por rol (Superadmin/Administrador primero, luego otros roles)
   - Dentro de cada grupo de rol, ordenar alfabéticamente por nombre
   - Este era el comportamiento original antes de que se rompiera

2. **Modificar para prioridad especial:**
   - El usuario "Ronald Erazo Valencia" con documento "1033488966" debe aparecer SIEMPRE primero en la lista
   - Esta prioridad debe aplicarse ANTES del ordenamiento por rol
   - El resto de usuarios deben seguir el ordenamiento original (por rol, luego alfabético)

3. **Implementación:**
   - Modificar el `useEffect` que sincroniza `filteredUsers` con `users` (líneas 57-60 aproximadamente)
   - Aplicar el ordenamiento personalizado que:
     a. Primero: Ronald Erazo Valencia (documento 1033488966)
     b. Segundo: Usuarios con rol "Superadmin" o "Administrador" (ordenados alfabéticamente)
     c. Tercero: Resto de usuarios (ordenados alfabéticamente por nombre)

## Detalles Técnicos

- El array `users` viene del backend y cada usuario tiene:
  - `nombre`: string
  - `documento`: string
  - `rol`: objeto con `nombre` (puede ser "Superadmin", "Administrador", "Cliente", etc.)
  - `roles`: array de objetos con roles múltiples (cada rol tiene `nombre`)

- El ordenamiento debe aplicarse en el `useEffect` que actualiza `filteredUsers`
- NO debe afectar el filtrado por búsqueda (`searchTerm`)
- NO debe afectar la paginación

## Código de Referencia

El archivo está en: `src/features/dashboard/pages/users/users.jsx`

El `useEffect` relevante está alrededor de las líneas 57-60:
```javascript
// Sincronizar filteredUsers con users
useEffect(() => {
  setFilteredUsers(users);
}, [users]);
```

## Resultado Esperado

1. Ronald Erazo Valencia (1033488966) → SIEMPRE PRIMERO
2. Usuarios con rol Superadmin/Administrador → ordenados alfabéticamente
3. Resto de usuarios → ordenados alfabéticamente por nombre

## Notas Importantes

- Verificar que el usuario tenga el campo `rol.nombre` o `roles[].nombre` para determinar el rol
- Si un usuario tiene múltiples roles, considerar el primero o el más importante
- El ordenamiento debe ser estable (no cambiar el orden de usuarios iguales entre renders)
- Mantener la funcionalidad de filtrado y búsqueda intacta

