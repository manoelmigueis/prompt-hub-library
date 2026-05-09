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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      camera_references: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          prompt_example: string | null
          prompt_keyword: string
          pt_explanation: string | null
          purpose: string | null
          type: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          prompt_example?: string | null
          prompt_keyword: string
          pt_explanation?: string | null
          purpose?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          prompt_example?: string | null
          prompt_keyword?: string
          pt_explanation?: string | null
          purpose?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          prompt_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          current_uses: number | null
          expires_at: string | null
          grants_admin: boolean
          id: string
          is_active: boolean | null
          max_uses: number | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          grants_admin?: boolean
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          grants_admin?: boolean
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          used_by?: string | null
        }
        Relationships: []
      }
      portfolio_collection_images: {
        Row: {
          collection_id: string
          created_at: string
          id: string
          prompt_id: string
          sort_order: number
        }
        Insert: {
          collection_id: string
          created_at?: string
          id?: string
          prompt_id: string
          sort_order?: number
        }
        Update: {
          collection_id?: string
          created_at?: string
          id?: string
          prompt_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_collection_images_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "portfolio_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_collections: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          is_template: boolean
          slug: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          is_template?: boolean
          slug: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          is_template?: boolean
          slug?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          created_at: string
          id: string
          portfolio_id: string
          position: number
          prompt_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          portfolio_id: string
          position?: number
          prompt_id: string
        }
        Update: {
          created_at?: string
          id?: string
          portfolio_id?: string
          position?: number
          prompt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_note: string | null
          customer_whatsapp: string | null
          id: string
          owner_user_id: string
          portfolio_id: string
          selected_image_urls: string[]
          selected_prompt_ids: string[]
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_note?: string | null
          customer_whatsapp?: string | null
          id?: string
          owner_user_id: string
          portfolio_id: string
          selected_image_urls?: string[]
          selected_prompt_ids?: string[]
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_note?: string | null
          customer_whatsapp?: string | null
          id?: string
          owner_user_id?: string
          portfolio_id?: string
          selected_image_urls?: string[]
          selected_prompt_ids?: string[]
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          about: string | null
          cover_image_url: string | null
          cover_prompt_id: string | null
          created_at: string
          id: string
          is_published: boolean
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          about?: string | null
          cover_image_url?: string | null
          cover_prompt_id?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          about?: string | null
          cover_image_url?: string | null
          cover_prompt_id?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          has_access: boolean
          id: string
          instagram: string | null
          invite_code_used: string | null
          show_social_links: boolean
          status: Database["public"]["Enums"]["user_status"]
          tiktok: string | null
          twitter: string | null
          updated_at: string
          username: string | null
          website: string | null
          whatsapp: string | null
          youtube: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          has_access?: boolean
          id: string
          instagram?: string | null
          invite_code_used?: string | null
          show_social_links?: boolean
          status?: Database["public"]["Enums"]["user_status"]
          tiktok?: string | null
          twitter?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
          whatsapp?: string | null
          youtube?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          has_access?: boolean
          id?: string
          instagram?: string | null
          invite_code_used?: string | null
          show_social_links?: boolean
          status?: Database["public"]["Enums"]["user_status"]
          tiktok?: string | null
          twitter?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
          whatsapp?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      prompts: {
        Row: {
          author_instagram: string | null
          author_name: string | null
          category: string
          content: string
          copy_count: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          author_instagram?: string | null
          author_name?: string | null
          category?: string
          content: string
          copy_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          author_instagram?: string | null
          author_name?: string | null
          category?: string
          content?: string
          copy_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      reference_favorites: {
        Row: {
          created_at: string
          id: string
          reference_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reference_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reference_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reference_favorites_reference_id_fkey"
            columns: ["reference_id"]
            isOneToOne: false
            referencedRelation: "camera_references"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          name?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_collection: {
        Args: { _slug: string; _username: string }
        Returns: {
          avatar_url: string
          bio: string
          collection_id: string
          cover_image_url: string
          description: string
          display_name: string
          instagram: string
          is_public: boolean
          show_social_links: boolean
          slug: string
          tiktok: string
          title: string
          twitter: string
          user_id: string
          username: string
          website: string
          whatsapp: string
          youtube: string
        }[]
      }
      get_public_portfolio_by_username: {
        Args: { _username: string }
        Returns: {
          about: string
          avatar_url: string
          bio: string
          cover_image_url: string
          cover_prompt_id: string
          display_name: string
          instagram: string
          is_published: boolean
          portfolio_id: string
          show_social_links: boolean
          tiktok: string
          title: string
          twitter: string
          user_id: string
          username: string
          website: string
          whatsapp: string
          youtube: string
        }[]
      }
      get_public_profiles: {
        Args: { _ids: string[] }
        Returns: {
          avatar_url: string
          display_name: string
          id: string
          instagram: string
        }[]
      }
      get_user_status: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_status"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_copy_count: { Args: { prompt_id: string }; Returns: undefined }
      increment_view_count: { Args: { prompt_id: string }; Returns: undefined }
      is_admin_or_moderator: { Args: { _user_id: string }; Returns: boolean }
      is_username_available: { Args: { _username: string }; Returns: boolean }
      use_invite_code: { Args: { _code: string }; Returns: boolean }
      validate_invite_code: { Args: { _code: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      user_status: "active" | "banned" | "suspended"
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
      app_role: ["admin", "moderator", "user"],
      user_status: ["active", "banned", "suspended"],
    },
  },
} as const
