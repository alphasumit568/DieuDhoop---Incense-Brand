import React from "react";
import { cn } from "../lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 200 240" 
      fill="currentColor" 
      className={cn("w-full h-full", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Flame/Teardrop */}
      <path d="M100 10 C120 40 135 60 100 110 C65 60 80 40 100 10 Z" />
      <path d="M100 45 C110 65 110 75 100 90 C90 75 90 65 100 45 Z" opacity="0.6" fill="white" />
      
      {/* Middle Lotus Core */}
      <path d="M100 115 C130 145 140 185 100 220 C60 185 70 145 100 115 Z" />
      
      {/* Side Petals / Base */}
      <path d="M85 130 C40 110 30 180 100 230 C70 200 80 160 85 130 Z" />
      <path d="M115 130 C160 110 170 180 100 230 C130 200 120 160 115 130 Z" />
      
      {/* Horizontal Petals */}
      <path d="M40 180 C10 170 20 235 100 240 C50 240 45 210 40 180 Z" />
      <path d="M160 180 C190 170 180 235 100 240 C150 240 155 210 160 180 Z" />
    </svg>
  );
}
