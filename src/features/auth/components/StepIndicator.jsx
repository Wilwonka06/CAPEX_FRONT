const StepIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-[#ffb76b] to-[#ff7c7c] text-white'
                    : isActive
                    ? 'bg-[#ffb76b] text-white ring-4 ring-[#ffb76b]/20'
                    : 'bg-gray-200 text-gray-500'
                }`}
                aria-label={`Paso ${stepNumber} de ${totalSteps}${isCompleted ? ' completado' : isActive ? ' actual' : ''}`}
              >
                {isCompleted ? (
                  <i className="bi bi-check-lg text-sm"></i>
                ) : (
                  stepNumber
                )}
              </div>
              {stepNumber < totalSteps && (
                <div
                  className={`w-16 h-1 mx-2 rounded transition-all duration-300 ${
                    isCompleted ? 'bg-gradient-to-r from-[#ffb76b] to-[#ff7c7c]' : 'bg-gray-200'
                  }`}
                ></div>
              )}
            </div>
          );
        })}
      </div>
      <div className="ml-4 text-sm text-[#6d3b3b]/70 font-medium">
        Paso {currentStep} de {totalSteps}
      </div>
    </div>
  );
};

export default StepIndicator;