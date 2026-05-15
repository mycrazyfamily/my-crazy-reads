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
      avatar_history: {
        Row: {
          age: number | null
          avatar_url: string
          birth_date: string | null
          created_at: string | null
          family_id: string | null
          id: string
          profile_id: string
          profile_type: string
          reason: string | null
        }
        Insert: {
          age?: number | null
          avatar_url: string
          birth_date?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string
          profile_id: string
          profile_type: string
          reason?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string
          birth_date?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string
          profile_id?: string
          profile_type?: string
          reason?: string | null
        }
        Relationships: []
      }
      book_requests: {
        Row: {
          child_id: string | null
          created_at: string | null
          created_by: string | null
          delivery_month: string | null
          fabrication_month: string | null
          family_id: string | null
          id: string
          is_active: boolean | null
          is_original: boolean | null
          message: string
          original_theme_instructions: string | null
          personalization_deadline: string | null
          request_type: string | null
          selected_characters: Json | null
          selected_theme_id: string | null
          selected_theme_type: string | null
          status: string | null
          theme_locked: boolean | null
          theme_locked_at: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_month?: string | null
          fabrication_month?: string | null
          family_id?: string | null
          id?: string
          is_active?: boolean | null
          is_original?: boolean | null
          message: string
          original_theme_instructions?: string | null
          personalization_deadline?: string | null
          request_type?: string | null
          selected_characters?: Json | null
          selected_theme_id?: string | null
          selected_theme_type?: string | null
          status?: string | null
          theme_locked?: boolean | null
          theme_locked_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_month?: string | null
          fabrication_month?: string | null
          family_id?: string | null
          id?: string
          is_active?: boolean | null
          is_original?: boolean | null
          message?: string
          original_theme_instructions?: string | null
          personalization_deadline?: string | null
          request_type?: string | null
          selected_characters?: Json | null
          selected_theme_id?: string | null
          selected_theme_type?: string | null
          status?: string | null
          theme_locked?: boolean | null
          theme_locked_at?: string | null
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
          {
            foreignKeyName: "book_requests_selected_theme_id_fkey"
            columns: ["selected_theme_id"]
            isOneToOne: false
            referencedRelation: "story_themes"
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
      cancellation_feedback: {
        Row: {
          child_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          reason: string | null
          subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          child_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
          subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          child_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
          subscription_id?: string | null
          user_id?: string | null
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
      child_likes: {
        Row: {
          child_id: string
          created_at: string | null
          id: string
          like_id: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          id?: string
          like_id?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          id?: string
          like_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_likes_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_likes_like_id_fkey"
            columns: ["like_id"]
            isOneToOne: false
            referencedRelation: "likes"
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
          birth_month_year: string | null
          child_id: string | null
          created_at: string | null
          id: string
          name: string | null
          pet_id: string | null
          race: string | null
          relation_label: string | null
          traits: string | null
          traits_custom: Json | null
        }
        Insert: {
          birth_month_year?: string | null
          child_id?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          pet_id?: string | null
          race?: string | null
          relation_label?: string | null
          traits?: string | null
          traits_custom?: Json | null
        }
        Update: {
          birth_month_year?: string | null
          child_id?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          pet_id?: string | null
          race?: string | null
          relation_label?: string | null
          traits?: string | null
          traits_custom?: Json | null
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
      child_places: {
        Row: {
          child_id: string
          created_at: string | null
          id: string
          label: string | null
          place_id: string
        }
        Insert: {
          child_id: string
          created_at?: string | null
          id?: string
          label?: string | null
          place_id: string
        }
        Update: {
          child_id?: string
          created_at?: string | null
          id?: string
          label?: string | null
          place_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_places_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      child_profiles: {
        Row: {
          appearance: Json | null
          avatar_url: string | null
          birth_date: string | null
          clothing_style: Json | null
          clothing_style_resolved: string | null
          created_at: string | null
          family_id: string | null
          first_name: string | null
          gender: string | null
          has_pet: boolean | null
          height: string | null
          height_relative_to_age: string | null
          id: string
          nickname: string | null
          physical_details: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          appearance?: Json | null
          avatar_url?: string | null
          birth_date?: string | null
          clothing_style?: Json | null
          clothing_style_resolved?: string | null
          created_at?: string | null
          family_id?: string | null
          first_name?: string | null
          gender?: string | null
          has_pet?: boolean | null
          height?: string | null
          height_relative_to_age?: string | null
          id?: string
          nickname?: string | null
          physical_details?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          appearance?: Json | null
          avatar_url?: string | null
          birth_date?: string | null
          clothing_style?: Json | null
          clothing_style_resolved?: string | null
          created_at?: string | null
          family_id?: string | null
          first_name?: string | null
          gender?: string | null
          has_pet?: boolean | null
          height?: string | null
          height_relative_to_age?: string | null
          id?: string
          nickname?: string | null
          physical_details?: Json | null
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
      child_superpowers: {
        Row: {
          child_id: string
          created_at: string | null
          id: string
          superpower_id: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          id?: string
          superpower_id?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          id?: string
          superpower_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_superpowers_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_superpowers_superpower_id_fkey"
            columns: ["superpower_id"]
            isOneToOne: false
            referencedRelation: "superpowers"
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
      clothing_catalog: {
        Row: {
          aliases: string[] | null
          category: string | null
          created_at: string | null
          full_description: string
          gender: string | null
          id: string
          keyword: string
          updated_at: string | null
        }
        Insert: {
          aliases?: string[] | null
          category?: string | null
          created_at?: string | null
          full_description: string
          gender?: string | null
          id?: string
          keyword: string
          updated_at?: string | null
        }
        Update: {
          aliases?: string[] | null
          category?: string | null
          created_at?: string | null
          full_description?: string
          gender?: string | null
          id?: string
          keyword?: string
          updated_at?: string | null
        }
        Relationships: []
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
          avatar_url: string | null
          clothing_style: Json | null
          clothing_style_resolved: string | null
          created_at: string | null
          details: Json | null
          family_id: string | null
          id: string
          is_deceased: boolean | null
          is_memory: boolean | null
          name: string | null
          physical_details: Json | null
          role: string | null
        }
        Insert: {
          avatar?: string | null
          avatar_url?: string | null
          clothing_style?: Json | null
          clothing_style_resolved?: string | null
          created_at?: string | null
          details?: Json | null
          family_id?: string | null
          id?: string
          is_deceased?: boolean | null
          is_memory?: boolean | null
          name?: string | null
          physical_details?: Json | null
          role?: string | null
        }
        Update: {
          avatar?: string | null
          avatar_url?: string | null
          clothing_style?: Json | null
          clothing_style_resolved?: string | null
          created_at?: string | null
          details?: Json | null
          family_id?: string | null
          id?: string
          is_deceased?: boolean | null
          is_memory?: boolean | null
          name?: string | null
          physical_details?: Json | null
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
      likes: {
        Row: {
          created_at: string | null
          emoji: string | null
          id: string
          label: string
          value: string
        }
        Insert: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label: string
          value: string
        }
        Update: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label?: string
          value?: string
        }
        Relationships: []
      }
      mcf_book_pages: {
        Row: {
          created_at: string | null
          id: string
          image_prompt: string | null
          image_status: string | null
          image_url: string | null
          notes: string | null
          page_no: number
          production_id: string
          text_left: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_prompt?: string | null
          image_status?: string | null
          image_url?: string | null
          notes?: string | null
          page_no: number
          production_id: string
          text_left?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_prompt?: string | null
          image_status?: string | null
          image_url?: string | null
          notes?: string | null
          page_no?: number
          production_id?: string
          text_left?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mcf_book_pages_production_id_fkey"
            columns: ["production_id"]
            isOneToOne: false
            referencedRelation: "mcf_book_productions"
            referencedColumns: ["id"]
          },
        ]
      }
      mcf_book_productions: {
        Row: {
          book_request_id: string | null
          child_id: string | null
          created_at: string | null
          family_id: string | null
          final_book_id: string | null
          id: string
          image_provider: string | null
          last_error: string | null
          layout_provider: string | null
          pdf_url: string | null
          retry_count: number | null
          status: Database["public"]["Enums"]["mcf_production_status"] | null
          text_draft: string | null
          text_final: string | null
          text_prompt: string | null
          text_provider: string | null
          theme_id: string | null
          theme_label: string | null
          updated_at: string | null
        }
        Insert: {
          book_request_id?: string | null
          child_id?: string | null
          created_at?: string | null
          family_id?: string | null
          final_book_id?: string | null
          id?: string
          image_provider?: string | null
          last_error?: string | null
          layout_provider?: string | null
          pdf_url?: string | null
          retry_count?: number | null
          status?: Database["public"]["Enums"]["mcf_production_status"] | null
          text_draft?: string | null
          text_final?: string | null
          text_prompt?: string | null
          text_provider?: string | null
          theme_id?: string | null
          theme_label?: string | null
          updated_at?: string | null
        }
        Update: {
          book_request_id?: string | null
          child_id?: string | null
          created_at?: string | null
          family_id?: string | null
          final_book_id?: string | null
          id?: string
          image_provider?: string | null
          last_error?: string | null
          layout_provider?: string | null
          pdf_url?: string | null
          retry_count?: number | null
          status?: Database["public"]["Enums"]["mcf_production_status"] | null
          text_draft?: string | null
          text_final?: string | null
          text_prompt?: string | null
          text_provider?: string | null
          theme_id?: string | null
          theme_label?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mcf_book_productions_book_request_id_fkey"
            columns: ["book_request_id"]
            isOneToOne: false
            referencedRelation: "book_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcf_book_productions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcf_book_productions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcf_book_productions_final_book_id_fkey"
            columns: ["final_book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcf_book_productions_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          family_id: string | null
          id: string
          link: string | null
          read: boolean
          title: string | null
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          family_id?: string | null
          id?: string
          link?: string | null
          read?: boolean
          title?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          family_id?: string | null
          id?: string
          link?: string | null
          read?: boolean
          title?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
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
          avatar_url: string | null
          breed: string | null
          clothing_style: Json | null
          created_at: string | null
          emoji: string | null
          family_id: string | null
          id: string
          is_deceased: boolean | null
          name: string
          physical_details: Json | null
          type: string | null
        }
        Insert: {
          avatar_url?: string | null
          breed?: string | null
          clothing_style?: Json | null
          created_at?: string | null
          emoji?: string | null
          family_id?: string | null
          id?: string
          is_deceased?: boolean | null
          name: string
          physical_details?: Json | null
          type?: string | null
        }
        Update: {
          avatar_url?: string | null
          breed?: string | null
          clothing_style?: Json | null
          created_at?: string | null
          emoji?: string | null
          family_id?: string | null
          id?: string
          is_deceased?: boolean | null
          name?: string
          physical_details?: Json | null
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
      places: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          details: Json | null
          emoji: string | null
          family_id: string | null
          id: string
          is_active: boolean | null
          label: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          details?: Json | null
          emoji?: string | null
          family_id?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          details?: Json | null
          emoji?: string | null
          family_id?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_webhook_events: {
        Row: {
          event_id: string
          event_type: string | null
          id: string
          processed_at: string | null
        }
        Insert: {
          event_id: string
          event_type?: string | null
          id?: string
          processed_at?: string | null
        }
        Update: {
          event_id?: string
          event_type?: string | null
          id?: string
          processed_at?: string | null
        }
        Relationships: []
      }
      story_themes: {
        Row: {
          age_months_max: number | null
          age_months_min: number | null
          age_years_max: number | null
          age_years_min: number | null
          annee: number
          calendar_month: number | null
          cast_suggested: string[] | null
          created_at: string | null
          forced_companion: string | null
          gamme: number
          id: string
          is_substitute: boolean | null
          logique_pedagogique: string | null
          parametres_dependants: string[] | null
          preferred_location_type: string | null
          resume_narratif: string | null
          sources_supabase: string[] | null
          story_guidelines: string | null
          substitute_condition: string | null
          theme_type: string
          titre: string
          updated_at: string | null
          variante_condition: string | null
          variante_resume: string | null
          variante_titre: string | null
        }
        Insert: {
          age_months_max?: number | null
          age_months_min?: number | null
          age_years_max?: number | null
          age_years_min?: number | null
          annee: number
          calendar_month?: number | null
          cast_suggested?: string[] | null
          created_at?: string | null
          forced_companion?: string | null
          gamme: number
          id?: string
          is_substitute?: boolean | null
          logique_pedagogique?: string | null
          parametres_dependants?: string[] | null
          preferred_location_type?: string | null
          resume_narratif?: string | null
          sources_supabase?: string[] | null
          story_guidelines?: string | null
          substitute_condition?: string | null
          theme_type?: string
          titre: string
          updated_at?: string | null
          variante_condition?: string | null
          variante_resume?: string | null
          variante_titre?: string | null
        }
        Update: {
          age_months_max?: number | null
          age_months_min?: number | null
          age_years_max?: number | null
          age_years_min?: number | null
          annee?: number
          calendar_month?: number | null
          cast_suggested?: string[] | null
          created_at?: string | null
          forced_companion?: string | null
          gamme?: number
          id?: string
          is_substitute?: boolean | null
          logique_pedagogique?: string | null
          parametres_dependants?: string[] | null
          preferred_location_type?: string | null
          resume_narratif?: string | null
          sources_supabase?: string[] | null
          story_guidelines?: string | null
          substitute_condition?: string | null
          theme_type?: string
          titre?: string
          updated_at?: string | null
          variante_condition?: string | null
          variante_resume?: string | null
          variante_titre?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          child_id: string | null
          created_at: string | null
          created_by: string | null
          end_date: string
          family_id: string | null
          id: string
          is_active: boolean | null
          start_date: string
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          cancel_at?: string | null
          child_id?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date: string
          family_id?: string | null
          id?: string
          is_active?: boolean | null
          start_date: string
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          cancel_at?: string | null
          child_id?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          family_id?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      superpowers: {
        Row: {
          created_at: string | null
          emoji: string | null
          id: string
          label: string
          value: string
        }
        Insert: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label: string
          value: string
        }
        Update: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          label?: string
          value?: string
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
          id: string
        }
        Insert: {
          created_at?: string | null
          family_id?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          family_id?: string | null
          id?: string
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
      generate_book_requests_for_child: {
        Args: { p_child_id: string; p_created_by: string; p_family_id: string }
        Returns: undefined
      }
      get_birthday_children_today: {
        Args: never
        Returns: {
          appearance: Json
          avatar_url: string
          birth_date: string
          clothing_style: Json
          family_id: string
          first_name: string
          gender: string
          id: string
          physical_details: Json
          user_id: string
        }[]
      }
      get_child_book_timeline: {
        Args: { p_child_id: string }
        Returns: {
          book_request_id: string
          delivery_month: string
          fabrication_month: string
          is_original: boolean
          original_theme_instructions: string
          pdf_url: string
          personalization_deadline: string
          production_status: string
          saved_note: string
          selected_characters: Json
          selected_theme_type: string
          status: string
          substitute_condition: string
          substitute_person_name: string
          substitute_theme_id: string
          substitute_theme_titre: string
          theme_cast: Json
          theme_id: string
          theme_logique: string
          theme_resume: string
          theme_titre: string
        }[]
      }
      get_substitutes: {
        Args: { p_annee: number; p_gamme: number; p_month: number }
        Returns: {
          age_months_max: number | null
          age_months_min: number | null
          age_years_max: number | null
          age_years_min: number | null
          annee: number
          calendar_month: number | null
          cast_suggested: string[] | null
          created_at: string | null
          forced_companion: string | null
          gamme: number
          id: string
          is_substitute: boolean | null
          logique_pedagogique: string | null
          parametres_dependants: string[] | null
          preferred_location_type: string | null
          resume_narratif: string | null
          sources_supabase: string[] | null
          story_guidelines: string | null
          substitute_condition: string | null
          theme_type: string
          titre: string
          updated_at: string | null
          variante_condition: string | null
          variante_resume: string | null
          variante_titre: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "story_themes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      lock_overdue_book_requests: { Args: never; Returns: undefined }
    }
    Enums: {
      mcf_production_status:
        | "new"
        | "needs_text"
        | "text_ready"
        | "needs_text_review"
        | "text_approved"
        | "needs_images"
        | "images_ready"
        | "needs_images_review"
        | "images_approved"
        | "needs_layout"
        | "layout_ready"
        | "needs_final_review"
        | "pdf_ready"
        | "error"
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
    Enums: {
      mcf_production_status: [
        "new",
        "needs_text",
        "text_ready",
        "needs_text_review",
        "text_approved",
        "needs_images",
        "images_ready",
        "needs_images_review",
        "images_approved",
        "needs_layout",
        "layout_ready",
        "needs_final_review",
        "pdf_ready",
        "error",
      ],
    },
  },
} as const
