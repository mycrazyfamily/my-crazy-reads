
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

type ProfileFormProps = {
  onSubmit: (firstName: string, role: string, familyId: string) => Promise<any>;
  isLoading: boolean;
};

export const ProfileForm = ({ onSubmit, isLoading }: ProfileFormProps) => {
  const [firstName, setFirstName] = useState('');
  const [role, setRole] = useState('');
  const [familyId, setFamilyId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim()) {
      toast.error('Le prénom est requis');
      return;
    }
    
    if (!role.trim()) {
      toast.error('Le rôle est requis');
      return;
    }
    
    if (!familyId.trim()) {
      // Générer un UUID aléatoire pour l'ID de famille
      const newFamilyId = uuidv4();
      setFamilyId(newFamilyId);
      
      await onSubmit(firstName, role, newFamilyId);
    } else {
      await onSubmit(firstName, role, familyId);
    }
  };

  const generateRandomFamilyId = () => {
    setFamilyId(uuidv4());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un profil utilisateur</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input 
              id="firstName" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              placeholder="Entrez votre prénom"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Input 
              id="role" 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              placeholder="Exemple: parent, admin, etc."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="familyId">ID Famille (optionnel)</Label>
            <div className="flex gap-2">
              <Input 
                id="familyId" 
                value={familyId} 
                onChange={(e) => setFamilyId(e.target.value)} 
                placeholder="UUID de la famille"
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={generateRandomFamilyId}
                className="whitespace-nowrap"
              >
                Générer
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Laissez vide pour générer automatiquement un nouvel ID de famille, ou entrez un ID existant pour rejoindre une famille.
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-mcf-orange hover:bg-mcf-orange-dark"
            disabled={isLoading}
          >
            {isLoading ? 'Création...' : 'Créer profil'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
