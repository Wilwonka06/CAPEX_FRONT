const OrderProgressIndicator = ({ currentStep, totalSteps = 4 }) => {
  const steps = [
    { id: 1, label: 'Validando datos', description: 'Verificando información del pedido' },
    { id: 2, label: 'Creando pedido', description: 'Generando orden en el sistema' },
    { id: 3, label: 'Procesando pago', description: 'Autorizando transacción' },
    { id: 4, label: 'Confirmación', description: 'Finalizando compra' }
  ];

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  const getStepClassName = (status) => {
    const baseClass = 'flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm transition-all duration-300';
    
    switch (status) {
      case 'completed':
        return `${baseClass} bg-green-500 border-green-500 text-white`;
      case 'current':
        return `${baseClass} bg-[#FACC15] border-[#FACC15] text-[#1E1E1E] animate-pulse`;
      default:
        return `${baseClass} bg-gray-200 border-gray-300 text-gray-500`;
    }
  };

  const getConnectorClassName = (stepId) => {
    const isCompleted = stepId < currentStep;
    return `flex-1 h-1 mx-4 transition-all duration-300 ${
      isCompleted ? 'bg-green-500' : 'bg-gray-200'
    }`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-bold text-[#1E1E1E] mb-4 text-center">
        Procesando tu pedido
      </h3>
      
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-5 left-10 right-10 h-1 bg-gray-200 rounded">
          <div 
            className="h-full bg-green-500 rounded transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
        
        {/* Steps */}
        <div className="relative flex justify-between items-center">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.id} className="flex items-center flex-col">
                <div className={getStepClassName(status)}>
                  {status === 'completed' ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                
                <div className="text-center mt-2 max-w-24">
                  <div className={`text-sm font-medium ${
                    status === 'current' ? 'text-[#FACC15]' : 
                    status === 'completed' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 hidden sm:block">
                    {step.description}
                  </div>
                </div>
                
                {!isLast && (
                  <div className={getConnectorClassName(step.id)} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Progress percentage */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progreso</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#FACC15] h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Por favor espera mientras procesamos tu pedido...
        </p>
      </div>
    </div>
  );
};

export default OrderProgressIndicator;