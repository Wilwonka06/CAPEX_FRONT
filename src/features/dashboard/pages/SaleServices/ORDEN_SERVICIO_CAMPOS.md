# Tabla de Campos para Crear Orden de Servicio

## Formato Correcto

| Campo | C.E | ID | Tipo de C.E | Representante |
|-------|-----|----|-------------|---------------|
| Nombre | Alfanumérico de long ≥ 3 | CEV1 | Válida | Administrador |

## Campos del Formulario de Crear Orden de Servicio

| Campo | C.E | ID | Tipo de C.E | Representante |
|-------|-----|----|-------------|---------------|
| Tipo de Documento | Select (RC, TI, CC, TE, CE, NIT, PP, PEP, DIE, NUIP, FOREIGN_NIT) | CED1 | Válida | Administrador |
| Número de Documento | Alfanumérico según tipo | CED2 | Válida | Administrador |
| Nombre Completo | Alfanumérico de long ≥ 2 | CEN1 | Válida | Administrador |
| Teléfono | Numérico de 7-15 dígitos | TEL1 | Válida | Administrador |
| Correo Electrónico | Email válido | EMA1 | Válida | Administrador |
| Estado | Select (En ejecución, Pagado) | EST1 | Válida | Administrador |
| Servicios | Lista de servicios (al menos 1) | SER1 | Válida | Administrador |
| Productos | Lista de productos (opcional) | PRO1 | Válida | Administrador |

## Detalles de Validación por Campo

### Tipo de Documento
- **Campo**: Tipo de Documento
- **C.E**: Select con opciones: RC, TI, CC, TE, CE, NIT, PP, PEP, DIE, NUIP, FOREIGN_NIT
- **ID**: CED1
- **Tipo de C.E**: Válida
- **Representante**: Administrador

### Número de Documento
- **Campo**: Número de Documento
- **C.E**: Alfanumérico con validación según tipo de documento seleccionado
- **ID**: CED2
- **Tipo de C.E**: Válida
- **Representante**: Administrador

### Nombre Completo
- **Campo**: Nombre Completo
- **C.E**: Alfanumérico con longitud mínima de 2 caracteres
- **ID**: CEN1
- **Tipo de C.E**: Válida
- **Representante**: Administrador

### Teléfono
- **Campo**: Teléfono
- **C.E**: Numérico con longitud entre 7 y 15 dígitos
- **ID**: TEL1
- **Tipo de C.E**: Válida
- **Representante**: Administrador

### Correo Electrónico
- **Campo**: Correo Electrónico
- **C.E**: Formato de email válido (ejemplo@dominio.com)
- **ID**: EMA1
- **Tipo de C.E**: Válida
- **Representante**: Administrador

### Estado
- **Campo**: Estado
- **C.E**: Select con opciones: En ejecución, Pagado
- **ID**: EST1
- **Tipo de C.E**: Válida
- **Representante**: Administrador

### Servicios
- **Campo**: Servicios
- **C.E**: Lista de servicios con al menos un servicio seleccionado
- **ID**: SER1
- **Tipo de C.E**: Válida
- **Representante**: Administrador

### Productos
- **Campo**: Productos
- **C.E**: Lista de productos (campo opcional)
- **ID**: PRO1
- **Tipo de C.E**: Válida
- **Representante**: Administrador

## Validaciones Específicas por Tipo de Documento

### Documento RC (Registro Civil)
- **Campo**: Número de Documento
- **C.E**: Solo números, 6-10 dígitos
- **ID**: CED2-RC
- **Tipo de C.E**: Válida
- **Representante**: Administrador

### Documento TI (Tarjeta de Identidad)
- **Campo**: Número de Documento
- **C.E**: Solo números, 6-10 dígitos
- **ID**: CED2-TI
- **Tipo de C.E**: Válida
- **Representante**: Administrador

### Documento CC (Cédula de Ciudadanía)
- **Campo**: Número de Documento
- **C.E**: Solo números, 6-10 dígitos
- **ID**: CED2-CC
- **Tipo de C.E**: Válida
- **Representante**: Administrador

### Documento NIT (Número de Identificación Tributaria)
- **Campo**: Número de Documento
- **C.E**: Solo números, 9-14 dígitos (con dígito de verificación)
- **ID**: CED2-NIT
- **Tipo de C.E**: Válida
- **Representante**: Administrador

### Documento PP (Pasaporte)
- **Campo**: Número de Documento
- **C.E**: Alfanumérico, 9-12 caracteres
- **ID**: CED2-PP
- **Tipo de C.E**: Válida
- **Representante**: Administrador