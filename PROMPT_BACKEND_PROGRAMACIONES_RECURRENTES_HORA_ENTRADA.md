# Prompt para IA del Backend - Error en Creación de Programaciones Recurrentes

## Problema Reportado

El frontend está recibiendo un error al intentar crear una programación recurrente. El backend devuelve el siguiente error:

```
Field 'hora_entrada' doesn't have a default value
```

## Contexto del Frontend

El frontend está enviando los siguientes datos al endpoint `POST /api/programaciones-recurrentes`:

### Estructura de datos enviada:
```json
{
  "id_usuario": <número>,
  "hora_entrada": "06:00",
  "hora_salida": "22:00",
  "bloques_horarios": [
    {
      "inicio": "06:00",
      "fin": "22:00"
    }
  ],
  "dias_semana": [0, 1, 2, 3, 4, 5, 6],
  "fecha_inicio": "YYYY-MM-DD",
  "fecha_fin": "",
  "estado": "Activa",
  "observaciones": "Programación de prueba - Todo el día todos los días"
}
```

### Ejemplo de datos que se están enviando (caso real que falla):
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
  "fecha_inicio": "2025-11-28",
  "fecha_fin": "",
  "estado": "Activa",
  "observaciones": "Programación de prueba - Todo el día todos los días"
}
```

**Nota importante**: 
- El campo `hora_entrada` está siendo enviado explícitamente con el valor `"06:00"` (formato HH:MM)
- El campo `hora_salida` está siendo enviado explícitamente con el valor `"22:00"` (formato HH:MM)
- El formato de hora es `HH:MM` (sin segundos)
- El campo `fecha_fin` puede venir como string vacío `""` o `null` para indicar que la programación es indefinida

## Error Recibido

```json
{
  "error": "Field 'hora_entrada' doesn't have a default value"
}
```

### Análisis del Error

El error indica que el backend está intentando insertar un registro en la base de datos, pero el campo `hora_entrada` no tiene un valor y no tiene un valor por defecto definido en la base de datos.

**Posibles causas**:
1. **El campo no se está recibiendo correctamente**: El backend podría no estar extrayendo el campo `hora_entrada` del body de la petición
2. **Mapeo incorrecto de campos**: El backend podría estar esperando el campo con un nombre diferente (por ejemplo, `horaEntrada` en camelCase)
3. **Validación que elimina el campo**: Alguna validación o transformación de datos podría estar eliminando el campo antes de la inserción
4. **Problema en el modelo de base de datos**: El campo `hora_entrada` podría no estar definido correctamente en el modelo o en la migración
5. **Problema en el controlador**: El controlador podría no estar pasando el campo `hora_entrada` al servicio o repositorio

## Preguntas para el Backend

1. **¿El endpoint está recibiendo el campo `hora_entrada`?**
   - ¿Puedes agregar un log en el controlador para verificar que el campo `hora_entrada` está presente en el `req.body`?
   - ¿El campo se está recibiendo con el nombre correcto?

2. **¿Cómo se está mapeando el campo `hora_entrada`?**
   - ¿El backend espera `hora_entrada` (snake_case) o `horaEntrada` (camelCase)?
   - ¿Hay alguna transformación de datos que convierta los nombres de campos?

3. **¿El modelo de base de datos tiene el campo `hora_entrada`?**
   - ¿El campo está definido en el modelo de la tabla de programaciones recurrentes?
   - ¿El campo tiene un valor por defecto en la base de datos?
   - ¿El campo es nullable o es requerido?

4. **¿Cómo se está insertando el registro?**
   - ¿El controlador está pasando todos los campos al servicio/repositorio?
   - ¿Hay alguna validación que esté eliminando el campo antes de la inserción?
   - ¿El servicio/repositorio está incluyendo el campo `hora_entrada` en la inserción?

5. **¿Cuál es la estructura esperada por el backend?**
   - ¿El backend espera que `hora_entrada` y `hora_salida` se calculen automáticamente desde `bloques_horarios`?
   - ¿O debe enviarse explícitamente como campos separados?

## Solución Esperada

Por favor, revisa el endpoint de creación de programaciones recurrentes (`POST /api/programaciones-recurrentes`) y:

1. **Verifica que el campo `hora_entrada` se está recibiendo correctamente**:
   - Agrega logs para verificar que el campo está presente en `req.body`
   - Verifica que el nombre del campo coincide (snake_case vs camelCase)

2. **Verifica que el campo se está pasando al modelo de base de datos**:
   - Asegúrate de que el controlador pasa el campo al servicio/repositorio
   - Asegúrate de que el servicio/repositorio incluye el campo en la inserción

3. **Verifica el modelo de base de datos**:
   - Confirma que el campo `hora_entrada` existe en la tabla
   - Si el campo es requerido, asegúrate de que tiene un valor por defecto o que siempre se envía un valor
   - Si el campo puede ser nullable, verifica que la configuración de la base de datos lo permite

4. **Si el campo debe calcularse automáticamente**:
   - Si `hora_entrada` debe ser la primera hora de `bloques_horarios[0].inicio`, implementa esa lógica
   - Si `hora_salida` debe ser la última hora del último bloque, implementa esa lógica
   - Documenta claramente si estos campos deben enviarse o calcularse automáticamente

5. **Proporciona mensajes de error más específicos**:
   - Si falta un campo requerido, indica claramente qué campo falta
   - Si hay un problema de formato, indica el formato esperado

## Información Adicional

- El frontend está enviando el campo `hora_entrada` explícitamente
- El formato de hora es `HH:MM` (sin segundos, por ejemplo: "06:00", "22:00")
- El campo `fecha_fin` puede venir como string vacío `""` o `null` para indicar programación indefinida
- Los `dias_semana` son números del 0 al 6 (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)

## Nota Importante

Este prompt es solo para el backend. El frontend no necesita cambios a menos que el backend indique que hay un problema con el formato de datos enviados o que la estructura esperada es diferente.

---

## ✅ SOLUCIÓN IMPLEMENTADA (Actualización)

**Fecha de resolución**: 2025-11-27

El backend ha implementado la solución para este problema. Los cambios incluyen:

### Cambios en el Backend:

1. **Modelo (ProgramacionRecurrente.js)**:
   - Agregados campos `hora_entrada` y `hora_salida` (tipo TIME, NOT NULL)
   - Hook `beforeValidate` calcula automáticamente estos campos desde `bloques_horarios` si no están definidos
   - Conversión automática de formato HH:MM a HH:MM:SS para MySQL

2. **Controlador (ProgramacionRecurrenteController.js)**:
   - Extrae `hora_entrada` y `hora_salida` del `req.body`
   - Valida formato de hora (HH:MM o HH:MM:SS)
   - Calcula automáticamente desde `bloques_horarios` si no se envían
   - Convierte formato a HH:MM:SS antes de guardar

### Comportamiento Actual:

- **Si el frontend envía `hora_entrada` y `hora_salida`**: Se usan directamente (con validación y conversión de formato)
- **Si no se envían**: Se calculan automáticamente desde `bloques_horarios`:
  - `hora_entrada` = primera hora del primer bloque (ordenado por inicio)
  - `hora_salida` = última hora del último bloque (ordenado por fin)

### Estado:

✅ **Problema resuelto**. El frontend puede enviar los campos `hora_entrada` y `hora_salida` en formato HH:MM, y el backend los procesará correctamente. Si no se envían, el backend los calculará automáticamente.

