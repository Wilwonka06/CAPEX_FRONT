import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { nombre, cantidad, total } = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <div className="font-bold text-[#1E1E1E] text-sm">{nombre}</div>
        <div className="text-[#FACC15] font-semibold text-sm">Cantidad: {cantidad}</div>
        <div className="text-gray-600 text-sm">Total: ${total.toLocaleString('es-CO')}</div>
      </div>
    );
  }
  return null;
};

const TopProductsChart = ({ data }) => {

  return (
    <div className="w-full">
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 60, left: 180, bottom: 20 }}
          barCategoryGap={15}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
          <XAxis
            type="number"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#D1D5DB' }}
            domain={[0, 'dataMax']}
          />
          <YAxis
            dataKey="nombre"
            type="category"
            tick={{ fill: '#1E1E1E', fontWeight: 500, fontSize: 12 }}
            width={170}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="cantidad" fill="#1E1E1E" radius={[0, 6, 6, 0]} opacity={0.8}>
            <LabelList
              dataKey="cantidad"
              position="right"
              fill="#FACC15"
              fontWeight={600}
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductsChart; 
