import apiRequest from '../../../../../shared/config/apiConfig';
import { executeWithToast } from '../../../../../shared/utils/toastHelpers';

const PRODUCTS_ENDPOINT = '/productos';

export const productsService = {
  /**
   * Obtener todos los productos con paginaciÃ³n y filtros
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.categoryId) queryParams.append('categoryId', params.categoryId);
      if (params.supplierId) queryParams.append('supplierId', params.supplierId);
      if (params.stock_min) queryParams.append('stock_min', params.stock_min);
      if (params.status) queryParams.append('status', params.status);

      const url = queryParams.toString()
        ? `${PRODUCTS_ENDPOINT}?${queryParams.toString()}`
        : PRODUCTS_ENDPOINT;

      const response = await apiRequest.get(url);

      if (response.success && response.data) {
        const mappedProducts = response.data.map(product => ({
          // IDs
          id_producto: product.id_producto,
          id: product.id_producto,
          
          // InformaciÃ³n bÃ¡sica
          nombre: product.nombre,
          descripcion: product.descripcion || '',
          
          // Stock y cantidad
          stock: parseInt(product.stock) || 0,
          cantidad: parseInt(product.stock) || 0,
          
          // Precios
          precio_venta: parseFloat(product.precio_venta) || 0,
          precio: parseFloat(product.precio_venta) || 0,
          costo: parseFloat(product.costo) || 0,
          iva: parseFloat(product.iva) || 0,
          
          // Fechas
          fecha_registro: product.fecha_registro,
          fechaRegistro: product.fecha_registro,
          
          // IMÃGENES - Convertir string separado por comas en array
          url_foto: product.url_foto,
          foto: product.url_foto ? product.url_foto.split(',')[0] : null, // Primera imagen
          fotos: product.url_foto ? product.url_foto.split(',').filter(url => url) : [],
          imagen: product.url_foto ? product.url_foto.split(',')[0] : null,
          
          // CategorÃ­a - compatible con ambos formatos
          categoriaObj: product.categoria ? {
            id_categoria_producto: product.categoria.id_categoria_producto,
            nombre: product.categoria.nombre
          } : null,
          categoria: product.categoria?.nombre || 'Sin categorÃ­a',
          id_categoria_producto: product.categoria?.id_categoria_producto || null,
          
          // Tipo de producto
          tipoProducto: product.categoria?.nombre || 'General',
          
          // CaracterÃ­sticas - formato completo
          caracteristicas: (product.caracteristicas || []).map(car => ({
            id_caracteristica: car.id_caracteristica,
            nombre: car.nombre,
            valor: car.FichaTecnica?.valor || car.valor || '',
            FichaTecnica: car.FichaTecnica
          })),
          
          // Especificaciones - formato para landing
          especificaciones: (product.caracteristicas || []).map(car => ({
            concepto: car.nombre,
            valor: car.FichaTecnica?.valor || car.valor || '',
            otroConcepto: ''
          }))
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
   */
  getById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del producto es requerido');
      }

      const response = await apiRequest.get(`${PRODUCTS_ENDPOINT}/${id}`);

      if (response.success && response.data) {
        const product = response.data;
        return {
          ...response,
          data: {
            // IDs
            id_producto: product.id_producto,
            id: product.id_producto,
            
            // InformaciÃ³n bÃ¡sica
            nombre: product.nombre,
            descripcion: product.descripcion || '',
            
            // Stock y cantidad
            stock: parseInt(product.stock) || 0,
            cantidad: parseInt(product.stock) || 0,
            
            // Precios
            precio_venta: parseFloat(product.precio_venta) || 0,
            precio: parseFloat(product.precio_venta) || 0,
            costo: parseFloat(product.costo) || 0,
            iva: parseFloat(product.iva) || 0,
            
            // Fechas
            fecha_registro: product.fecha_registro,
            fechaRegistro: product.fecha_registro,
            
            //IMÃGENES - Convertir string separado por comas en array
            url_foto: product.url_foto,
            foto: product.url_foto ? product.url_foto.split(',')[0] : null,
            fotos: product.url_foto ? product.url_foto.split(',').filter(url => url) : [],
            imagen: product.url_foto ? product.url_foto.split(',')[0] : null,
            
            // CategorÃ­a - compatible con ambos formatos
            categoriaObj: product.categoria ? {
              id_categoria_producto: product.categoria.id_categoria_producto,
              nombre: product.categoria.nombre
            } : null,
            categoria: product.categoria?.nombre || 'Sin categorÃ­a',
            id_categoria_producto: product.categoria?.id_categoria_producto || null,
            
            // Tipo de producto
            tipoProducto: product.categoria?.nombre || 'General',
            
            // CaracterÃ­sticas - formato completo
            caracteristicas: (product.caracteristicas || []).map(car => ({
              id_caracteristica: car.id_caracteristica,
              nombre: car.nombre,
              valor: car.FichaTecnica?.valor || car.valor || '',
              FichaTecnica: car.FichaTecnica
            })),
            
            // Especificaciones - formato para landing
            especificaciones: (product.caracteristicas || []).map(car => ({
              concepto: car.nombre,
              valor: car.FichaTecnica?.valor || car.valor || '',
              otroConcepto: ''
            }))
          }
        };
      }

      return response;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo producto
   */
  create: async (productData) => {
    return executeWithToast({
      operation: 'create',
      entity: 'producto',
      loadingMessage: 'Creando producto...',
      successMessage: 'Producto creado exitosamente',
      promiseFn: async () => {
        if (!productData.nombre) {
          throw new Error('El nombre del producto es requerido');
        }
        if (!productData.precio_venta && !productData.precio) {
          throw new Error('El precio es requerido');
        }
        if (!productData.id_categoria_producto && !productData.categoryId) {
          throw new Error('La categoría es requerida');
        }
        const mappedData = {
          nombre: productData.nombre.trim(),
          descripcion: productData.descripcion?.trim() || null,
          id_categoria_producto: parseInt(productData.id_categoria_producto || productData.categoryId),
          precio_venta: parseFloat(productData.precio_venta || productData.precio),
          stock: parseInt(productData.stock || productData.cantidad || 0),
          costo: parseFloat(productData.costo || 0),
          iva: parseFloat(productData.iva || 0)
        };
        if (productData.fotos && Array.isArray(productData.fotos) && productData.fotos.length > 0) {
          const validImages = productData.fotos
            .filter(img => img && (img.startsWith('data:image') || img.includes('cloudinary.com')))
            .slice(0, 3);
          if (validImages.length > 0) {
            mappedData.fotos = validImages;
          }
        }
        if (productData.caracteristicas && Array.isArray(productData.caracteristicas)) {
          mappedData.caracteristicas = productData.caracteristicas
            .filter(c => c.nombre && c.valor && c.nombre.trim() !== '' && c.valor.trim() !== '')
            .map(c => ({ nombre: c.nombre.trim(), valor: c.valor.trim() }));
        }
        const response = await apiRequest.post(PRODUCTS_ENDPOINT, mappedData);
        return response;
      }
    });
  },

  /**
   * Actualizar un producto existente
   */
  update: async (id, productData) => {
    return executeWithToast({
      operation: 'update',
      entity: 'producto',
      id,
      loadingMessage: 'Actualizando producto...',
      successMessage: 'Producto actualizado exitosamente',
      promiseFn: async () => {
        if (!id) {
          throw new Error('ID del producto es requerido');
        }
        const mappedData = {
          nombre: productData.nombre?.trim(),
          descripcion: productData.descripcion?.trim() || null,
        };
        if (productData.precio_venta !== undefined || productData.precio !== undefined) {
          const precio = parseFloat(productData.precio_venta || productData.precio);
          if (!isNaN(precio) && precio > 0) {
            mappedData.precio_venta = precio;
          }
        }
        if (productData.stock !== undefined || productData.cantidad !== undefined) {
          const stock = parseInt(productData.stock || productData.cantidad || 0);
          if (!isNaN(stock) && stock >= 0) {
            mappedData.stock = stock;
          }
        }
        if (productData.id_categoria_producto || productData.categoryId) {
          const categoryId = parseInt(productData.id_categoria_producto || productData.categoryId);
          if (!isNaN(categoryId) && categoryId > 0) {
            mappedData.id_categoria_producto = categoryId;
          }
        }
        if (productData.costo !== undefined && productData.costo !== null && productData.costo !== '') {
          const costo = parseFloat(productData.costo);
          if (!isNaN(costo) && costo > 0) {
            mappedData.costo = costo;
          }
        }
        if (productData.iva !== undefined && productData.iva !== null && productData.iva !== '') {
          const iva = parseFloat(productData.iva);
          if (!isNaN(iva) && iva >= 0 && iva <= 40) {
            mappedData.iva = iva;
          }
        }
        if (productData.fotos && Array.isArray(productData.fotos)) {
          const validImages = productData.fotos
            .filter(img => img && (img.startsWith('data:image') || img.includes('cloudinary.com')))
            .slice(0, 3);
          mappedData.fotos = validImages;
        }
        if (productData.especificaciones && Array.isArray(productData.especificaciones)) {
          mappedData.caracteristicas = productData.especificaciones
            .filter(e => {
              const nombre = e.concepto === "otro" ? e.otroConcepto : e.concepto;
              return nombre && e.valor && nombre.trim() !== '' && e.valor.trim() !== '';
            })
            .map(e => ({
              nombre: (e.concepto === "otro" ? e.otroConcepto : e.concepto).trim(),
              valor: e.valor.trim()
            }));
        } else if (productData.caracteristicas && Array.isArray(productData.caracteristicas)) {
          mappedData.caracteristicas = productData.caracteristicas
            .filter(c => c.nombre && c.valor && c.nombre.trim() !== '' && c.valor.trim() !== '')
            .map(c => ({ nombre: c.nombre.trim(), valor: c.valor.trim() }));
        }
        Object.keys(mappedData).forEach(key => {
          if (mappedData[key] === undefined || mappedData[key] === null || (typeof mappedData[key] === 'number' && isNaN(mappedData[key]))) {
            delete mappedData[key];
          }
        });
        const response = await apiRequest.put(`${PRODUCTS_ENDPOINT}/${id}`, mappedData);
        return response;
      }
    });
  },

  /**
   * Eliminar un producto
   */
  delete: async (id) => {
    return executeWithToast({
      operation: 'delete',
      entity: 'producto',
      id,
      loadingMessage: 'Eliminando producto...',
      successMessage: 'Producto eliminado exitosamente',
      promiseFn: async () => {
        if (!id) {
          throw new Error('ID del producto es requerido');
        }
        const response = await apiRequest.delete(`${PRODUCTS_ENDPOINT}/${id}`);
        return response;
      }
    });
  },

  /**
   * Actualizar stock de un producto
   */
  updateStock: async (id, stock) => {
    return executeWithToast({
      operation: 'update',
      entity: 'stock',
      id,
      loadingMessage: 'Actualizando stock...',
      successMessage: 'Stock actualizado correctamente',
      promiseFn: async () => {
        if (!id) {
          throw new Error('ID del producto es requerido');
        }
        const response = await apiRequest.patch(`${PRODUCTS_ENDPOINT}/${id}/stock`, {
          stock: parseInt(stock)
        });
        return response;
      }
    });
  },
  getLowStock: async (limit = 10) => {
    try {
      const response = await apiRequest.get(`${PRODUCTS_ENDPOINT}/bajo-stock/list?limite=${limit}`);
      if (response.success) {
        const mappedProducts = (response.data || []).map(product => ({
          id: product.id_producto,
          nombre: product.nombre,
          stock: parseInt(product.stock) || 0,
          precio_venta: parseFloat(product.precio_venta) || 0,
          costo: parseFloat(product.costo) || 0
        }));
        return { success: true, data: mappedProducts };
      }
      return response;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }
};

export default productsService;
