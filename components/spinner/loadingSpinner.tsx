'use client'

import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 rounded-full bg-teal-600 animate-pulse"></div>
      <div className="w-4 h-4 rounded-full bg-teal-600 animate-pulse delay-100"></div>
      <div className="w-4 h-4 rounded-full bg-teal-600 animate-pulse delay-200"></div>
    </div>
  );
}