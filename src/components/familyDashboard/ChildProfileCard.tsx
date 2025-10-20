
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ShoppingBag, Edit, Users, Palette, Cat, Dog, PlusSquare, Gamepad2 } from 'lucide-react';

interface Child {
  id: string;
  firstName: string;
  age: string;
  avatar: string | null;
  personalityEmoji: string;
  relatives?: any[];
  toysCount?: number;
  preferencesCount?: number;
  hasPets?: number;
}

interface ChildProfileCardProps {
  child: Child;
}

const ChildProfileCard: React.FC<ChildProfileCardProps> = ({ child }) => {
  return (
    <Card className="overflow-hidden border-mcf-mint animate-fade-in">
      <CardHeader className="bg-gradient-to-br from-mcf-amber/20 to-transparent p-4 flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-mcf-orange">
          <AvatarImage src={child.avatar || undefined} alt={child.firstName} />
          <AvatarFallback className="text-2xl bg-mcf-orange/20 text-mcf-orange-dark">
            {child.personalityEmoji || child.firstName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-bold text-mcf-orange-dark">{child.firstName}</h3>
          <p className="text-gray-600">{child.age}</p>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {child.relatives && child.relatives.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-mcf-orange" />
              <span>{child.relatives.length} proche{child.relatives.length > 1 ? 's' : ''}</span>
            </div>
          )}
          
          {child.hasPets !== undefined && child.hasPets > 0 && (
            <div className="flex items-center gap-2">
              {child.hasPets > 1 ? (
                <Cat className="h-4 w-4 text-mcf-orange" />
              ) : (
                <Dog className="h-4 w-4 text-mcf-orange" />
              )}
              <span>{child.hasPets} anim{child.hasPets > 1 ? 'aux' : 'al'}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4 text-mcf-orange" />
            <span>Jouets préférés {child.toysCount !== undefined ? child.toysCount : 0}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-mcf-orange" />
            <span>Préférences {child.preferencesCount !== undefined ? child.preferencesCount : 0}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="grid grid-cols-2 gap-2 p-4 pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 w-full border-mcf-primary text-mcf-primary hover:bg-mcf-primary/10"
          asChild
        >
          <Link to={`/creer-profil-enfant?edit=${child.id}`}>
            <Edit className="h-3.5 w-3.5" />
            <span>Modifier</span>
          </Link>
        </Button>
        
        <Button 
          size="sm" 
          className="flex items-center gap-1 w-full bg-mcf-orange hover:bg-mcf-orange-dark text-white"
          asChild
        >
          <Link to={`/offrir/theme?child=${child.id}`}>
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Commander</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChildProfileCard;
