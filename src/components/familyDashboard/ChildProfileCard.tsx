
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, UserPlus } from 'lucide-react';

type ChildProfileProps = {
  child: {
    id: string;
    firstName: string;
    age: string;
    avatar: string | null;
    personalityEmoji: string;
    relatives: number;
    hasToys: boolean;
    hasPets: number;
  };
};

const ChildProfileCard: React.FC<ChildProfileProps> = ({ child }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="overflow-hidden hover-scale transition-all border-mcf-amber/30 shadow-md hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-mcf-amber/20 to-mcf-beige p-4 flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-white shadow-md">
          {child.avatar ? (
            <AvatarImage src={child.avatar} alt={child.firstName} />
          ) : (
            <AvatarFallback className="bg-mcf-orange text-white text-xl">
              {child.firstName.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h3 className="text-xl font-bold text-mcf-orange-dark flex items-center gap-2">
            {child.firstName} <span className="text-2xl">{child.personalityEmoji}</span>
          </h3>
          <p className="text-gray-600">{child.age} ans</p>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-mcf-amber/10 p-2 rounded-md">
              <p className="text-sm text-gray-600">Proches</p>
              <p className="font-bold text-mcf-orange-dark">{child.relatives}</p>
            </div>
            <div className="bg-mcf-amber/10 p-2 rounded-md">
              <p className="text-sm text-gray-600">Doudou</p>
              <p className="font-bold text-mcf-orange-dark">{child.hasToys ? '✓' : '✗'}</p>
            </div>
            <div className="bg-mcf-amber/10 p-2 rounded-md">
              <p className="text-sm text-gray-600">Animaux</p>
              <p className="font-bold text-mcf-orange-dark">{child.hasPets}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            className="border-mcf-amber text-mcf-orange-dark hover:bg-mcf-amber/10 gap-2 w-full"
            onClick={() => navigate(`/modifier-profil/${child.id}`)}
          >
            <Edit className="h-4 w-4" /> Modifier ce profil
          </Button>
          <Button
            variant="outline"
            className="border-mcf-amber text-mcf-orange-dark hover:bg-mcf-amber/10 gap-2 w-full"
            onClick={() => navigate(`/ajouter-proche/${child.id}`)}
          >
            <UserPlus className="h-4 w-4" /> Ajouter un proche
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildProfileCard;
