// pages/Dashboard.jsx
import React from 'react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Usuarios',
      value: '1,234',
      icon: 'bi-people',
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Productos',
      value: '856',
      icon: 'bi-box',
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'increase'
    },
    {
      title: 'Ventas del Mes',
      value: '$45,678',
      icon: 'bi-graph-up',
      color: 'bg-yellow-500',
      change: '+18%',
      changeType: 'increase'
    },
    {
      title: 'Pedidos Pendientes',
      value: '23',
      icon: 'bi-clock',
      color: 'bg-red-500',
      change: '-8%',
      changeType: 'decrease'
    }
  ];

  const recentActivities = [
    { id: 1, action: 'Nuevo usuario registrado', user: 'Juan Pérez', time: 'Hace 5 min' },
    { id: 2, action: 'Pedido completado', user: 'María García', time: 'Hace 15 min' },
    { id: 3, action: 'Producto actualizado', user: 'Carlos López', time: 'Hace 30 min' },
    { id: 4, action: 'Nueva cita agendada', user: 'Ana Martínez', time: 'Hace 1 hora' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ¡Bienvenido de vuelta!
        </h2>
        <p className="text-gray-600">
          Aquí tienes un resumen de la actividad de tu sistema.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} rounded-full p-3`}>
                <i className={`${stat.icon} text-white text-xl`}></i>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                vs mes anterior
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Ventas Mensuales
          </h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <i className="bi bi-bar-chart text-4xl text-gray-400 mb-2"></i>
              <p className="text-gray-500">Gráfico de ventas</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">
                    por {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium">
              Ver toda la actividad
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <i className="bi bi-plus-circle text-2xl text-blue-500 mb-2"></i>
            <span className="text-sm font-medium text-gray-700">Nuevo Usuario</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <i className="bi bi-box-arrow-in-down text-2xl text-green-500 mb-2"></i>
            <span className="text-sm font-medium text-gray-700">Nuevo Producto</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <i className="bi bi-calendar-plus text-2xl text-yellow-500 mb-2"></i>
            <span className="text-sm font-medium text-gray-700">Agendar Cita</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <i className="bi bi-file-earmark-text text-2xl text-purple-500 mb-2"></i>
            <span className="text-sm font-medium text-gray-700">Nuevo Pedido</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;