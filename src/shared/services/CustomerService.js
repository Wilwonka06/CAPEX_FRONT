// DEPRECATED: CustomerService ha sido reemplazado por la integración directa con el backend
// Los usuarios/clientes ahora se manejan a través del modelo Usuario en la base de datos
// y el AuthContext para la autenticación.

console.warn(`
⚠️  CustomerService DEPRECATED

Este servicio ha sido marcado como obsoleto. Las funcionalidades han sido migradas:

- Gestión de usuarios → API de usuarios (/api/usuarios)
- Autenticación → AuthContext (useAuth)
- Datos de usuario → Modelo Usuario en base de datos

Por favor, actualiza tu código para usar las nuevas APIs.
`);

const CustomerService = {
  getAll() {
    throw new Error('CustomerService está deprecated. Usar API de usuarios.');
  },
  findByDocument() {
    throw new Error('CustomerService está deprecated. Usar AuthContext.');
  },
  add() {
    throw new Error('CustomerService está deprecated. Usar API de usuarios.');
  },
  update() {
    throw new Error('CustomerService está deprecated. Usar API de usuarios.');
  }
};

export default CustomerService;