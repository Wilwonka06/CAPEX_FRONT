import React, { useState } from 'react';

const ClientAppointments = () => {
  const [activeTab, setActiveTab] = useState('misCitas');

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="flex border rounded overflow-hidden mb-6">
        <button
          className={`flex-1 py-2 px-4 text-center ${activeTab === 'misCitas' ? 'bg-blue-200 font-semibold' : 'bg-white'} border-r`}
          onClick={() => setActiveTab('misCitas')}
        >
          Mis citas
        </button>
        <button
          className={`flex-1 py-2 px-4 text-center ${activeTab === 'agendar' ? 'bg-blue-200 font-semibold' : 'bg-white'}`}
          onClick={() => setActiveTab('agendar')}
        >
          Agendar cita
        </button>
      </div>
      <div className="bg-white p-6 rounded shadow">
        {activeTab === 'misCitas' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Mis citas</h2>
            <p>Aquí aparecerán tus citas agendadas.</p>
            {/* Aquí puedes renderizar la lista de citas del cliente */}
          </div>
        )}
        {activeTab === 'agendar' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Agendar cita</h2>
            <p>Formulario para agendar una nueva cita.</p>
            {/* Aquí puedes poner el formulario para agendar una cita */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientAppointments; 