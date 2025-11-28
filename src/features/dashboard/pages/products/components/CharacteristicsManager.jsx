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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-gear text-lg"></i>
            </div>
            <h2 className="text-xl font-bold m-0">Gestionar Características Técnicas</h2>
          </div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
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
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border bg-white text-gray-700 text-sm hover:bg-gray-50 transition-all duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacteristicsManager;



