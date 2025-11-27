# Prompt para IA del Backend - Validación de Horas en Citas

## Problema Reportado

El frontend está recibiendo un error 400 de validación al intentar crear una cita. El mensaje de error indica que "la hora debe estar después de las 14:00", pero el usuario reporta que la hora del servicio está correcta y es posterior a las 14:00.

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
    "motivo": "<opcional>"
  },
  "servicios": [
    {
      "id_servicio": <número>,
      "id_empleado": <número>,
      "hora_inicio": "HH:MM:SS",
      "cantidad": <número>,
      "observaciones": "<opcional>"
    }
  ]
}
```

### Formato de horas:
- `hora_entrada`: Formato `HH:MM:SS` (ejemplo: "14:30:00")
- `hora_inicio`: Formato `HH:MM:SS` (ejemplo: "14:30:00")

### Ejemplo de datos que se están enviando (caso real que falla):
```json
{
  "cita": {
    "id_cliente": 18,
    "fecha_servicio": "2025-11-27",
    "hora_entrada": "10:00:00",
    "estado": "En ejecución"
  },
  "servicios": [
    {
      "id_servicio": 2,
      "id_empleado": 14,
      "hora_inicio": "10:00:00",
      "cantidad": 1
    }
  ]
}
```

**Nota importante**: 
- La fecha es futura (2025-11-27), no el día actual
- La hora es 10:00:00, que es anterior a las 14:17:00 que el backend está requiriendo
- El estado es "En ejecución" (con tilde)

## Error Recibido

```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "message": "La hora debe ser posterior a 14:17:00"
    },
    {
      "message": "Estado inválido"
    }
  ]
}
```

### Análisis del Error

1. **Error de hora**: El backend está rechazando una hora de "10:00:00" para una fecha futura (2025-11-27), diciendo que debe ser posterior a "14:17:00". Esto sugiere que:
   - La validación está comparando con la hora actual del servidor en lugar de solo validar para el día actual
   - O hay un problema con la zona horaria
   - O la validación está aplicándose incorrectamente a fechas futuras

2. **Error de estado**: El backend está rechazando el estado "En ejecución" como inválido. Esto podría deberse a:
   - El backend aún no ha sido actualizado para aceptar "En ejecución" (aún espera "En proceso")
   - Problema con la codificación de caracteres (la tilde en "ejecución")
   - El backend tiene una lista diferente de estados válidos

## Preguntas para el Backend

1. **¿Qué campo específico está siendo validado?**
   - ¿Es `hora_entrada` de la cita?
   - ¿Es `hora_inicio` de algún servicio?
   - ¿Hay alguna otra validación de hora que no estemos considerando?

2. **¿Cuál es la lógica exacta de la validación de hora?**
   - ¿La validación compara con la hora actual del servidor incluso para fechas futuras?
   - **PROBLEMA DETECTADO**: Se está rechazando una hora de 10:00:00 para una fecha futura (2025-11-27), requiriendo que sea posterior a 14:17:00 (hora actual del servidor). Esto parece incorrecto.
   - ¿La validación debería aplicarse solo si la fecha es el día actual?
   - ¿Hay alguna validación relacionada con la programación del empleado que esté causando esto?

3. **¿Hay alguna diferencia entre validar para el día actual vs días futuros?**
   - El frontend permite crear citas para el día actual y días futuros
   - ¿La validación debería ser diferente según la fecha?

4. **¿El formato de hora es correcto?**
   - El frontend envía `HH:MM:SS` (ejemplo: "14:30:00")
   - ¿El backend espera este formato o algún otro?

5. **¿Hay alguna validación relacionada con la programación del empleado?**
   - ¿Se está validando que el empleado tenga programación disponible a esa hora?
   - ¿Se está validando que no haya conflictos con otras citas?
   - ¿Esta validación está aplicándose incorrectamente a fechas futuras?

6. **¿El estado "En ejecución" es válido?**
   - El frontend está enviando el estado "En ejecución" (con tilde) pero el backend lo rechaza como "Estado inválido"
   - ¿El backend aún espera "En proceso" (estado antiguo)?
   - ¿Hay un problema con la codificación de caracteres (UTF-8) que está causando que la tilde no se reconozca?
   - ¿Cuál es la lista exacta de estados válidos que el backend acepta actualmente?

## Información Adicional

- El frontend valida que la hora sea posterior a la hora actual solo si la cita es para el día actual
- El frontend permite crear citas desde las 06:00 hasta las 20:00
- El frontend calcula `hora_entrada` como la primera hora de inicio de todos los servicios

## Solución Esperada

Por favor, revisa la validación de horas en el endpoint de creación de citas y:

1. Verifica que la validación esté comparando correctamente las horas
2. Asegúrate de que el formato de hora recibido sea el esperado
3. Si la validación es para el día actual, verifica que esté usando la zona horaria correcta
4. Si hay validaciones relacionadas con programación de empleados, verifica que estén funcionando correctamente
5. Proporciona mensajes de error más específicos que indiquen qué campo y qué valor está fallando

## Nota Importante

Este prompt es solo para el backend. El frontend no necesita cambios a menos que el backend indique que hay un problema con el formato de datos enviados.

