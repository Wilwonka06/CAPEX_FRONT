import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import characteristicsService from '../API/characteristicsService';
import Swal from 'sweetalert2';

const CharacteristicsManager = ({ isOpen, onClose }) => {
  const [characteristics, setCharacteristics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadCharacteristics();
    }
  }, [isOpen]);

  const loadCharacteristics = async () => {
    try {
      setLoading(true);
      const response = await characteristicsService.getAll();
      if (response.success) {
        setCharacteristics(response.data || []);
      } else {
        toast.error('Error al cargar las características');
      }
    } catch (error) {
      console.error('Error loading characteristics:', error);
      toast.error('Error al cargar las características');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (characteristic) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la característica "${characteristic.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setDeleting(characteristic.id_caracteristica);
        const response = await characteristicsService.delete(characteristic.id_caracteristica);
        if (response.success) {
          toast.success('Característica eliminada exitosamente');
          setCharacteristics(prev => prev.filter(c => c.id_caracteristica !== characteristic.id_caracteristica));
        } else {
          toast.error(response.message || 'Error al eliminar la característica');
        }
      } catch (error) {
        console.error('Error deleting characteristic:', error);
        toast.error(error.message || 'Error al eliminar la característica');
      } finally {
        setDeleting(null);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-lg flex items-center justify-between px-8 py-4">
          <h2 className="text-xl font-bold text-primary m-0">Gestionar Características Técnicas</h2>
          <button 
            className="text-gray-400 hover:text-primary text-xl font-bold" 
            onClick={onClose} 
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-8 flex-1">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando características...</p>
            </div>
          ) : characteristics.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No hay características registradas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {characteristics.map((characteristic) => (
                <div
                  key={characteristic.id_caracteristica}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-800">
                    {characteristic.nombre}
                  </span>
                  <button
                    onClick={() => handleDelete(characteristic)}
                    disabled={deleting === characteristic.id_caracteristica}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {deleting === characteristic.id_caracteristica ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        <span>Eliminando...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-trash"></i>
                        <span>Eliminar</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 px-8 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacteristicsManager;



