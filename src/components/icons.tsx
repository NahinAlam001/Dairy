"use client";

import React from 'react';

export const AntiqueOwlIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="currentColor">
    <path
      d="M40 5C21.2 5 6 20.2 6 39s15.2 34 34 34 34-15.2 34-34S58.8 5 40 5zm0 63.8c-16.4 0-29.8-13.3-29.8-29.8S23.6 9.2 40 9.2s29.8 13.3 29.8 29.8-13.4 29.8-29.8 29.8z"
      opacity=".4"
    />
    <path
      d="M40 12.1c-11.8 0-21.4 8.4-21.4 18.8 0 7.8 5.4 14.5 12.8 17.3-.6 1.4-1 2.9-1 4.5 0 5.9 5.6 10.7 12.5 10.7s12.5-4.8 12.5-10.7c0-1.6-.4-3.1-1-4.5 7.4-2.8 12.8-9.5 12.8-17.3 0-10.4-9.6-18.8-21.4-18.8z"
      opacity=".4"
    />
    <g>
      <circle cx="30.5" cy="30.9" r="6.2" />
      <circle cx="49.5" cy="30.9" r="6.2" />
      <path d="M39.6 40.5c-1.3 0-2.4 1.1-2.4 2.4 0 .8.4 1.5 1 1.9l-1.3 2.6h5.3l-1.3-2.6c.6-.4 1-1.1 1-1.9.1-1.3-1-2.4-2.3-2.4z" />
    </g>
  </svg>
);


interface ClaspIconProps {
  onClick: () => void;
  isLocked: boolean;
}

export const ClaspIcon = ({ onClick, isLocked }: ClaspIconProps) => (
  <div
    onClick={onClick}
    className={`absolute top-1/2 -right-4 transform -translate-y-1/2 w-16 h-24 bg-primary/60 cursor-pointer rounded-r-lg flex items-center justify-center shadow-lg transition-transform duration-500 ${isLocked ? "" : "translate-x-16"}`}
  >
    <div className="w-10 h-14 bg-primary/80 rounded-md border-2 border-primary flex flex-col items-center justify-around p-1 shadow-inner">
      <div className="w-3 h-3 rounded-full bg-background/70"></div>
      <div className="w-3 h-3 rounded-full bg-background/70"></div>
    </div>
  </div>
);
