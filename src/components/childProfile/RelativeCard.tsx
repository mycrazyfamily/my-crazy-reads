
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash } from "lucide-react";
import { RELATIVE_TYPE_OPTIONS } from '@/constants/childProfileOptions';
import type { RelativeData, RelativeType } from '@/types/childProfile';

type RelativeCardProps = {
  relative: RelativeData;
  onEdit: (relative: RelativeData) => void;
  onDelete: (id: string) => void;
};

const RelativeCard: React.FC<RelativeCardProps> = ({
  relative,
  onEdit,
  onDelete
}) => {
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getHairColorForAvatar = (hairColor: string) => {
    switch(hairColor) {
      case "blonde": return "bg-yellow-300";
      case "chestnut": return "bg-amber-700";
      case "brown": return "bg-amber-950";
      case "red": return "bg-orange-600";
      case "black": return "bg-gray-900";
      default: return "bg-amber-700";
    }
  };

  const getSkinColorForAvatar = (skinColor: string) => {
    switch(skinColor) {
      case "light": return "text-rose-100";
      case "medium": return "text-amber-300";
      case "dark": return "text-amber-800";
      default: return "text-rose-100";
    }
  };

  const getRelativeTypeLabel = (type: RelativeType) => {
    const option = RELATIVE_TYPE_OPTIONS.find(opt => opt.value === type);
    return option ? option.label : "Autre";
  };

  const getRelativeTypeIcon = (type: RelativeType) => {
    const option = RELATIVE_TYPE_OPTIONS.find(opt => opt.value === type);
    return option ? option.icon : "👤";
  };
  
  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-16 h-16 mb-2 bg-mcf-amber/20">
            <AvatarFallback className="text-3xl bg-transparent">
              {getRelativeTypeIcon(relative.type)}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="font-bold text-lg">{relative.firstName}</h3>
          
          <p className="text-sm text-gray-500 mb-1">
            {relative.type === 'other' && relative.otherTypeName 
              ? relative.otherTypeName 
              : getRelativeTypeLabel(relative.type)}
          </p>
          
          <div className="flex gap-2 mt-3">
            <Button 
              size="sm" 
              variant="outline" 
              className="p-2 h-8 w-8"
              onClick={() => onEdit(relative)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Modifier</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="p-2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(relative.id)}
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Supprimer</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelativeCard;
