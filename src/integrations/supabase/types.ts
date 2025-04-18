export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      challenges: {
        Row: {
          created_at: string | null
          emoji: string | null
          id: string
          label: string
        }
        Insert: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label: string
        }
        Update: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      child_challenges: {
        Row: {
          challenge_id: string | null
          child_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          challenge_id?: string | null
          child_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          challenge_id?: string | null
          child_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_challenges_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      child_comforters: {
        Row: {
          appearance: string | null
          child_id: string
          comforter_id: string | null
          created_at: string | null
          id: string
          name: string | null
          relation_label: string | null
          roles: string | null
        }
        Insert: {
          appearance?: string | null
          child_id: string
          comforter_id?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          relation_label?: string | null
          roles?: string | null
        }
        Update: {
          appearance?: string | null
          child_id?: string
          comforter_id?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          relation_label?: string | null
          roles?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_comforters_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_comforters_comforter_id_fkey"
            columns: ["comforter_id"]
            isOneToOne: false
            referencedRelation: "comforters"
            referencedColumns: ["id"]
          },
        ]
      }
      child_discoveries: {
        Row: {
          child_id: string
          created_at: string | null
          discovery_id: string | null
          id: string
        }
        Insert: {
          child_id: string
          created_at?: string | null
          discovery_id?: string | null
          id?: string
        }
        Update: {
          child_id?: string
          created_at?: string | null
          discovery_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_discoveries_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_discoveries_discovery_id_fkey"
            columns: ["discovery_id"]
            isOneToOne: false
            referencedRelation: "discoveries"
            referencedColumns: ["id"]
          },
        ]
      }
      child_family_members: {
        Row: {
          child_id: string
          created_at: string | null
          family_member_id: string | null
          id: string
          relation_label: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          family_member_id?: string | null
          id?: string
          relation_label?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          family_member_id?: string | null
          id?: string
          relation_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_family_members_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_family_members_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      child_passions: {
        Row: {
          child_id: string
          created_at: string | null
          id: string
          passion_id: string | null
        }
        Insert: {
          child_id?: string
          created_at?: string | null
          id?: string
          passion_id?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          id?: string
          passion_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_passions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_passions_passion_id_fkey"
            columns: ["passion_id"]
            isOneToOne: false
            referencedRelation: "passions"
            referencedColumns: ["id"]
          },
        ]
      }
      child_pets: {
        Row: {
          child_id: string | null
          created_at: string | null
          id: string
          name: string | null
          pet_id: string | null
          relation_label: string | null
          traits: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          pet_id?: string | null
          relation_label?: string | null
          traits?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          pet_id?: string | null
          relation_label?: string | null
          traits?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_pets_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_pets_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      child_profiles: {
        Row: {
          appearance: Json | null
          birth_date: string | null
          created_at: string | null
          family_id: string | null
          first_name: string | null
          gender: string | null
          has_pet: boolean | null
          height: string | null
          id: string
          nickname: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          appearance?: Json | null
          birth_date?: string | null
          created_at?: string | null
          family_id?: string | null
          first_name?: string | null
          gender?: string | null
          has_pet?: boolean | null
          height?: string | null
          id?: string
          nickname?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          appearance?: Json | null
          birth_date?: string | null
          created_at?: string | null
          family_id?: string | null
          first_name?: string | null
          gender?: string | null
          has_pet?: boolean | null
          height?: string | null
          id?: string
          nickname?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_profiles_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      child_traits: {
        Row: {
          child_id: string
          created_at: string | null
          id: string
          trait_id: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          id?: string
          trait_id?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          id?: string
          trait_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_traits_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_traits_trait_id_fkey"
            columns: ["trait_id"]
            isOneToOne: false
            referencedRelation: "traits"
            referencedColumns: ["id"]
          },
        ]
      }
      child_universes: {
        Row: {
          child_id: string
          created_at: string | null
          id: string
          universe_id: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          id?: string
          universe_id?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          id?: string
          universe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_universes_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_universes_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
        ]
      }
      comforters: {
        Row: {
          created_at: string | null
          emoji: string | null
          id: string
          label: string | null
        }
        Insert: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label?: string | null
        }
        Update: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label?: string | null
        }
        Relationships: []
      }
      discoveries: {
        Row: {
          created_at: string | null
          emoji: string | null
          id: string
          label: string
        }
        Insert: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label: string
        }
        Update: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      families: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          avatar: string | null
          child_id: string | null
          created_at: string | null
          family_id: string | null
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          avatar?: string | null
          child_id?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string
          name?: string | null
          role?: string | null
        }
        Update: {
          avatar?: string | null
          child_id?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      passions: {
        Row: {
          created_at: string | null
          emoji: string | null
          id: string
          label: string
        }
        Insert: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label: string
        }
        Update: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      pets: {
        Row: {
          created_at: string | null
          emoji: string | null
          family_id: string | null
          id: string
          name: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          emoji?: string | null
          family_id?: string | null
          id?: string
          name: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          emoji?: string | null
          family_id?: string | null
          id?: string
          name?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      traits: {
        Row: {
          created_at: string | null
          emoji: string | null
          id: string
          label: string
        }
        Insert: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label: string
        }
        Update: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      universes: {
        Row: {
          created_at: string | null
          emoji: string | null
          id: string
          label: string
        }
        Insert: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label: string
        }
        Update: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          family_id: string | null
          first_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          family_id?: string | null
          first_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          family_id?: string | null
          first_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
