
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import type { RelativeData } from '@/types/childProfile';
import RelativeCard from '../RelativeCard';

type RelativesListProps = {
  relatives: RelativeData[];
  onAddRelative: () => void;
  onEditRelative: (relative: RelativeData) => void;
  onDeleteRelative: (id: string) => void;
};

const RelativesList: React.FC<RelativesListProps> = ({
  relatives,
  onAddRelative,
  onEditRelative,
  onDeleteRelative
}) => {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Proches ajoutés</h3>
        <Button 
          onClick={onAddRelative}
          className="bg-mcf-orange hover:bg-mcf-orange-dark text-white"
        >
          <Plus className="mr-1 h-4 w-4" /> Ajouter un proche
        </Button>
      </div>
      
      {relatives?.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <p>Aucun proche n'a encore été ajouté.</p>
            <p className="text-sm mt-2">Cliquez sur "Ajouter un proche" pour commencer.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {relatives?.map((relative) => (
            <RelativeCard
              key={relative.id}
              relative={relative}
              onEdit={onEditRelative}
              onDelete={onDeleteRelative}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RelativesList;
