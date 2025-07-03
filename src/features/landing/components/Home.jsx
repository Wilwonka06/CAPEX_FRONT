import React from 'react'

const servicios = [
  {
    icon: '💡',
    title: 'Consultoría',
    desc: 'Asesoría profesional para tu negocio.'
  },
  {
    icon: '🛠️',
    title: 'Soporte Técnico',
    desc: 'Soluciones rápidas y efectivas.'
  },
  {
    icon: '🚀',
    title: 'Implementación',
    desc: 'Puesta en marcha de tus proyectos.'
  }
]

const productos = [
  { img: 'https://via.placeholder.com/150', name: 'Producto 1', price: '$100' },
  { img: 'https://via.placeholder.com/150', name: 'Producto 2', price: '$120' },
  { img: 'https://via.placeholder.com/150', name: 'Producto 3', price: '$90' },
  { img: 'https://via.placeholder.com/150', name: 'Producto 4', price: '$110' },
  { img: 'https://via.placeholder.com/150', name: 'Producto 5', price: '$80' },
  { img: 'https://via.placeholder.com/150', name: 'Producto 6', price: '$130' },
  { img: 'https://via.placeholder.com/150', name: 'Producto 7', price: '$95' },
  { img: 'https://via.placeholder.com/150', name: 'Producto 8', price: '$105' },
]

const Home = () => {
  return (
    <div className="bg-background text-text-main">
      {/* Hero Section */}
      <section className="min-h-[60vh] flex flex-col md:flex-row items-center justify-between px-8 py-16 gap-8">
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-5xl font-bold">Bienvenido a CAPEX</h1>
          <p className="text-lg text-gray-600">Soluciones integrales para tu empresa. Impulsa tu crecimiento con nuestros servicios y productos.</p>
          <button className="w-fit bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition">Contáctanos</button>
        </div>
        <div className="flex-1 flex justify-center">
          <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80" alt="Hero" className="rounded-xl shadow-lg w-full max-w-md object-cover" />
        </div>
      </section>

      {/* Servicios */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Nuestros Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {servicios.map((serv, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center gap-4">
                <span className="text-5xl">{serv.icon}</span>
                <h3 className="text-xl font-semibold">{serv.title}</h3>
                <p className="text-gray-600">{serv.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition">Ver más servicios</button>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Productos Destacados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {productos.map((prod, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                <img src={prod.img} alt={prod.name} className="w-28 h-28 object-cover rounded mb-4" />
                <h3 className="text-lg font-semibold mb-2">{prod.name}</h3>
                <span className="text-primary font-bold text-xl">{prod.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Contáctenos</h2>
          <div className="bg-white rounded-lg shadow p-8 flex flex-col gap-4 text-lg">
            <div><span className="font-semibold">Dirección:</span> Calle Ficticia 123, Ciudad, País</div>
            <div><span className="font-semibold">Teléfono:</span> +52 123 456 7890</div>
            <div><span className="font-semibold">Correo:</span> contacto@capex.com</div>
            <div><span className="font-semibold">Horario de atención:</span> Lunes a Viernes, 9:00 a 18:00</div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
