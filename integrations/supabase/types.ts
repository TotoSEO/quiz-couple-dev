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
      blog_article_translations: {
        Row: {
          article_id: string
          created_at: string
          excerpt: string
          featured_image_alt: string
          id: string
          introduction: string
          is_complete: boolean
          lang: string
          meta_description: string
          meta_title: string
          quick_summary: Json
          sections: Json
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          article_id: string
          created_at?: string
          excerpt?: string
          featured_image_alt?: string
          id?: string
          introduction?: string
          is_complete?: boolean
          lang: string
          meta_description?: string
          meta_title?: string
          quick_summary?: Json
          sections?: Json
          slug: string
          title?: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          created_at?: string
          excerpt?: string
          featured_image_alt?: string
          id?: string
          introduction?: string
          is_complete?: boolean
          lang?: string
          meta_description?: string
          meta_title?: string
          quick_summary?: Json
          sections?: Json
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_article_translations_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "blog_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_articles: {
        Row: {
          author_id: string
          created_at: string
          featured_image_url: string | null
          id: string
          internal_slug: string
          published_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          author_id?: string
          created_at?: string
          featured_image_url?: string | null
          id?: string
          internal_slug: string
          published_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          featured_image_url?: string | null
          id?: string
          internal_slug?: string
          published_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      problem_resolver_usage: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          used_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          used_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          used_at?: string
        }
        Relationships: []
      }
      quiz_ado_sessions: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          player1_answers: Json | null
          player1_name: string
          player2_answers: Json | null
          player2_name: string | null
          question_indices: number[]
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          player1_answers?: Json | null
          player1_name: string
          player2_answers?: Json | null
          player2_name?: string | null
          question_indices: number[]
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          player1_answers?: Json | null
          player1_name?: string
          player2_answers?: Json | null
          player2_name?: string | null
          question_indices?: number[]
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          comment: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          is_approved: boolean | null
          rating: number
        }
        Insert: {
          author_name: string
          comment?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          is_approved?: boolean | null
          rating: number
        }
        Update: {
          author_name?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          is_approved?: boolean | null
          rating?: number
        }
        Relationships: []
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
