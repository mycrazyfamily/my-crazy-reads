
import React from 'react';
import { Mail, Lock, UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          Rejoignez l'aventure My Crazy Family
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="register-email">Adresse email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                id="register-email" 
                name="email"
                type="email" 
                placeholder="votre@email.com" 
                className="pl-10"
                value={formData.email}
                onChange={onInputChange}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                id="register-password" 
                name="password"
                type="password" 
                className="pl-10"
                value={formData.password}
                onChange={onInputChange}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                id="confirm-password" 
                name="confirmPassword"
                type="password" 
                className="pl-10"
                value={formData.confirmPassword}
                onChange={onInputChange}
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-mcf-orange hover:bg-mcf-orange-dark"
            disabled={isLoading}
          >
            {isLoading ? "Création en cours..." : "Créer mon compte"}
            <UserPlus className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
