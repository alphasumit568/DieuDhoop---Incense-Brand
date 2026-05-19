import { useState } from "react";
import { motion } from "motion/react";
import { Check, Zap, Crown, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

const SUBSCRIPTION_PLANS = [
  {
    id: "monthly_ritual",
    name: "Monthly Ritual",
    price: 999,
    interval: "month",
    description: "Perfect for daily spiritual practitioners.",
    features: [
      "2 Assorted Premium Packs (30 sticks each)",
      "1 Handcrafted Incense Holder (First Month)",
      "Free Divine Shipping",
      "Cancel Anytime",
      "Exclusive Vedic Wisdom Newsletter"
    ],
    icon: <Calendar className="w-6 h-6 text-brand-gold" />,
    popular: false
  },
  {
    id: "divine_quarterly",
    name: "Divine Quarterly",
    price: 2499,
    interval: "3 months",
    description: "Our most popular choice for consistent peace.",
    features: [
      "8 Assorted Premium Packs (Total 240 sticks)",
      "Premium Brass Incense Burner (First Box)",
      "15% Savings compared to monthly",
      "Priority Shipping",
      "Early Access to Limited Editions",
      "Complimentary Sample of New Fragrances"
    ],
    icon: <Zap className="w-6 h-6 text-brand-gold" />,
    popular: true
  },
  {
    id: "royal_annual",
    name: "Royal Annual",
    price: 8999,
    interval: "year",
    description: "The ultimate spiritual commitment.",
    features: [
      "32 Assorted Premium Packs (Total 960 sticks)",
      "Luxury Artisanal Ritual Set (First Box)",
      "25% Massive Savings",
      "Dedicated Concierge Support",
      "VIP Access to Vedic Workshops",
      "Personalized Fragrance Blending Service"
    ],
    icon: <Crown className="w-6 h-6 text-brand-gold" />,
    popular: false
  }
];

export default function Subscriptions() {
  const { user, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      await signInWithGoogle();
      return;
    }

    setLoading(planId);

    // Simulate Razorpay Subscription
    try {
      // In a real app, you would call your backend to create a Razorpay subscription
      // and then open the Razorpay checkout.
      // For this demo, we'll simulate success and save to Firestore.
      
      const subData = {
        userId: user.uid,
        planId: planId,
        status: "active",
        startDate: serverTimestamp(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next month
        razorpaySubscriptionId: `sub_sim_${Math.random().toString(36).slice(2)}`,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "userSubscriptions"), subData);
      
      // Navigate to profile to see active sub
      navigate("/profile?tab=subscriptions");
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-20 px-6 max-w-7xl mx-auto"
    >
      <div className="text-center max-w-2xl mx-auto mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-2 mb-4"
        >
          <div className="h-[1px] w-8 bg-brand-saffron"></div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-saffron">Divine Membership</span>
          <div className="h-[1px] w-8 bg-brand-saffron"></div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-serif text-brand-stone mb-6"
        >
          Sacred <span className="italic text-brand-gold">Subscriptions</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-brand-stone-light font-light leading-relaxed"
        >
          Never run out of peace. Subscribe to our regular incense delivery plans and save while maintaining your daily spiritual rituals.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {SUBSCRIPTION_PLANS.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={cn(
              "relative bg-white border rounded-sm p-10 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2",
              plan.popular ? "border-brand-gold border-2 scale-105 z-10" : "border-brand-border"
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-gold text-white px-4 py-1 text-[9px] font-bold uppercase tracking-[0.2em] rounded-full">
                Most Chosen
              </div>
            )}

            <div className="bg-brand-beige p-4 rounded-full mb-8">
              {plan.icon}
            </div>

            <h3 className="text-xl font-serif text-brand-stone mb-2">{plan.name}</h3>
            <p className="text-xs text-brand-stone-light mb-6 min-h-[40px]">{plan.description}</p>

            <div className="flex items-baseline mb-8">
              <span className="text-4xl font-serif text-brand-stone">₹{plan.price}</span>
              <span className="text-xs text-brand-stone/40 ml-2 uppercase tracking-widest font-bold">/ {plan.interval}</span>
            </div>

            <div className="w-full space-y-4 mb-10 text-left">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Check size={14} className="text-brand-gold mt-1 shrink-0" />
                  <span className="text-xs text-brand-stone-light leading-snug">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading !== null}
              className={cn(
                "w-full py-4 rounded-sm text-[10px] uppercase tracking-[0.2em] font-bold transition-all border",
                plan.popular 
                  ? "bg-brand-gold text-white hover:brightness-110 shadow-lg border-white/20" 
                  : "bg-brand-stone text-brand-beige hover:brightness-125 border-white/10"
              )}
            >
              {loading === plan.id ? "Processing..." : "Ascend to Plan"}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="mt-24 border-t border-brand-border pt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        <TrustBadge 
          title="Safe Passage" 
          desc="Encrypted Payments" 
        />
        <TrustBadge 
          title="Vedic Quality" 
          desc="100% Pure Essential Oils" 
        />
        <TrustBadge 
          title="Flexible Ritual" 
          desc="Cancel Anytime" 
        />
        <TrustBadge 
          title="Divine Support" 
          desc="24/7 Spiritual Guidance" 
        />
      </div>
    </motion.div>
  );
}

function TrustBadge({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="text-center group">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-stone group-hover:text-brand-gold transition-colors">{title}</h4>
      <p className="text-[9px] text-brand-stone/40 uppercase tracking-widest mt-1">{desc}</p>
    </div>
  );
}
