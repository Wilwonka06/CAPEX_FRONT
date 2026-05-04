import { useState, useEffect } from 'react';
import shippingZonesService from './API/shippingZonesService';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { formatPrice, parseFormattedNumber } from '../../../../shared/utils/formatters';
import TableSkeleton from '../../../../shared/components/TableSkeleton';

const ShippingZones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', precio: '', estado: 'Activo' });

  const fetchZones = async () => {
    setLoading(true);
    try {
      const response = await shippingZonesService.getAll({ includeInactive: true });
      if (response.success) {
        setZones(response.data || []);
      }
    } catch (error) {
      toast.error('Error al cargar zonas de envío');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleOpenModal = (zone = null) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        nombre: zone.nombre,
        precio: zone.precio.toString(),
        estado: zone.estado
      });
    } else {
      setEditingZone(null);
      setFormData({ nombre: '', precio: '', estado: 'Activo' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      precio: parseFloat(formData.precio)
    };

    try {
      if (editingZone) {
        await shippingZonesService.update(editingZone.id_shipping_zone, data);
        toast.success('Zona actualizada correctamente');
      } else {
        await shippingZonesService.create(data);
        toast.success('Zona creada correctamente');
      }
      setShowModal(false);
      fetchZones();
    } catch (error) {
      toast.error('Error al guardar la zona');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "La zona se marcará como Inactiva.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FACC15',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await shippingZonesService.delete(id);
        toast.success('Zona desactivada');
        fetchZones();
      } catch (error) {
        toast.error('Error al desactivar zona');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Zonas de Envío (Domicilios)</h1>
          <p className="text-gray-500 text-sm">Gestiona los precios de envío para tus clientes.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-900 px-4 py-2 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <i className="bi bi-plus-lg"></i>
          Nueva Zona
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase">Nombre</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase">Precio</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase">Estado</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {zones.map((zone) => (
                <tr key={zone.id_shipping_zone} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{zone.nombre}</td>
                  <td className="px-6 py-4 text-gray-600 font-semibold">{formatPrice(zone.precio)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${zone.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {zone.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenModal(zone)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    {zone.estado === 'Activo' && (
                      <button
                        onClick={() => handleDelete(zone.id_shipping_zone)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Desactivar"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {zones.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">No hay zonas configuradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-900 rounded-t-2xl">
              <h2 className="text-xl font-bold">{editingZone ? 'Editar Zona' : 'Nueva Zona de Envío'}</h2>
              <button onClick={() => setShowModal(false)} className="text-2xl hover:scale-110 transition-transform">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de la Zona</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#FACC15] outline-none"
                  placeholder="Ej: Nacional, Veredas..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Costo de Envío</label>
                <input
                  type="number"
                  required
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#FACC15] outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#FACC15] outline-none bg-white"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-500 font-bold hover:text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-gray-900 px-6 py-2 rounded-xl font-bold shadow-lg"
                >
                  {editingZone ? 'Actualizar' : 'Crear Zona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingZones;
