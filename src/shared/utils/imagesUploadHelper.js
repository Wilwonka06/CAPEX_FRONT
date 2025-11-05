/**
 * Helpers para manejo de imágenes y subida a Cloudinary
 */

/**
 * Convertir archivo a base64
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} - Imagen en formato base64
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No se proporcionó archivo'));
        return;
      }
  
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        reject(new Error('El archivo debe ser una imagen'));
        return;
      }
  
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result);
      };
      
      reader.onerror = (error) => {
        reject(new Error('Error al leer el archivo: ' + error));
      };
      
      reader.readAsDataURL(file);
    });
  };
  
  /**
   * Comprimir imagen a base64 con dimensiones máximas
   * @param {File} file - Archivo de imagen
   * @param {number} maxWidth - Ancho máximo (por defecto 1000px)
   * @param {number} maxHeight - Alto máximo (por defecto 1000px)
   * @param {number} quality - Calidad de compresión 0-1 (por defecto 0.8)
   * @returns {Promise<string>} - Imagen comprimida en base64
   */
  export const compressImageToBase64 = (file, maxWidth = 1000, maxHeight = 1000, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No se proporcionó archivo'));
        return;
      }
  
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        reject(new Error('El archivo debe ser una imagen'));
        return;
      }
  
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
  
          // Calcular nuevas dimensiones manteniendo proporción
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
  
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
  
          // Convertir a base64 con calidad específica
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
  
        img.onerror = () => {
          reject(new Error('Error al cargar la imagen'));
        };
  
        img.src = e.target.result;
      };
  
      reader.onerror = (error) => {
        reject(new Error('Error al leer el archivo: ' + error));
      };
  
      reader.readAsDataURL(file);
    });
  };
  
  /**
   * Validar tamaño de archivo
   * @param {File} file - Archivo a validar
   * @param {number} maxSizeMB - Tamaño máximo en MB (por defecto 5MB)
   * @returns {boolean} - True si el tamaño es válido
   */
  export const validateFileSize = (file, maxSizeMB = 5) => {
    if (!file) return false;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  };
  
  /**
   * Validar tipo de archivo
   * @param {File} file - Archivo a validar
   * @param {Array<string>} allowedTypes - Tipos permitidos (por defecto: jpg, jpeg, png, gif, webp)
   * @returns {boolean} - True si el tipo es válido
   */
  export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']) => {
    if (!file) return false;
    return allowedTypes.includes(file.type);
  };
  
  /**
   * Convertir múltiples archivos a base64
   * @param {FileList|Array} files - Lista de archivos
   * @param {number} maxWidth - Ancho máximo
   * @param {number} maxHeight - Alto máximo
   * @param {number} quality - Calidad de compresión
   * @returns {Promise<Array<string>>} - Array de imágenes en base64
   */
  export const convertMultipleFilesToBase64 = async (files, maxWidth = 1000, maxHeight = 1000, quality = 0.8) => {
    const filesArray = Array.from(files);
    
    const promises = filesArray.map(file => 
      compressImageToBase64(file, maxWidth, maxHeight, quality)
    );
  
    try {
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      throw new Error('Error al procesar las imágenes: ' + error.message);
    }
  };
  
  /**
   * Crear preview de imagen desde File
   * @param {File} file - Archivo de imagen
   * @returns {Promise<string>} - URL del preview
   */
  export const createImagePreview = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No se proporcionó archivo'));
        return;
      }
  
      if (!file.type.startsWith('image/')) {
        reject(new Error('El archivo debe ser una imagen'));
        return;
      }
  
      const url = URL.createObjectURL(file);
      resolve(url);
    });
  };
  
  /**
   * Limpiar URL de preview (liberar memoria)
   * @param {string} url - URL del preview
   */
  export const revokeImagePreview = (url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };
  
  /**
   * Validar imagen base64
   * @param {string} base64String - String en formato base64
   * @returns {boolean} - True si es válida
   */
  export const validateBase64Image = (base64String) => {
    if (!base64String || typeof base64String !== 'string') {
      return false;
    }
    
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
    return base64Regex.test(base64String);
  };
  
  /**
   * Obtener información de una imagen base64
   * @param {string} base64String - Imagen en base64
   * @returns {Object} - Información de la imagen (width, height, size, type)
   */
  export const getBase64ImageInfo = (base64String) => {
    return new Promise((resolve, reject) => {
      if (!validateBase64Image(base64String)) {
        reject(new Error('Formato base64 inválido'));
        return;
      }
  
      const img = new Image();
      
      img.onload = () => {
        // Calcular tamaño aproximado en bytes
        const base64Data = base64String.split(',')[1];
        const sizeInBytes = Math.round((base64Data.length * 3) / 4);
        
        // Obtener tipo de imagen
        const typeMatch = base64String.match(/^data:image\/([^;]+);/);
        const type = typeMatch ? typeMatch[1] : 'unknown';
  
        resolve({
          width: img.width,
          height: img.height,
          sizeInBytes,
          sizeInKB: Math.round(sizeInBytes / 1024),
          sizeInMB: (sizeInBytes / (1024 * 1024)).toFixed(2),
          type
        });
      };
  
      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };
  
      img.src = base64String;
    });
  };
  
  /**
   * Redimensionar imagen base64
   * @param {string} base64String - Imagen en base64
   * @param {number} newWidth - Nuevo ancho
   * @param {number} newHeight - Nuevo alto
   * @param {number} quality - Calidad (0-1)
   * @returns {Promise<string>} - Imagen redimensionada en base64
   */
  export const resizeBase64Image = (base64String, newWidth, newHeight, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      if (!validateBase64Image(base64String)) {
        reject(new Error('Formato base64 inválido'));
        return;
      }
  
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
  
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
  
        const resizedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(resizedBase64);
      };
  
      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };
  
      img.src = base64String;
    });
  };
  
  export default {
    fileToBase64,
    compressImageToBase64,
    validateFileSize,
    validateFileType,
    convertMultipleFilesToBase64,
    createImagePreview,
    revokeImagePreview,
    validateBase64Image,
    getBase64ImageInfo,
    resizeBase64Image
  };