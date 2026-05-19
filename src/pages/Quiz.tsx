import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getFragranceRecommendation } from "../services/aiService";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";

const QUESTIONS = [
  {
    id: "mood",
    question: "What mood are you seeking today?",
    options: ["Deep Meditation", "Stress Relief", "Uplifting Joy", "Romantic Ambiance"]
  },
  {
    id: "setting",
    question: "Where will you burn this incense?",
    options: ["Open Living Space", "Small Sacred Corner", "Work Studio", "Outdoor Patio"]
  },
  {
    id: "preference",
    question: "Which scent family do you naturally gravitate towards?",
    options: ["Earthy & Woody", "Floral & Gentle", "Spiced & Golden", "Fresh & Clean"]
  }
];

export default function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleOption = (option: string) => {
    const q = QUESTIONS[step];
    const newAnswers = { ...answers, [q.question]: option };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: Record<string, string>) => {
    setLoading(true);
    const recommendation = await getFragranceRecommendation(finalAnswers);
    setResult(recommendation);
    setLoading(false);
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="min-h-screen py-20 px-4 flex items-center justify-center bg-brand-cream/30">
      <div className="max-w-2xl w-full">
        {!result && !loading && (
          <div className="text-center mb-12">
            <span className="text-brand-gold font-bold tracking-widest text-[10px] uppercase mb-4 block">AI Powered Finder</span>
            <h1 className="text-4xl md:text-6xl font-serif">Discover Your Soul Scent.</h1>
            <div className="mt-4 flex justify-center space-x-2">
              {QUESTIONS.map((_, i) => (
                <div key={i} className={`h-1 w-8 rounded-full ${i <= step ? "bg-brand-gold" : "bg-stone-300"}`} />
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center space-y-8"
            >
              <div className="relative inline-block">
                <Sparkles className="w-12 h-12 text-brand-gold animate-pulse" />
                <div className="absolute inset-0 border-2 border-brand-gold rounded-full animate-ping opacity-20" />
              </div>
              <p className="text-xl font-serif italic text-stone-600">Summoning divine aromas for you...</p>
            </motion.div>
          ) : result ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-10 md:p-16 rounded-3xl shadow-2xl border border-brand-sand relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <Sparkles className="text-brand-gold/20 w-32 h-32" />
              </div>
              <span className="text-brand-gold font-bold tracking-widest text-xs uppercase mb-4 block">Your Divine Match</span>
              <h2 className="text-5xl font-serif mb-6 text-stone-800">{result.name}</h2>
              <div className="space-y-8 relative z-10">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-2">The Vibe</h4>
                  <p className="text-lg text-stone-600 font-serif leading-relaxed italic">"{result.reason}"</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-2">Spiritual Benefits</h4>
                  <p className="text-stone-700 leading-relaxed">{result.benefits}</p>
                </div>
                <div className="pt-8 flex space-x-4">
                  <button 
                    onClick={() => navigate("/shop")}
                    className="flex-grow bg-stone-800 text-brand-beige py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-2 hover:bg-black transition-all"
                  >
                    <span>Shop Choice</span>
                    <ArrowRight size={14} />
                  </button>
                  <button onClick={reset} className="p-4 rounded-full border border-stone-200 text-stone-400 hover:text-stone-800 transition-colors">
                    <RotateCcw size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white p-10 md:p-16 rounded-3xl shadow-xl border border-brand-sand"
            >
              <h2 className="text-3xl md:text-4xl font-serif text-center mb-12 text-stone-800">{QUESTIONS[step].question}</h2>
              <div className="grid grid-cols-1 gap-4">
                {QUESTIONS[step].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOption(opt)}
                    className="w-full text-left px-8 py-5 rounded-2xl border-2 border-stone-100 hover:border-brand-gold hover:bg-brand-cream/50 transition-all group flex justify-between items-center"
                  >
                    <span className="text-lg text-stone-700 group-hover:text-stone-900 transition-colors">{opt}</span>
                    <ArrowRight size={16} className="text-stone-300 group-hover:text-brand-gold transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
