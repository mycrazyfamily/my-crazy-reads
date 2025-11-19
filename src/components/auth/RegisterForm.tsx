
import React, { useState } from 'react';
import { Mail, Lock, UserPlus, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegisterFormProps {
  formData: {
    email: string;
    password: string;
    confirmPassword?: string;
  };
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  formData,
  isLoading,
  onInputChange,
  onSubmit
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-mcf-mint/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-mcf-secondary" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-bold text-mcf-primary">Créer un compte</h2>
        <p className="text-muted-foreground">
          Rejoignez l'aventure My Crazy Family
        </p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="register-email" className="text-mcf-primary font-semibold">Adresse email</Label>
          <div className="relative group">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-mcf-secondary transition-colors" />
            <Input 
              id="register-email" 
              name="email"
              type="email" 
              placeholder="votre@email.com" 
              className="pl-11 h-12 border-2 border-mcf-mint/30 focus:border-mcf-secondary transition-all"
              value={formData.email}
              onChange={onInputChange}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="register-password" className="text-mcf-primary font-semibold">Mot de passe</Label>
          <div className="relative group">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-mcf-secondary transition-colors" />
            <Input 
              id="register-password" 
              name="password"
              type={showPassword ? "text" : "password"}
              className="pl-11 pr-11 h-12 border-2 border-mcf-mint/30 focus:border-mcf-secondary transition-all"
              value={formData.password}
              onChange={onInputChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-mcf-secondary transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-mcf-primary font-semibold">Confirmer le mot de passe</Label>
          <div className="relative group">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-mcf-secondary transition-colors" />
            <Input 
              id="confirm-password" 
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              className="pl-11 pr-11 h-12 border-2 border-mcf-mint/30 focus:border-mcf-secondary transition-all"
              value={formData.confirmPassword}
              onChange={onInputChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-mcf-secondary transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-mcf-primary hover:bg-mcf-primary/90 h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? "Création en cours..." : "Créer mon compte"}
          <Sparkles className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};
