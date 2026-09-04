"use client"

import React from 'react'

export function GlobalLoader({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[99999] bg-[#15191f] flex items-center justify-center overflow-hidden">
      {/* Background scattered circles (similar to image dots) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => {
          const size = Math.random() * 30 + 10
          return (
            <div 
              key={i}
              className="absolute rounded-full bg-slate-500/10 backdrop-blur-[1px]"
              style={{
                width: size + 'px',
                height: size + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animation: `pulse ${Math.random() * 4 + 2}s infinite alternate`
              }}
            />
          )
        })}
      </div>

      <div className="relative flex items-center justify-center h-72 w-72">
        {/* Outer broken ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#186a7b] border-b-[#186a7b] border-l-[#186a7b] animate-[spin_4s_linear_infinite]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 80%)' }} />
        
        {/* Second ring */}
        <div className="absolute inset-4 rounded-full border-[4px] border-transparent border-r-[#248d9f] border-b-[#248d9f] animate-[spin_3s_ease-in-out_infinite_reverse]" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 20% 100%)' }} />
        
        {/* Third ring */}
        <div className="absolute inset-10 rounded-full border-[5px] border-transparent border-t-[#2fb1c4] border-l-[#2fb1c4] animate-[spin_2s_linear_infinite]" style={{ clipPath: 'polygon(0 0, 80% 0, 80% 100%, 0 100%)' }} />
        
        {/* Inner solid arc */}
        <div className="absolute inset-16 rounded-full border-[6px] border-transparent border-b-[#47dcf1] border-r-[#47dcf1] animate-[spin_1.5s_linear_infinite]" style={{ clipPath: 'polygon(0 20%, 100% 20%, 100% 100%, 0 100%)' }} />
        
        <div className="z-10 font-mono tracking-[0.2em] text-white text-sm font-medium">
          LOADING
        </div>
      </div>
    </div>
  )
}
