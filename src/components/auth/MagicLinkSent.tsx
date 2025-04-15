
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MagicLinkSentProps {
  email: string;
  onBack: () => void;
}

export const MagicLinkSent: React.FC<MagicLinkSentProps> = ({ email, onBack }) => {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Lien de connexion envoyé !</CardTitle>
        <CardDescription className="text-center">
          Vérifiez votre boîte de réception
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4">
          Nous avons envoyé un lien magique de connexion à <strong>{email}</strong>. 
          Cliquez sur ce lien pour vous connecter automatiquement.
        </p>
        <Button onClick={onBack} variant="outline">
          Retour
        </Button>
      </CardContent>
    </Card>
  );
};
