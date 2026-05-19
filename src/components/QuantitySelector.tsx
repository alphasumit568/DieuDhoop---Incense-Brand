import React from "react";
import { motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { cn } from "../lib/utils";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  max?: number;
  className?: string;
}

export default function QuantitySelector({ quantity, onChange, max, className }: QuantitySelectorProps) {
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (max === undefined || quantity < max) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className={cn("flex items-center border border-brand-sand w-fit rounded-full px-2 py-1 bg-white/50", className)}>
      <motion.button 
        whileTap={{ scale: 0.8 }}
        onClick={handleDecrement} 
        disabled={quantity <= 1}
        className="p-2 hover:text-brand-gold disabled:opacity-30 transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </motion.button>
      
      <span className="w-10 text-center font-bold text-sm tabular-nums">
        {quantity}
      </span>
      
      <motion.button 
        whileTap={{ scale: 0.8 }}
        onClick={handleIncrement} 
        disabled={max !== undefined && quantity >= max}
        className="p-2 hover:text-brand-gold disabled:opacity-30 transition-colors"
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </motion.button>
    </div>
  );
}
