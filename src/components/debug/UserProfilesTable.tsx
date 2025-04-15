
import React from 'react';

export type UserProfile = {
  id: string;
  first_name: string | null;
  created_at: string;
  family_id: string | null;
  role: string | null;
}

type UserProfilesTableProps = {
  userProfiles: UserProfile[];
}

export const UserProfilesTable = ({ userProfiles }: UserProfilesTableProps) => {
  if (userProfiles.length === 0) return null;
  
  return (
    <div>
      <h3 className="font-medium mb-2">Résultats :</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Famille</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date création</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userProfiles.map((profile) => (
              <tr key={profile.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{profile.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{profile.first_name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{profile.role || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{profile.family_id || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(profile.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
