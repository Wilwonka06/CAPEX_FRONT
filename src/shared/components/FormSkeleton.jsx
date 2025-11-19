import React from 'react'

const FormSkeleton = ({ lines = 6 }) => (
  <div className="space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-3 w-24 bg-gray-200 rounded mb-2"></div>
        <div className="h-8 w-full bg-gray-100 rounded"></div>
      </div>
    ))}
  </div>
)

export default FormSkeleton