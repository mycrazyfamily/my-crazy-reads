
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import type { RelativeData } from '@/types/childProfile';
import RelativeCard from '../RelativeCard';

type RelativesListProps = {
  relatives: RelativeData[];
  onEditRelative: (relative: RelativeData) => void;
  onDeleteRelative: (id: string) => void;
};

const RelativesList: React.FC<RelativesListProps> = ({
  relatives,
  onEditRelative,
  onDeleteRelative
}) => {
  return (
    <div className="mt-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Proches ajoutés</h3>
        <p className="text-sm text-gray-500">
          Pour ajouter un proche, cliquez sur un type ci-dessus
        </p>
      </div>
      
      {relatives?.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <p>Aucun proche n'a encore été ajouté.</p>
            <p className="text-sm mt-2">Choisissez un type de proche ci-dessus pour commencer.</p>
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
