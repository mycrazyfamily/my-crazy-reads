export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      book_requests: {
        Row: {
          child_id: string | null
          created_at: string | null
          created_by: string | null
          family_id: string | null
          id: string
          is_active: boolean | null
          message: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          created_by?: string | null
          family_id?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          created_by?: string | null
          family_id?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_requests_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_requests_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      book_themes: {
        Row: {
          book_id: string | null
          created_at: string | null
          id: string
          theme_id: string | null
          updated_at: string | null
        }
        Insert: {
          book_id?: string | null
          created_at?: string | null
          id?: string
          theme_id?: string | null
          updated_at?: string | null
        }
        Update: {
          book_id?: string | null
          created_at?: string | null
          id?: string
          theme_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_themes_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          cover_url: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          status: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          status?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          status?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
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
          created_by: string | null
          emoji: string | null
          id: string
          is_active: boolean | null
          label: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      discoveries: {
        Row: {
          created_at: string | null
          created_by: string | null
          emoji: string | null
          id: string
          is_active: boolean | null
          label: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      drafts: {
        Row: {
          created_at: string | null
          created_by: string | null
          data: Json
          id: string
          is_visible: boolean | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data: Json
          id?: string
          is_visible?: boolean | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data?: Json
          id?: string
          is_visible?: boolean | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          child_id: string | null
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          emoji: string | null
          id: string
          is_visible: boolean | null
          label: string
          updated_at: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          emoji?: string | null
          id?: string
          is_visible?: boolean | null
          label: string
          updated_at?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          emoji?: string | null
          id?: string
          is_visible?: boolean | null
          label?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      family_members: {
        Row: {
          avatar: string | null
          created_at: string | null
          family_id: string | null
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string
          name?: string | null
          role?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_orders: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          book_id: string | null
          created_at: string | null
          created_by: string | null
          delivered_as: string | null
          family_code_used: string | null
          id: string
          message: string | null
          recipient_email: string
          sent_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          book_id?: string | null
          created_at?: string | null
          created_by?: string | null
          delivered_as?: string | null
          family_code_used?: string | null
          id?: string
          message?: string | null
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          book_id?: string | null
          created_at?: string | null
          created_by?: string | null
          delivered_as?: string | null
          family_code_used?: string | null
          id?: string
          message?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_orders_activated_by_fkey"
            columns: ["activated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_orders_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      passions: {
        Row: {
          created_at: string | null
          created_by: string | null
          emoji: string | null
          id: string
          label: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          emoji?: string | null
          id?: string
          label: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          emoji?: string | null
          id?: string
          label?: string
          updated_at?: string | null
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
      subscriptions: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          is_active: boolean | null
          start_date: string
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          start_date: string
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          start_date?: string
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      themes: {
        Row: {
          created_at: string | null
          emoji: string | null
          id: string
          label: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      traits: {
        Row: {
          created_at: string | null
          created_by: string | null
          emoji: string | null
          id: string
          label: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          emoji?: string | null
          id?: string
          label: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          emoji?: string | null
          id?: string
          label?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      universes: {
        Row: {
          created_at: string | null
          created_by: string | null
          emoji: string | null
          id: string
          is_active: boolean | null
          label: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          updated_at?: string | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
