import React from 'react';

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true" data-testid="app-logo">
      <defs>
        <linearGradient id="shieldGrad" x1="15" y1="5" x2="85" y2="95" gradientUnits="userSpaceOnUse">
          <stop stopColor="#047857" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <path d="M50 5 L85 15 V45 C85 70 50 95 50 95 C50 95 15 70 15 45 V15 L50 5 Z" fill="url(#shieldGrad)" className="drop-shadow-md" />
      <path d="M35 25 L50 40 L65 25" stroke="#6ee7b7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 65 L28 35 L50 55 L72 35 L72 65" stroke="#ecfdf5" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
