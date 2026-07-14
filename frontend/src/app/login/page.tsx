"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  User, 
  ArrowRight, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  Activity,
  Layers,
  Zap
} from "lucide-react";
import { useRoleStore } from "@/stores/role-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useRoleStore();

  const [activeTab, setActiveTab] = React.useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Sign in fields
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Sign up fields
  const [name, setName] = React.useState("");
  const [registerEmail, setRegisterEmail] = React.useState("");
  const [registerPassword, setRegisterPassword] = React.useState("");
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully!");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !registerEmail || !registerPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (registerPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await register(name, registerEmail, registerPassword);
      toast.success(`Account successfully created for ${name}!`);
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-bg-secondary select-none overflow-x-hidden font-sans">
      <Toaster position="top-right" closeButton />

      {/* Split Grid */}
      <div className="grid w-full grid-cols-1 lg:grid-cols-2">
        
        {/* Left Column: Visual Banner */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-bg-soft">
          {/* Subtle gradient light background */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom_left,_var(--color-primary-light)_0%,_transparent_45%)] opacity-80"></div>
          
          {/* Image Cover */}
          <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply pointer-events-none">
            <img 
              src="/auth_banner.png" 
              alt="Visual Banner Background" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Logo & Header */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft-lg border border-primary-dark/10">
              <Sparkles className="h-6 w-6" strokeWidth={2.2} />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Flowspace</span>
          </div>

          {/* Banner Hero Copy */}
          <div className="relative z-10 my-auto max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="text-4xl xl:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                Elevate your team's engineering velocity.
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                Connect your database, manage sprints, and optimize task pipelines with an AI-assisted workspace designed exclusively for high-performing engineering organizations.
              </p>
            </motion.div>

            {/* Feature lists */}
            <div className="mt-10 space-y-4">
              {[
                { icon: Zap, title: "AI-Powered Workload Balancing", desc: "Automate sprint distributions based on developer capabilities and metrics." },
                { icon: Layers, title: "Structured Task Lifecycles", desc: "Track progress from backlog, to in-review, to complete with ease." },
                { icon: Activity, title: "Visual Velocity Insights", desc: "Access dynamic analytics detailing sprint progress and team delivery health." }
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface border border-border-soft shadow-soft text-primary-dark">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Testimonial Box */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="relative z-10 backdrop-blur-md bg-white/45 border border-white/40 p-6 rounded-2xl shadow-soft-lg flex items-center gap-4 max-w-md"
          >
            <div className="relative h-11 w-11 shrink-0 rounded-full bg-slate-200 overflow-hidden border-2 border-white">
              <div className="w-full h-full bg-gradient-to-tr from-lime-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold font-sans">
                SC
              </div>
            </div>
            <div>
              <p className="text-xs italic font-medium text-foreground leading-snug">
                "Flowspace transformed our engineering cadence. Sprints are automatically streamlined, and AI task reviews save hours of manual oversight."
              </p>
              <p className="text-[11px] font-bold text-muted-foreground mt-1.5 uppercase tracking-wider">
                Sarah Chen — VP of Engineering
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Forms Panel */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 relative bg-background">
          {/* Subtle gradient highlight */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,_var(--color-primary-light)_0%,_transparent_60%)] opacity-40 pointer-events-none z-0"></div>

          <div className="w-full max-w-md z-10 flex flex-col">
            
            {/* Header Mobile Brand */}
            <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft border border-primary-dark/10">
                <Sparkles className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">Flowspace</span>
            </div>

            {/* Form Card Header */}
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Get started today
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Access your engineering workspace or set up a new account.
              </p>
            </div>

            {/* Tabs Selector */}
            <div className="relative flex p-1 bg-bg-secondary rounded-xl border border-border-soft mb-6 w-full">
              <button 
                onClick={() => { setActiveTab("signin"); }}
                className={`relative flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "signin" 
                    ? "bg-surface shadow-soft text-foreground border border-border-soft/40" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setActiveTab("signup"); }}
                className={`relative flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "signup" 
                    ? "bg-surface shadow-soft text-foreground border border-border-soft/40" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form Body with Switch Animations */}
            <AnimatePresence mode="wait">
              {activeTab === "signin" ? (
                <motion.form 
                  key="signin-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-placeholder" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-10 border-border bg-surface shadow-inner/10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button 
                        type="button"
                        onClick={() => toast.info("Password recovery is disabled in this demo.")}
                        className="text-xs font-semibold text-primary-dark hover:underline"
                        tabIndex={-1}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-placeholder" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-10 border-border bg-surface"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4.5 w-4.5" />
                        ) : (
                          <Eye className="h-4.5 w-4.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-10 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-soft-lg flex items-center justify-center gap-2 mt-4 cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form 
                  key="signup-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegisterSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-placeholder" />
                      <Input
                        id="fullname"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-10 border-border bg-surface"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-placeholder" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="name@company.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="pl-10 h-10 border-border bg-surface"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-placeholder" />
                      <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 characters"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="pl-10 pr-10 h-10 border-border bg-surface"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4.5 w-4.5" />
                        ) : (
                          <Eye className="h-4.5 w-4.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    New accounts start as Staff. An admin can promote users after registration.
                  </p>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-10 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-soft-lg flex items-center justify-center gap-2 mt-4 cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>
    </div>
  );
}
