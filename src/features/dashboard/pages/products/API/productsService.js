import apiRequest from '../../../../../shared/config/apiConfig';

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
    try {
      console.log('API Service: Received productData:', productData);

      // Validaciones bÃ¡sicas
      if (!productData.nombre) {
        throw new Error('El nombre del producto es requerido');
      }
      if (!productData.precio_venta && !productData.precio) {
        throw new Error('El precio es requerido');
      }
      if (!productData.id_categoria_producto && !productData.categoryId) {
        throw new Error('La categorÃ­a es requerida');
      }

      // Mapeo para el backend
      const mappedData = {
        nombre: productData.nombre.trim(),
        descripcion: productData.descripcion?.trim() || null,
        id_categoria_producto: parseInt(productData.id_categoria_producto || productData.categoryId),
        precio_venta: parseFloat(productData.precio_venta || productData.precio),
        stock: parseInt(productData.stock || productData.cantidad || 0),
        costo: parseFloat(productData.costo || 0),
        iva: parseFloat(productData.iva || 0)
      };

      // Enviar array de imÃ¡genes (mÃ¡ximo 3)
      if (productData.fotos && Array.isArray(productData.fotos) && productData.fotos.length > 0) {
        // Filtrar solo imÃ¡genes vÃ¡lidas (base64 o URLs de Cloudinary)
        const validImages = productData.fotos
          .filter(img => img && (img.startsWith('data:image') || img.includes('cloudinary.com')))
          .slice(0, 3); // MÃ¡ximo 3 imÃ¡genes
        
        if (validImages.length > 0) {
          mappedData.fotos = validImages;
        }
      }

      // Mapear caracterÃ­sticas
      if (productData.caracteristicas && Array.isArray(productData.caracteristicas)) {
        mappedData.caracteristicas = productData.caracteristicas
          .filter(c => c.nombre && c.valor && c.nombre.trim() !== '' && c.valor.trim() !== '')
          .map(c => ({
            nombre: c.nombre.trim(),
            valor: c.valor.trim()
          }));

        console.log('API Service: Mapped caracterÃ­sticas:', mappedData.caracteristicas);
      }

      console.log('API Service: Sending mappedData to backend:', mappedData);
      const response = await apiRequest.post(PRODUCTS_ENDPOINT, mappedData);
      console.log('API Service: Response received:', response);
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Actualizar un producto existente
   */
  update: async (id, productData) => {
    try {
      if (!id) {
        throw new Error('ID del producto es requerido');
      }

      console.log('API Service: Updating product', id, 'with data:', productData);

      // Mapeo para el backend
      const mappedData = {
        nombre: productData.nombre?.trim(),
        descripcion: productData.descripcion?.trim() || null,
        precio_venta: parseFloat(productData.precio_venta || productData.precio),
        stock: parseInt(productData.stock || productData.cantidad || 0)
      };

      // Mapear categoryId si existe
      if (productData.id_categoria_producto || productData.categoryId) {
        mappedData.id_categoria_producto = parseInt(
          productData.id_categoria_producto || productData.categoryId
        );
      }

      // Mapear array de imÃ¡genes (mÃ¡ximo 3)
      if (productData.fotos && Array.isArray(productData.fotos)) {
        // Filtrar solo imÃ¡genes vÃ¡lidas
        const validImages = productData.fotos
          .filter(img => img && (img.startsWith('data:image') || img.includes('cloudinary.com')))
          .slice(0, 3);
        
        if (validImages.length > 0) {
          mappedData.fotos = validImages;
        }
      }

      // Mapear caracterÃ­sticas correctamente desde especificaciones
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

        console.log('API Service: Mapped caracterÃ­sticas from especificaciones:', mappedData.caracteristicas);
      } else if (productData.caracteristicas && Array.isArray(productData.caracteristicas)) {
        mappedData.caracteristicas = productData.caracteristicas
          .filter(c => c.nombre && c.valor && c.nombre.trim() !== '' && c.valor.trim() !== '')
          .map(c => ({
            nombre: c.nombre.trim(),
            valor: c.valor.trim()
          }));

        console.log('API Service: Mapped caracterÃ­sticas:', mappedData.caracteristicas);
      }

      console.log('API Service: Sending update data:', mappedData);
      const response = await apiRequest.put(`${PRODUCTS_ENDPOINT}/${id}`, mappedData);
      return response;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un producto
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
   * Actualizar stock de un producto
   */
  updateStock: async (id, stock) => {
    try {
      if (!id) {
        throw new Error('ID del producto es requerido');
      }

      const response = await apiRequest.patch(`${PRODUCTS_ENDPOINT}/${id}/stock`, {
        stock: parseInt(stock)
      });
      return response;
    } catch (error) {
      console.error(`Error updating product stock ${id}:`, error);
      throw error;
    }
  }
};

export default productsService;