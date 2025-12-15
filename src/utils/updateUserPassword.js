/**
 * Utilidad para actualizar la contraseña de un usuario específico
 * 
 * Uso en la consola del navegador:
 * 
 * import { updateUserPasswordUtil } from './src/utils/updateUserPassword.js';
 * updateUserPasswordUtil();
 * 
 * O ejecutar directamente en la consola cuando la app esté corriendo:
 */

import { usersService } from '../features/dashboard/pages/users/API/usersService';

export async function updateUserPasswordUtil() {
  try {
    const documento = '1033488966';
    const correo = 'ronalderazovalencia14@gmail.com';
    // Contraseña temporal que funciona con el backend actual (sin #)
    // Una vez desplegado el backend con soporte para #, cambiar a: 'Ronald153426789#'
    const nuevaContraseña = 'Ronald153426789!';
    
    console.log('🔍 Buscando usuario...');
    console.log('Datos de búsqueda:', { documento, correo });
    
    // Buscar usuario por documento
    let usuario = null;
    let response = null;
    
    try {
      response = await usersService.getAll({ documento });
      
      if (response.success && response.data) {
        const usuarios = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data || []);
        
        usuario = usuarios.find(u => 
          u.documento?.toString() === documento || 
          u.documento?.toString().trim() === documento.trim()
        );
      }
    } catch (error) {
      console.warn('Error buscando por documento:', error);
    }
    
    // Si no se encontró por documento, buscar por correo
    if (!usuario) {
      console.log('🔍 Buscando por correo...');
      try {
        response = await usersService.getAll({ correo });
        if (response.success && response.data) {
          const usuarios = Array.isArray(response.data) 
            ? response.data 
            : (response.data.data || []);
          
          usuario = usuarios.find(u => 
            u.correo?.toLowerCase() === correo.toLowerCase() ||
            u.correo?.toLowerCase().trim() === correo.toLowerCase().trim()
          );
        }
      } catch (error) {
        console.warn('Error buscando por correo:', error);
      }
    }
    
    // Si aún no se encuentra, buscar en todos los usuarios
    if (!usuario) {
      console.log('🔍 Buscando en todos los usuarios...');
      try {
        response = await usersService.getAll();
        if (response.success && response.data) {
          const usuarios = Array.isArray(response.data) 
            ? response.data 
            : (response.data.data || []);
          
          usuario = usuarios.find(u => 
            (u.documento?.toString() === documento) ||
            (u.correo?.toLowerCase() === correo.toLowerCase())
          );
        }
      } catch (error) {
        console.error('Error buscando en todos los usuarios:', error);
      }
    }
    
    if (!usuario) {
      console.error('❌ Usuario no encontrado');
      console.log('Por favor verifica que el usuario exista con:');
      console.log('- Documento:', documento);
      console.log('- Correo:', correo);
      return { success: false, message: 'Usuario no encontrado' };
    }
    
    console.log('✅ Usuario encontrado:', {
      id: usuario.id_usuario || usuario.id,
      nombre: usuario.nombre,
      documento: usuario.documento,
      correo: usuario.correo
    });
    
    const userId = usuario.id_usuario || usuario.id;
    
    if (!userId) {
      console.error('❌ No se pudo obtener el ID del usuario');
      return { success: false, message: 'No se pudo obtener el ID del usuario' };
    }
    
    console.log('🔐 Cambiando contraseña...');
    
    // Cambiar contraseña
    const result = await usersService.changePassword(userId, nuevaContraseña);
    
    console.log('✅ Contraseña actualizada exitosamente!');
    console.log('📋 Resumen:', {
      usuario: usuario.nombre,
      documento: usuario.documento,
      correo: usuario.correo,
      nuevaContraseña: nuevaContraseña
    });
    
    return { 
      success: true, 
      message: 'Contraseña actualizada exitosamente',
      usuario: {
        nombre: usuario.nombre,
        documento: usuario.documento,
        correo: usuario.correo
      }
    };
    
  } catch (error) {
    console.error('❌ Error al actualizar contraseña:', error);
    console.error('Detalles:', error.response?.data || error.message);
    return { 
      success: false, 
      message: error.message || 'Error al actualizar contraseña',
      error: error.response?.data || error.message
    };
  }
}

// Función para ejecutar desde la consola del navegador
// Hacer disponible globalmente para facilitar el uso
if (typeof window !== 'undefined') {
  window.updateUserPasswordUtil = updateUserPasswordUtil;
}

