# Prompt para IA del Backend - Campo 'motivo' Requerido en Citas

## Problema Reportado

El frontend está recibiendo un error al intentar crear una cita. El backend devuelve el siguiente error:

```
Error al crear cita: Field 'motivo' doesn't have a default value
```

## Contexto del Error

Este es un error de base de datos que indica que el backend está intentando insertar un registro en la tabla de citas sin proporcionar un valor para el campo `motivo`, y ese campo no tiene un valor por defecto ni permite NULL.

## Análisis del Error

**Tipo de error**: Error de SQL/Base de Datos
**Código de error**: `Field 'motivo' doesn't have a default value`
**Causa probable**: El campo `motivo` en la tabla de citas es requerido (NOT NULL) y no tiene un valor por defecto, pero el frontend puede no enviar este campo si el usuario no ingresa notas.

## Contexto del Frontend

El frontend está enviando los siguientes datos al endpoint `POST /api/citas`:

### Estructura de datos enviada:
```json
{
  "cita": {
    "id_cliente": <número>,
    "fecha_servicio": "YYYY-MM-DD",
    "hora_entrada": "HH:MM:SS",
    "estado": "Agendada",
    "motivo": "<string> o '' (vacío)"
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
    "estado": "Agendada",
    "motivo": ""
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
- El frontend ahora siempre envía el campo `motivo`, incluso si está vacío (string vacío `""`)
- Si el usuario no ingresa notas, el campo `motivo` se envía como string vacío
- El campo `motivo` es opcional desde la perspectiva del usuario, pero parece ser requerido en la base de datos

## Preguntas para el Backend

1. **¿El campo `motivo` debe ser requerido?**
   - ¿Es necesario que todas las citas tengan un motivo?
   - ¿O el motivo es opcional y solo se usa para notas/observaciones?

2. **¿Cuál es la estructura actual del campo `motivo` en la base de datos?**
   - ¿El campo es `NOT NULL` sin valor por defecto?
   - ¿El campo permite `NULL`?
   - ¿El campo tiene un valor por defecto (por ejemplo, `''` o `'Sin motivo'`)?

3. **¿Cómo se está procesando el campo `motivo` en el backend?**
   - ¿El controlador está recibiendo el campo correctamente?
   - ¿Se está validando o transformando antes de insertar?
   - ¿Se está omitiendo si viene vacío?

4. **¿Cuál es el comportamiento esperado?**
   - **Opción A**: El campo `motivo` debe ser opcional (permitir NULL o string vacío)
   - **Opción B**: El campo `motivo` debe tener un valor por defecto (por ejemplo, `''` o `'Sin motivo'`)
   - **Opción C**: El campo `motivo` debe ser requerido y el frontend debe validar que siempre se envíe

## Solución Esperada

Por favor, revisa el endpoint de creación de citas (`POST /api/citas`) y:

1. **Verifica la estructura de la base de datos**:
   - Revisa la definición del campo `motivo` en la tabla de citas
   - Determina si debe ser requerido o opcional

2. **Si el campo debe ser opcional**:
   - Modifica la migración para permitir `NULL` en el campo `motivo`
   - O agrega un valor por defecto (por ejemplo, `DEFAULT ''`)
   - Asegúrate de que el código del backend maneje correctamente valores NULL o strings vacíos

3. **Si el campo debe ser requerido**:
   - Asegúrate de que el backend siempre proporcione un valor por defecto si el frontend envía string vacío
   - O valida en el backend que el campo siempre tenga un valor antes de insertar

4. **Manejo de strings vacíos**:
   - Si el frontend envía `motivo: ""` (string vacío), el backend debería:
     - Convertirlo a `NULL` si el campo permite NULL
     - O usar un valor por defecto (por ejemplo, `'Sin motivo'` o `''`)
     - O mantener el string vacío si la base de datos lo acepta

5. **Validación en el backend**:
   - Si el campo es opcional, asegúrate de que el código no falle cuando viene vacío o NULL
   - Si el campo es requerido, asegúrate de que siempre se proporcione un valor (incluso si es un string vacío o un valor por defecto)

## Información Adicional

- El frontend ahora siempre envía el campo `motivo`, incluso si está vacío
- El formato es un string que puede estar vacío (`""`)
- El campo se usa para notas/observaciones opcionales del usuario
- Si el usuario no ingresa notas, el campo se envía como string vacío

## Nota Importante

Este prompt es solo para el backend. El frontend ya está enviando el campo `motivo` (incluso si está vacío), pero el backend necesita manejar correctamente este caso para evitar errores de base de datos.

---

## ✅ SOLUCIÓN IMPLEMENTADA (Actualización)

**Fecha de resolución**: 2025-11-27

El backend ha implementado la solución para este problema. Los cambios incluyen:

### Problema Identificado:

1. **Campo `motivo` en la base de datos**: Era `NOT NULL` sin valor por defecto
2. **Frontend**: Podía enviar `motivo: ""` (string vacío)
3. **Modelo**: Permitía NULL pero la base de datos no

### Solución Implementada:

1. **Migración creada y ejecutada**: `20251127152700-alter-citas-motivo-allow-null.js`
   - Modifica el campo `motivo` para permitir NULL
   - La columna ahora es `varchar(100) NULL`

2. **Actualización del servicio (AppointmentService.js)**:
   - **Método `createAppointment`**: Normaliza el motivo antes de crear
     - Convierte strings vacíos a `null`
     - Trimea el string si tiene contenido
   - **Método `updateAppointment`**: Normaliza el motivo antes de actualizar
     - Maneja correctamente cuando `motivo` no se envía (`undefined`)
     - Convierte strings vacíos a `null`

3. **Actualización del modelo (Appointment.js)**:
   - Validación actualizada para permitir:
     - `null`
     - `undefined`
     - String vacío `""`
     - Strings con solo espacios (se normalizan a `null`)
   - Si tiene valor, debe tener máximo 100 caracteres

### Comportamiento Actual:

- **Si el frontend envía `motivo: ""`** → se convierte a `null` en la base de datos
- **Si el frontend envía `motivo: " "`** → se convierte a `null` (después de trim)
- **Si el frontend envía `motivo: "Corte de cabello"`** → se guarda como `"Corte de cabello"`
- **Si el frontend no envía `motivo`** → se guarda como `null`
- **Si el frontend envía `motivo: null`** → se guarda como `null`

### Verificación:

La columna `motivo` en la tabla `citas` ahora:
- **Tipo**: `varchar(100)`
- **Null**: `YES` (permite NULL)
- **Default**: `null`

### Estado:

✅ **Problema resuelto**. El error "Field 'motivo' doesn't have a default value" debería estar resuelto. El backend ahora maneja correctamente strings vacíos y valores NULL para el campo `motivo`.

