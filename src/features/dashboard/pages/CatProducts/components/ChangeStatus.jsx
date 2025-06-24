import React from "react";

const ChangeStatus = ({ status }) => {
  return (
    <div className="flex items-center">
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 ${status === 'active' ? 'bg-primary' : 'bg-primary-dark'}`}>
        <span className="text-white text-xs font-bold">
          {status === 'active' ? 'A' : 'I'}
        </span>
      </span>
      <div className={`relative inline-block w-10 h-5 rounded-full transition-colors ${status === 'active' ? 'bg-primary-dark' : 'bg-gray-300'}`}>
        <div className={`absolute left-0 top-0 w-5 h-5 rounded-full bg-white shadow transform transition-transform ${status === 'active' ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
};

export default ChangeStatus;