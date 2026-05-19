import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronRight, ChevronLeft, Sparkles, ShoppingBag, Info, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: () => void;
  actionText?: string;
  path?: string;
}

export default function OnboardingWalkthrough() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps: OnboardingStep[] = [
    {
      title: "Namaste, Seeker",
      description: "Welcome to your sanctuary of sacred fragrances. Let us guide you through your spiritual journey with Vedic Vaani.",
      icon: <Sparkles className="w-12 h-12 text-brand-gold" />,
    },
    {
      title: "Explore the Collection",
      description: "Browse our hand-picked selection of premium Agarbatti, Dhoop, and sacred essentials crafted for your daily rituals.",
      icon: <ShoppingBag className="w-12 h-12 text-brand-gold" />,
      actionText: "Visit Shop",
      path: "/shop"
    },
    {
      title: "Know Thy Aroma",
      description: "Every fragrance has a story. Dive deep into product details to understand the Vedic benefits and ingredients of each vessel.",
      icon: <Info className="w-12 h-12 text-brand-gold" />,
    },
    {
      title: "Sacred Subscriptions",
      description: "Maintain your consistency of peace. Subscribe to regular deliveries and never run out of your favorite sacred scents.",
      icon: <Zap className="w-12 h-12 text-brand-gold" />,
      actionText: "View Plans",
      path: "/subscriptions"
    }
  ];

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("vedic_onboarding_seen");
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      if (steps[currentStep + 1].path) {
        navigate(steps[currentStep + 1].path!);
      }
    } else {
      closeOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      if (steps[currentStep - 1].path) {
        navigate(steps[currentStep - 1].path!);
      }
    }
  };

  const closeOnboarding = () => {
    setIsOpen(false);
    localStorage.setItem("vedic_onboarding_seen", "true");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-brand-stone/40 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white max-w-lg w-full rounded-sm shadow-2xl overflow-hidden relative"
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-cream">
            <motion.div 
              className="h-full bg-brand-gold"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <button 
            onClick={closeOnboarding}
            className="absolute top-4 right-4 text-stone-300 hover:text-brand-stone transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="p-12 flex flex-col items-center text-center">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-center">
                <div className="bg-brand-cream/50 p-6 rounded-full inline-block relative">
                   <motion.div 
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="absolute inset-0 bg-brand-gold/10 rounded-full blur-xl"
                  />
                  {steps[currentStep].icon}
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-serif text-brand-stone mb-4">{steps[currentStep].title}</h2>
                <p className="text-stone-500 leading-relaxed font-sans text-sm">
                  {steps[currentStep].description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-brand-sand/30">
                <button 
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={cn(
                    "flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
                    currentStep === 0 ? "text-stone-200" : "text-stone-400 hover:text-brand-stone"
                  )}
                >
                  <ChevronLeft size={14} />
                  <span>Retreat</span>
                </button>

                <div className="flex space-x-1.5">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-300",
                        currentStep === i ? "bg-brand-gold w-4" : "bg-brand-cream"
                      )}
                    />
                  ))}
                </div>

                <button 
                  onClick={handleNext}
                  className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-stone transition-colors"
                >
                  <span>{currentStep === steps.length - 1 ? "Begin Ritual" : "Ascend"}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
