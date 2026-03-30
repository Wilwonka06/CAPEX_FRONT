// Usar: /api/usuarios para gestión, AuthContext para autenticación.

const CustomerService = {
  getAll()         { throw new Error('CustomerService deprecated. Usar API de usuarios.'); },
  findByDocument() { throw new Error('CustomerService deprecated. Usar AuthContext.'); },
  add()            { throw new Error('CustomerService deprecated. Usar API de usuarios.'); },
  update()         { throw new Error('CustomerService deprecated. Usar API de usuarios.'); },
};

export default CustomerService;
