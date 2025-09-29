import apiRequest from '../../../../../shared/config/apiConfig';

/**
 * Servicio API para gestión de productos
 * Endpoints base: /api/productos
 */

const PRODUCTS_ENDPOINT = '/productos';

export const productsService = {
  /**
   * Obtener todos los productos con paginación y filtros
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Número de página (opcional)
   * @param {number} params.limit - Límite de resultados por página (opcional)
   * @param {string} params.search - Término de búsqueda (opcional)
   * @param {number} params.categoryId - ID de categoría para filtrar (opcional)
   * @param {string} params.status - Estado del producto (opcional)
   * @returns {Promise<Object>} Lista de productos con metadatos de paginación
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros de consulta si existen
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.categoryId) queryParams.append('categoryId', params.categoryId);
      if (params.status) queryParams.append('status', params.status);

      const url = queryParams.toString() 
        ? `${PRODUCTS_ENDPOINT}?${queryParams.toString()}`
        : PRODUCTS_ENDPOINT;

      const response = await apiRequest.get(url);
      
      // Mapear la respuesta para que sea consistente con el frontend
      if (response.success && response.data) {
        const mappedProducts = response.data.map(product => ({
          id_producto: product.id_producto,
          id: product.id_producto, // Para compatibilidad
          nombre: product.nombre,
          stock: parseInt(product.stock) || 0,
          precio_venta: parseFloat(product.precio_venta) || 0,
          precio: parseFloat(product.precio_venta) || 0, // Para compatibilidad
          fecha_registro: product.fecha_registro,
          fechaRegistro: product.fecha_registro, // Para compatibilidad
          url_foto: product.url_foto,
          foto: product.url_foto, // Para compatibilidad
          categoria: product.categoria,
          caracteristicas: [] // Temporarily empty until associations are fixed
        }));

        return {
          ...response,
          data: mappedProducts
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Obtener un producto por ID
   * @param {number|string} id - ID del producto
   * @returns {Promise<Object>} Datos del producto
   */
  getById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del producto es requerido');
      }

      const response = await apiRequest.get(`${PRODUCTS_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo producto
   * @param {Object} productData - Datos del producto
   * @param {string} productData.nombre - Nombre del producto
   * @param {string} productData.descripcion - Descripción del producto
   * @param {number} productData.precio - Precio del producto
   * @param {number} productData.stock - Stock disponible
   * @param {number} productData.categoryId - ID de la categoría
   * @param {string} productData.codigo - Código del producto (opcional)
   * @param {string} productData.imagen - URL de la imagen (opcional)
   * @returns {Promise<Object>} Producto creado
   */
  create: async (productData) => {
    try {
      // Validaciones básicas
      if (!productData.nombre) {
        throw new Error('El nombre del producto es requerido');
      }
      if (!productData.precio || productData.precio <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }
      if (!productData.categoryId) {
        throw new Error('La categoría es requerida');
      }

      // Mapear campos del front-end al back-end
      const mappedData = {
        nombre: productData.nombre,
        id_categoria_producto: parseInt(productData.categoryId),
        precio_venta: parseFloat(productData.precio),
        stock: parseInt(productData.stock || productData.cantidad || 0),
        costo: parseFloat(productData.costo || 0),
        iva: parseFloat(productData.iva || 0),
        caracteristicas: (productData.caracteristicas || productData.especificaciones || []).map(caracteristica => ({
          id_caracteristica: caracteristica.id_caracteristica,
          nombre: caracteristica.nombre,
          valor: caracteristica.valor
        }))
      };

      // Solo incluir url_foto si es una URL válida (no blob)
      const imagen = productData.imagen || productData.url_foto;
      if (imagen && !imagen.startsWith('blob:')) {
        mappedData.url_foto = imagen;
      }

      console.log('API Service: Sending data to backend:', mappedData);
      const response = await apiRequest.post(PRODUCTS_ENDPOINT, mappedData);
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
    * Actualizar un producto existente
    * @param {number|string} id - ID del producto
    * @param {Object} productData - Datos actualizados del producto
    * @returns {Promise<Object>} Producto actualizado
    */
   update: async (id, productData) => {
     try {
       if (!id) {
         throw new Error('ID del producto es requerido');
       }

       // Validaciones básicas
       if (productData.precio !== undefined && productData.precio <= 0) {
         throw new Error('El precio debe ser mayor a 0');
       }

       // Mapear campos del front-end al back-end
       const mappedData = { ...productData };
       if (productData.categoryId) {
         mappedData.id_categoria_producto = productData.categoryId;
         delete mappedData.categoryId;
       }
       if (productData.especificaciones) {
         mappedData.caracteristicas = productData.especificaciones.map(e => ({
           id_caracteristica: e.id_caracteristica,
           nombre: e.concepto === "otro" ? e.otroConcepto : e.concepto,
           valor: e.valor
         }));
         delete mappedData.especificaciones;
       }

       const response = await apiRequest.put(`${PRODUCTS_ENDPOINT}/${id}`, mappedData);
       return response;
     } catch (error) {
       console.error(`Error updating product ${id}:`, error);
       throw error;
     }
   },

  /**
   * Actualización parcial de un producto
   * @param {number|string} id - ID del producto
   * @param {Object} partialData - Datos parciales a actualizar
   * @returns {Promise<Object>} Producto actualizado
   */
  patch: async (id, partialData) => {
    try {
      if (!id) {
        throw new Error('ID del producto es requerido');
      }

      const response = await apiRequest.patch(`${PRODUCTS_ENDPOINT}/${id}`, partialData);
      return response;
    } catch (error) {
      console.error(`Error patching product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un producto
   * @param {number|string} id - ID del producto
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del producto es requerido');
      }

      const response = await apiRequest.delete(`${PRODUCTS_ENDPOINT}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cambiar estado de un producto (activar/desactivar)
   * @param {number|string} id - ID del producto
   * @param {string} status - Nuevo estado ('activo' | 'inactivo')
   * @returns {Promise<Object>} Producto con estado actualizado
   */
  changeStatus: async (id, status) => {
    try {
      if (!id) {
        throw new Error('ID del producto es requerido');
      }
      if (!['activo', 'inactivo'].includes(status)) {
        throw new Error('Estado debe ser "activo" o "inactivo"');
      }

      const response = await apiRequest.patch(`${PRODUCTS_ENDPOINT}/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error(`Error changing product status ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar stock de un producto
   * @param {number|string} id - ID del producto
   * @param {number} stock - Nuevo stock
   * @param {string} operation - Tipo de operación ('set' | 'add' | 'subtract')
   * @returns {Promise<Object>} Producto con stock actualizado
   */
  updateStock: async (id, stock, operation = 'set') => {
    try {
      if (!id) {
        throw new Error('ID del producto es requerido');
      }
      if (stock < 0) {
        throw new Error('El stock no puede ser negativo');
      }
      if (!['set', 'add', 'subtract'].includes(operation)) {
        throw new Error('Operación debe ser "set", "add" o "subtract"');
      }

      const response = await apiRequest.patch(`${PRODUCTS_ENDPOINT}/${id}/stock`, { 
        stock, 
        operation 
      });
      return response;
    } catch (error) {
      console.error(`Error updating product stock ${id}:`, error);
      throw error;
    }
  },

  /**
   * Buscar productos por término
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} filters - Filtros adicionales (opcional)
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  search: async (searchTerm, filters = {}) => {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        throw new Error('Término de búsqueda es requerido');
      }

      const params = {
        search: searchTerm.trim(),
        ...filters
      };

      return await productsService.getAll(params);
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  /**
   * Obtener productos por categoría
   * @param {number|string} categoryId - ID de la categoría
   * @param {Object} params - Parámetros adicionales (opcional)
   * @returns {Promise<Object>} Productos de la categoría
   */
  getByCategory: async (categoryId, params = {}) => {
    try {
      if (!categoryId) {
        throw new Error('ID de categoría es requerido');
      }

      const queryParams = {
        categoryId,
        ...params
      };

      return await productsService.getAll(queryParams);
    } catch (error) {
      console.error(`Error fetching products by category ${categoryId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener productos con stock bajo
   * @param {number} threshold - Umbral de stock bajo (opcional, default: 10)
   * @returns {Promise<Object>} Productos con stock bajo
   */
  getLowStock: async (threshold = 10) => {
    try {
      const response = await apiRequest.get(`${PRODUCTS_ENDPOINT}/low-stock?threshold=${threshold}`);
      return response;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  },

  /**
   * Subir imagen de producto
   * @param {number|string} id - ID del producto
   * @param {File} imageFile - Archivo de imagen
   * @param {Function} onUploadProgress - Callback de progreso (opcional)
   * @returns {Promise<Object>} Producto con imagen actualizada
   */
  uploadImage: async (id, imageFile, onUploadProgress = null) => {
    try {
      if (!id) {
        throw new Error('ID del producto es requerido');
      }
      if (!imageFile) {
        throw new Error('Archivo de imagen es requerido');
      }

      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiRequest.post(
        `${PRODUCTS_ENDPOINT}/${id}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: onUploadProgress ? (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress(percentCompleted);
          } : undefined,
        }
      );

      return response;
    } catch (error) {
      console.error(`Error uploading image for product ${id}:`, error);
      throw error;
    }
  },
};

export default productsService;