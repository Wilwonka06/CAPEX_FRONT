# Prompt para IA del Backend - Programaciones Recurrentes y Fecha de Inicio

## Problema Reportado

El frontend está recibiendo un error al intentar crear una cita para el día actual cuando el empleado tiene una programación recurrente que inicia el día siguiente. El backend devuelve:

```
Error al crear cita: Empleado [nombre] no tiene programación disponible para la fecha [fecha_actual]
```

## Contexto del Problema

### Escenario:
1. Se crea una **programación recurrente** para un empleado con:
   - `fecha_inicio`: "2025-11-28" (mañana)
   - `dias_semana`: [0, 1, 2, 3, 4, 5, 6] (todos los días)
   - `bloques_horarios`: [{"inicio": "06:00", "fin": "22:00"}]

2. El usuario intenta crear una cita para:
   - `fecha_servicio`: "2025-11-27" (hoy)
   - `id_empleado`: 25

3. El backend rechaza la cita porque no encuentra programación disponible para esa fecha.

### Análisis del Problema

**Problema identificado**: Las programaciones recurrentes tienen una `fecha_inicio` que es el día siguiente (mañana), pero el usuario necesita crear citas para el día actual (hoy).

**Pregunta clave**: ¿Cómo maneja el backend las programaciones recurrentes cuando se intenta crear una cita para una fecha anterior a la `fecha_inicio` de la programación recurrente?

## Preguntas para el Backend

1. **¿Cómo se generan las programaciones específicas desde las recurrentes?**
   - ¿El backend genera automáticamente programaciones específicas para cada día basándose en las recurrentes?
   - ¿Se generan solo para fechas futuras desde `fecha_inicio`?
   - ¿Se generan también para el día actual si la programación recurrente incluye ese día de la semana?

2. **¿Qué sucede cuando `fecha_inicio` es mañana pero el usuario quiere crear una cita para hoy?**
   - ¿El backend debería permitir crear citas para hoy si la programación recurrente incluye el día de la semana de hoy?
   - ¿O el backend requiere que `fecha_inicio` sea hoy o anterior para que la programación sea válida para hoy?

3. **¿Cómo se valida la disponibilidad del empleado?**
   - ¿El backend busca programaciones específicas (tabla de programaciones) o también consulta programaciones recurrentes?
   - ¿Si hay una programación recurrente que incluye el día de la semana de la fecha solicitada, se considera disponible aunque `fecha_inicio` sea futura?

4. **¿Cuál es el comportamiento esperado?**
   - **Opción A**: Si una programación recurrente incluye el día de la semana de la fecha solicitada, se considera disponible independientemente de `fecha_inicio` (siempre que no haya `fecha_fin` que la limite).
   - **Opción B**: Solo se consideran disponibles las fechas desde `fecha_inicio` en adelante.
   - **Opción C**: Se generan automáticamente programaciones específicas para todas las fechas futuras desde `fecha_inicio`.

## Ejemplo de Datos

### Programación Recurrente Creada:
```json
{
  "id_usuario": 25,
  "hora_entrada": "06:00",
  "hora_salida": "22:00",
  "bloques_horarios": [
    {
      "inicio": "06:00",
      "fin": "22:00"
    }
  ],
  "dias_semana": [0, 1, 2, 3, 4, 5, 6],
  "fecha_inicio": "2025-11-28",  // Mañana
  "fecha_fin": "",
  "estado": "Activa"
}
```

### Intento de Crear Cita:
```json
{
  "cita": {
    "id_cliente": 18,
    "fecha_servicio": "2025-11-27",  // Hoy
    "hora_entrada": "11:00:00",
    "estado": "Agendada"
  },
  "servicios": [
    {
      "id_servicio": 2,
      "id_empleado": 25,
      "hora_inicio": "11:00:00",
      "cantidad": 1
    }
  ]
}
```

### Error Recibido:
```json
{
  "success": false,
  "message": "Conflicto de disponibilidad",
  "error": "Error al crear cita: Empleado Lucy no tiene programación disponible para la fecha 2025-11-27"
}
```

## Solución Esperada

Por favor, revisa la lógica de validación de disponibilidad del empleado en el endpoint de creación de citas (`POST /api/citas`) y:

1. **Clarifica el comportamiento esperado**:
   - ¿Las programaciones recurrentes deben considerarse disponibles para fechas anteriores a `fecha_inicio` si incluyen el día de la semana?
   - ¿O solo deben considerarse disponibles desde `fecha_inicio` en adelante?

2. **Si el comportamiento esperado es Opción A** (considerar disponible si incluye el día de la semana):
   - Modifica la validación para que también consulte programaciones recurrentes
   - Verifica que el día de la semana de la fecha solicitada esté en `dias_semana`
   - Verifica que la hora solicitada esté dentro de los `bloques_horarios`
   - Ignora `fecha_inicio` si la programación es recurrente y no tiene `fecha_fin`

3. **Si el comportamiento esperado es Opción B** (solo desde `fecha_inicio`):
   - Documenta claramente este comportamiento
   - Considera permitir que `fecha_inicio` pueda ser hoy o anterior para programaciones que deben estar disponibles inmediatamente

4. **Si el comportamiento esperado es Opción C** (generar programaciones específicas):
   - Verifica que se estén generando correctamente las programaciones específicas desde `fecha_inicio`
   - Asegúrate de que se generen también para el día actual si es necesario

## Información Adicional

- El frontend crea programaciones recurrentes con `fecha_inicio` = mañana (día siguiente) para cumplir con validaciones que requieren fechas futuras
- El usuario puede necesitar crear citas para el día actual
- Las programaciones recurrentes incluyen todos los días de la semana: [0, 1, 2, 3, 4, 5, 6]
- El formato de hora es `HH:MM` (sin segundos) en las programaciones recurrentes

## Nota Importante

Este prompt es solo para el backend. El frontend no necesita cambios a menos que el backend indique que hay un problema con el formato de datos enviados o que la estructura esperada es diferente.

