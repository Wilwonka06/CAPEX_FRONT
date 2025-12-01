import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/**
 * Espera un arreglo con objetos:
 * { label: 'Semana 01/04 - 07/04', productos: 150000, servicios: 80000, total: 230000 }
 */
const WeeklySalesChart = ({ data = [] }) => {

  return (
    <div className="w-full">
      
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 500 }}
            axisLine={{ stroke: "#D1D5DB" }}
          />
          <YAxis
            tickFormatter={(value) => `$${value.toLocaleString("es-CO")}`}
            tick={{ fill: "#6B7280", fontSize: 12 }}
            axisLine={{ stroke: "#D1D5DB" }}
          />
          <Tooltip
            formatter={(value, name) => [
              `$${Number(value || 0).toLocaleString("es-CO")}`,
              name,
            ]}
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              color: "#1E1E1E",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          <Bar
            dataKey="productos"
            name="Productos"
            fill="#FACC15"
            radius={[4, 4, 0, 0]}
            opacity={0.9}
          />
          <Bar
            dataKey="servicios"
            name="Servicios"
            fill="#1E1E1E"
            radius={[4, 4, 0, 0]}
            opacity={0.8}
          />
          <Line
            type="monotone"
            dataKey="total"
            name="Total"
            stroke="#A0522D"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklySalesChart;