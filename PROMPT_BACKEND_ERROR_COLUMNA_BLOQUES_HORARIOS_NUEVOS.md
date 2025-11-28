# Prompt para IA del Backend - Error de Columna Inexistente en Base de Datos

## Problema Reportado

El frontend está recibiendo un error al intentar crear una cita. El backend devuelve el siguiente error:

```
Error al crear cita: Unknown column 'bloques_horarios_nuevos' in 'field list'
```

## Contexto del Error

Este es un error de base de datos que indica que el backend está intentando acceder a una columna llamada `bloques_horarios_nuevos` que no existe en la tabla correspondiente.

## Análisis del Error

**Tipo de error**: Error de SQL/Base de Datos
**Código de error**: `Unknown column 'bloques_horarios_nuevos' in 'field list'`
**Causa probable**: El código del backend está intentando insertar o actualizar un campo `bloques_horarios_nuevos` que no existe en la estructura de la base de datos.

## Contexto del Frontend

El frontend está enviando los siguientes datos al endpoint `POST /api/citas`:

### Estructura de datos enviada:
```json
{
  "cita": {
    "id_cliente": <número>,
    "fecha_servicio": "YYYY-MM-DD",
    "hora_entrada": "HH:MM:SS",
    "estado": "Agendada"
  },
  "servicios": [
    {
      "id_servicio": <número>,
      "id_empleado": <número>,
      "hora_inicio": "HH:MM:SS",
      "cantidad": <número>
    }
  ]
}
```

### Ejemplo de datos que se están enviando (caso real que falla):
```json
{
  "cita": {
    "id_cliente": 18,
    "fecha_servicio": "2025-11-27",
    "hora_entrada": "12:00:00",
    "estado": "Agendada"
  },
  "servicios": [
    {
      "id_servicio": 2,
      "id_empleado": 26,
      "hora_inicio": "12:00:00",
      "cantidad": 1
    }
  ]
}
```

**Nota importante**: 
- El frontend NO está enviando ningún campo llamado `bloques_horarios_nuevos`
- El frontend solo envía los campos mostrados arriba
- Este error parece ser generado internamente por el backend durante el procesamiento de la creación de la cita

## Preguntas para el Backend

1. **¿Dónde se está usando la columna `bloques_horarios_nuevos`?**
   - ¿En qué parte del código se está intentando acceder a esta columna?
   - ¿Es en el controlador de citas, en el servicio, o en el modelo?
   - ¿Se está usando en una consulta SQL directa o en un ORM?

2. **¿Cuál es el propósito de `bloques_horarios_nuevos`?**
   - ¿Esta columna debería existir en alguna tabla?
   - ¿Es un campo que se agregó recientemente pero no se creó la migración?
   - ¿Es un campo que se renombró pero el código no se actualizó?

3. **¿Qué tabla está involucrada?**
   - ¿Es la tabla de citas?
   - ¿Es la tabla de servicios de citas?
   - ¿Es alguna tabla relacionada con programaciones?

4. **¿Hay una migración pendiente?**
   - ¿Falta crear una migración para agregar esta columna?
   - ¿O esta columna fue eliminada pero el código aún la referencia?

5. **¿Es un error de código legacy?**
   - ¿Hay código antiguo que está intentando usar esta columna?
   - ¿Se puede eliminar la referencia a esta columna si ya no es necesaria?

## Solución Esperada

Por favor, revisa el endpoint de creación de citas (`POST /api/citas`) y:

1. **Identifica dónde se está usando `bloques_horarios_nuevos`**:
   - Busca en el código todas las referencias a `bloques_horarios_nuevos`
   - Verifica si es un campo necesario o código legacy

2. **Si el campo es necesario**:
   - Crea una migración para agregar la columna `bloques_horarios_nuevos` a la tabla correspondiente
   - O renombra el campo en el código para que coincida con la estructura actual de la base de datos

3. **Si el campo NO es necesario**:
   - Elimina todas las referencias a `bloques_horarios_nuevos` del código
   - Verifica que no haya otras referencias similares que puedan causar el mismo problema

4. **Verifica la estructura de la base de datos**:
   - Confirma qué columnas existen realmente en las tablas relacionadas con citas
   - Asegúrate de que el código solo use columnas que existen

5. **Revisa el flujo de creación de citas**:
   - Verifica que no haya lógica que intente guardar `bloques_horarios_nuevos` cuando se crea una cita
   - Si hay lógica relacionada con programaciones o bloques horarios, verifica que use los campos correctos

## Información Adicional

- El frontend está enviando datos en el formato estándar mostrado arriba
- No hay campos relacionados con `bloques_horarios` en los datos que envía el frontend para crear citas
- El error ocurre durante el procesamiento en el backend, no en la validación inicial

## Nota Importante

Este prompt es solo para el backend. El frontend no necesita cambios ya que no está enviando el campo problemático. El error es completamente interno del backend.

---

## ✅ SOLUCIÓN IMPLEMENTADA (Actualización)

**Fecha de resolución**: 2025-11-27

El backend ha implementado la solución para este problema. Los cambios incluyen:

### Problema Identificado:

1. **Modelo NovedadProgramacion**: Define `bloques_horarios_nuevos` (tipo JSON)
2. **Código en ProgramacionRecurrenteService**: Usa `bloques_horarios_nuevos`
3. **Base de datos**: No tenía esta columna (solo tenía `hora_entrada_nueva` y `hora_salida_nueva`)

### Solución Implementada:

1. **Migración creada**: `20251127152239-add-bloques-horarios-nuevos-to-novedades.js`
   - Agrega la columna `bloques_horarios_nuevos` (tipo JSON, nullable)
   - Incluye verificación para evitar errores si la columna ya existe

2. **Migración ejecutada**: La columna se agregó a la tabla `novedades_programacion`

3. **Verificación**: La columna existe y es de tipo JSON

### Estado Actual de la Base de Datos:

La tabla `novedades_programacion` ahora tiene:
- `hora_entrada_nueva` (TIME) - usado por NovedadService
- `hora_salida_nueva` (TIME) - usado por NovedadService
- `bloques_horarios_nuevos` (JSON) - usado por ProgramacionRecurrenteService

### Nota Importante:

La base de datos tiene ambas estructuras:
- `hora_entrada_nueva` / `hora_salida_nueva`: Para cambios de horario simples (un solo rango)
- `bloques_horarios_nuevos`: Para cambios de horario con múltiples bloques

El código actual usa `bloques_horarios_nuevos` en `ProgramacionRecurrenteService.getEffectiveScheduleForDate()`, por lo que el error debería estar resuelto.

### Estado:

✅ **Problema resuelto**. El backend debería funcionar correctamente al crear citas. El error "Unknown column 'bloques_horarios_nuevos' in 'field list'" no debería aparecer más.

