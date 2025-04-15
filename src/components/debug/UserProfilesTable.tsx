
import React, { useState } from 'react';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export type UserProfile = {
  id: string;
  first_name: string | null;
  created_at: string;
  family_id: string | null;
  role: string | null;
}

type UserProfilesTableProps = {
  userProfiles: UserProfile[];
  onUpdate?: (id: string, firstName: string, role: string) => Promise<any>;
  onDelete?: (id: string) => Promise<boolean>;
  currentUserId?: string;
}

export const UserProfilesTable = ({ 
  userProfiles, 
  onUpdate, 
  onDelete,
  currentUserId 
}: UserProfilesTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ firstName: string, role: string }>({
    firstName: '',
    role: ''
  });

  if (userProfiles.length === 0) return null;
  
  const startEditing = (profile: UserProfile) => {
    setEditingId(profile.id);
    setEditForm({
      firstName: profile.first_name || '',
      role: profile.role || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id: string) => {
    if (!onUpdate) {
      toast.error("Fonctionnalité de mise à jour non disponible");
      return;
    }

    const result = await onUpdate(id, editForm.firstName, editForm.role);
    if (result) {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDelete) {
      toast.error("Fonctionnalité de suppression non disponible");
      return;
    }

    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce profil ?")) {
      await onDelete(id);
    }
  };

  return (
    <div>
      <h3 className="font-medium mb-2">Résultats :</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>ID Famille</TableHead>
              <TableHead>Date création</TableHead>
              {(onUpdate || onDelete) && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {userProfiles.map((profile) => (
              <TableRow key={profile.id} className={profile.id === currentUserId ? "bg-amber-50" : ""}>
                <TableCell className="font-mono">{profile.id}</TableCell>
                <TableCell>
                  {editingId === profile.id ? (
                    <Input 
                      value={editForm.firstName} 
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                      className="w-full"
                    />
                  ) : (
                    profile.first_name || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingId === profile.id ? (
                    <Input 
                      value={editForm.role} 
                      onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                      className="w-full"
                    />
                  ) : (
                    profile.role || '-'
                  )}
                </TableCell>
                <TableCell className="font-mono">{profile.family_id || '-'}</TableCell>
                <TableCell>{new Date(profile.created_at).toLocaleString()}</TableCell>
                {(onUpdate || onDelete) && (
                  <TableCell>
                    <div className="flex space-x-2">
                      {editingId === profile.id ? (
                        <>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            onClick={() => handleUpdate(profile.id)}
                            className="h-8 w-8 text-green-600"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            onClick={cancelEditing}
                            className="h-8 w-8 text-red-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          {onUpdate && (
                            <Button 
                              size="icon" 
                              variant="outline" 
                              onClick={() => startEditing(profile)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button 
                              size="icon" 
                              variant="outline" 
                              onClick={() => handleDelete(profile.id)}
                              className="h-8 w-8 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
