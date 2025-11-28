import { useEffect, useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { employeesService } from '../API/employeesService';
import EditEmployee from './EditEmployee';

const EmployeeDetailPage = () => {
  const { id } = useParams();
  const { setTitle } = useOutletContext();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setTitle('Detalle de Empleado');
    return () => setTitle('');
  }, [setTitle]);

  useEffect(() => {
    const loadEmployee = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await employeesService.getById(id);
        setEmployee(data);
      } catch (err) {
        setError('No se pudo cargar el empleado');
      } finally {
        setLoading(false);
      }
    };
    if (id) loadEmployee();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center text-gray-600">Cargando empleado...</div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center text-red-600">{error || 'Empleado no encontrado'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-inter">
      <EditEmployee employee={employee} onCancel={() => {}} onSave={() => {}} employees={[]} mode="view" />
    </div>
  );
};

export default EmployeeDetailPage;
