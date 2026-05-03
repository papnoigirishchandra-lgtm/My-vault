import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "Accessing your private vault." });
        setLocation("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setShowConfirmation(true);
        toast({ 
          title: "Account created!", 
          description: "Please check your email to confirm your account." 
        });
      }
    } catch (error: any) {
      toast({ title: "Authentication error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px] opacity-60" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10 text-center"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white p-10 rounded-[32px] shadow-2xl shadow-indigo-200/50">
            <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Mail className="h-10 w-10 text-indigo-600 animate-bounce" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Check your email</h1>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              We've sent a confirmation link to <span className="text-indigo-600 font-bold">{email}</span>. Please click the link to verify your account and start using your vault.
            </p>
            <Button 
              onClick={() => setShowConfirmation(false)}
              variant="outline"
              className="w-full h-12 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
            >
              Back to Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px] opacity-60" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-white p-10 rounded-[32px] shadow-2xl shadow-indigo-200/50">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="h-14 w-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6 transform -rotate-3">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Private Vault</h1>
            <p className="text-slate-500 text-sm font-medium">Secure access to your professional assets</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-11 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:bg-white focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-11 rounded-2xl border-slate-200 bg-slate-50/50 focus-visible:bg-white focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 rounded-2xl gradient-button text-sm font-bold text-white shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Enter Vault" : "Create Account"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center">
            <button 
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
