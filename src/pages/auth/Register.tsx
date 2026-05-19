import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import { Mail, Lock, User, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid spiritual channel (email)"),
  password: z.string().min(6, "Secret mantra must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Secret mantras do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { registerWithEmail, signInWithGoogle } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      await registerWithEmail(data.email, data.name, data.password);
      navigate("/profile");
    } catch (err: any) {
      // Errors handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
      navigate("/profile");
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-[#E1DAD3] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Line Art Background Pattern */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10 Q 30 10 30 30 T 50 50' stroke='%233C362F' fill='none' stroke-width='0.5'/%3E%3Ccircle cx='80' cy='20' r='1' fill='%233C362F'/%3E%3Cpath d='M70 80 Q 90 80 90 60' stroke='%233C362F' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '300px 300px'
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] bg-white p-10 md:p-12 rounded-[40px] shadow-sm text-center relative z-10"
      >
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-black mb-3">Join Dieudhoop</h1>
          <p className="text-stone-500 text-sm leading-relaxed max-w-[280px] mx-auto">
            Create your account to start your divine journey
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2 text-left">
            <input 
              {...register("name")}
              type="text" 
              placeholder="Full Name"
              className={`w-full bg-white border border-black p-4 rounded-xl outline-none focus:ring-1 focus:ring-black transition-all text-stone-600 placeholder:text-stone-400 text-sm`}
            />
            {errors.name && <p className="text-[10px] text-red-500 ml-2">{errors.name.message}</p>}
          </div>

          <div className="space-y-2 text-left">
            <input 
              {...register("email")}
              type="email" 
              placeholder="Email Address"
              className={`w-full bg-white border border-black p-4 rounded-xl outline-none focus:ring-1 focus:ring-black transition-all text-stone-600 placeholder:text-stone-400 text-sm`}
            />
            {errors.email && <p className="text-[10px] text-red-500 ml-2">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <input 
                {...register("password")}
                type={showPassword ? "text" : "password"} 
                placeholder="Passcode"
                className={`w-full bg-white border border-black p-4 rounded-xl outline-none focus:ring-1 focus:ring-black transition-all text-stone-600 placeholder:text-stone-400 text-sm`}
              />
              {errors.password && <p className="text-[10px] text-red-500 ml-2">{errors.password.message}</p>}
            </div>

            <div className="space-y-2 text-left">
              <input 
                {...register("confirmPassword")}
                type={showPassword ? "text" : "password"} 
                placeholder="Confirm"
                className={`w-full bg-white border border-black p-4 rounded-xl outline-none focus:ring-1 focus:ring-black transition-all text-stone-600 placeholder:text-stone-400 text-sm`}
              />
              {errors.confirmPassword && <p className="text-[10px] text-red-500 ml-2">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#3C362F] text-white py-4 rounded-xl font-bold text-sm transition-all hover:opacity-90 shadow-sm disabled:opacity-70 flex items-center justify-center mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-100"></div>
            </div>
            <span className="relative px-3 bg-white text-[10px] text-stone-400 font-medium whitespace-nowrap">
              — Or Sign up with —
            </span>
          </div>

          <button 
            type="button"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center space-x-3 border border-stone-100 py-3 rounded-xl hover:bg-stone-50 transition-all font-bold text-stone-700 text-xs mb-6"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            <span>Sign up with google</span>
          </button>

          <p className="text-xs text-stone-500">
            Already have an account? <Link to="/login" className="text-stone-800 hover:underline font-bold">Login Now</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
