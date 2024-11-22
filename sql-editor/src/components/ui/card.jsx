import React from 'react';

export function Card({ className, ...props }) {
  return (
    <div
      className={`bg-white shadow rounded-lg ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={`p-6 ${className}`}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={`text-lg font-medium ${className}`}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div
      className={`p-6 pt-0 ${className}`}
      {...props}
    />
  );
}