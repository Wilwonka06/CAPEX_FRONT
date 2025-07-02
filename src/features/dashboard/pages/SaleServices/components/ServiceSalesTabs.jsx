import React from "react";

const tabs = [
  { label: "En ejecucion", value: "En ejecucion" },
  { label: "Ventas", value: "Ventas" }
];

const ServiceSalesTabs = ({ tab, setTab }) => (
  <div className="flex space-x-2 mt-4">
    {tabs.map((t) => (
      <button
        key={t.value}
        onClick={() => setTab(t.value)}
        className={`px-4 py-1 rounded-t-md border-b-2 font-medium transition-colors text-sm focus:outline-none
          ${tab === t.value
            ? "border-primary-dark text-primary-dark bg-background"
            : "border-transparent text-text-main/70 hover:text-primary-dark hover:bg-accent-light"}
        `}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export default ServiceSalesTabs; 