#!/bin/bash

# Script para probar los endpoints de la API de empleados
# Uso: ./testApi.sh

API_BASE="https://capex-back.onrender.com/api/empleados"

echo "🧪 Probando API de Empleados"
echo "============================="

# Función para hacer requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3

    echo ""
    echo "📤 $method $endpoint"
    if [ -n "$data" ]; then
        echo "📋 Datos: $data"
        curl -s -X $method \
             -H "Content-Type: application/json" \
             -d "$data" \
             "$API_BASE$endpoint" | jq '.'
    else
        curl -s -X $method "$API_BASE$endpoint" | jq '.'
    fi
}

echo ""
echo "1️⃣ Obtener todos los empleados:"
make_request "GET" ""

echo ""
echo "2️⃣ Crear empleado de prueba:"
EMPLOYEE_DATA='{
    "nombre": "Test",
    "apellido": "User",
    "tipo_documento": "CC",
    "documento": "99999999",
    "correo": "test.user@example.com",
    "estado": "Activo",
    "rol": "Empleado"
}'
make_request "POST" "" "$EMPLOYEE_DATA"

echo ""
echo "3️⃣ Obtener empleados nuevamente (debería incluir el nuevo):"
make_request "GET" ""

echo ""
echo "4️⃣ Cambiar estado del empleado (si existe):"
# Asumiendo que el empleado creado tiene ID 1, cambiar a Inactivo
make_request "PATCH" "/1/status" '{"estado": "Inactivo"}'

echo ""
echo "5️⃣ Obtener empleado específico:"
make_request "GET" "/1"

echo ""
echo "6️⃣ Actualizar empleado:"
UPDATE_DATA='{
    "nombre": "Test",
    "apellido": "User Updated",
    "tipo_documento": "CC",
    "documento": "99999999",
    "correo": "test.user@example.com",
    "estado": "Activo",
    "rol": "Empleado"
}'
make_request "PUT" "/1" "$UPDATE_DATA"

echo ""
echo "🎉 Pruebas completadas!"
echo ""
echo "💡 Para poblar más datos, ejecuta el archivo testApi.html en un navegador"
echo "   o usa el script seedEmployees.js con Node.js"