import apiRequest from '../config/apiConfig';

/**
 * Servicio para manejar subidas de imágenes a Cloudinary
 */
export const uploadService = {
  /**
   * Subir una imagen individual a Cloudinary
   * @param {string} base64Image - Imagen en formato base64
   * @param {string} folder - Carpeta en Cloudinary (opcional, por defecto 'productos')
   * @returns {Promise<Object>} Resultado de la subida
   */
  async uploadImage(base64Image, folder = 'productos') {
    try {
      const response = await apiRequest.post('/upload/image', {
        image: base64Image,
        folder: folder
      });

      if (response.success) {
        return {
          success: true,
          url: response.data.url,
          publicId: response.data.publicId,
          ...response.data
        };
      } else {
        throw new Error(response.message || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  /**
   * Subir múltiples imágenes a Cloudinary
   * @param {Array<string>} base64Images - Array de imágenes en base64
   * @param {string} folder - Carpeta en Cloudinary (opcional, por defecto 'productos')
   * @returns {Promise<Array>} Array con los resultados de las subidas
   */
  async uploadMultipleImages(base64Images, folder = 'productos') {
    try {
      const response = await apiRequest.post('/upload/images', {
        images: base64Images,
        folder: folder
      });

      if (response.success) {
        return response.data.map(result => ({
          success: true,
          url: result.url,
          publicId: result.publicId,
          ...result
        }));
      } else {
        throw new Error(response.message || 'Error al subir imágenes');
      }
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw error;
    }
  },

  /**
   * Eliminar una imagen de Cloudinary
   * @param {string} publicId - ID público de la imagen
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async deleteImage(publicId) {
    try {
      const response = await apiRequest.delete('/upload/image', {
        data: { publicId }
      });

      if (response.success) {
        return {
          success: true,
          ...response.data
        };
      } else {
        throw new Error(response.message || 'Error al eliminar imagen');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },

  /**
   * Reemplazar una imagen existente
   * @param {string} oldUrl - URL de la imagen antigua
   * @param {string} newBase64Image - Nueva imagen en base64
   * @param {string} folder - Carpeta en Cloudinary (opcional, por defecto 'productos')
   * @returns {Promise<Object>} Resultado del reemplazo
   */
  async replaceImage(oldUrl, newBase64Image, folder = 'productos') {
    try {
      const response = await apiRequest.put('/upload/image', {
        oldUrl: oldUrl,
        newImage: newBase64Image,
        folder: folder
      });

      if (response.success) {
        return {
          success: true,
          url: response.data.url,
          publicId: response.data.publicId,
          ...response.data
        };
      } else {
        throw new Error(response.message || 'Error al reemplazar imagen');
      }
    } catch (error) {
      console.error('Error replacing image:', error);
      throw error;
    }
  }
};

export default uploadService;