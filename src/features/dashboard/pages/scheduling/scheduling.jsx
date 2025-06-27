import React from 'react'
import Calendar from '../employees/components/Calendar'

const Scheduling = () => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Agendamiento de Servicios</h1>
            <div className="flex justify-end mb-8">
                <div className="relative w-full max-w-xs pr-4">
                    <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-text-main/50"></i>
                    <input
                        type="text"
                        placeholder="Buscar programación..."
                        /*value={searchTerm}
                        onChange={handleSearch}*/
                        className="border border-gray-300 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
                    />
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-md mb-4">
                <Calendar />
            </div>
        </div>
    )
}

export default Scheduling
