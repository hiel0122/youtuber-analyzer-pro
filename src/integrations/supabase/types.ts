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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      channel_daily_views: {
        Row: {
          channel_id: string
          d: string
          total_views: number
        }
        Insert: {
          channel_id: string
          d: string
          total_views?: number
        }
        Update: {
          channel_id?: string
          d?: string
          total_views?: number
        }
        Relationships: [
          {
            foreignKeyName: "channel_daily_views_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_kpis: {
        Row: {
          channel_id: string
          last_upload: string | null
          longform_count: number
          shortform_count: number
          sum_likes: number
          sum_views: number
          total_videos: number
          updated_at: string
        }
        Insert: {
          channel_id: string
          last_upload?: string | null
          longform_count?: number
          shortform_count?: number
          sum_likes?: number
          sum_views?: number
          total_videos?: number
          updated_at?: string
        }
        Update: {
          channel_id?: string
          last_upload?: string | null
          longform_count?: number
          shortform_count?: number
          sum_likes?: number
          sum_views?: number
          total_videos?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_kpis_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: true
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_topic_counts: {
        Row: {
          channel_id: string
          cnt: number
          topic: string
        }
        Insert: {
          channel_id: string
          cnt?: number
          topic: string
        }
        Update: {
          channel_id?: string
          cnt?: number
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_topic_counts_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          created_at: string | null
          custom_url: string | null
          hidden_subscriber: boolean | null
          id: string
          last_upload_date: string | null
          subscriber_count: number | null
          title: string | null
          updated_at: string | null
          video_count: number | null
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          custom_url?: string | null
          hidden_subscriber?: boolean | null
          id: string
          last_upload_date?: string | null
          subscriber_count?: number | null
          title?: string | null
          updated_at?: string | null
          video_count?: number | null
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          custom_url?: string | null
          hidden_subscriber?: boolean | null
          id?: string
          last_upload_date?: string | null
          subscriber_count?: number | null
          title?: string | null
          updated_at?: string | null
          video_count?: number | null
          view_count?: number | null
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          channel_id: string
          created_at: string | null
          dislikes: number | null
          duration: string | null
          id: string
          likes: number | null
          presenter: string | null
          title: string
          topic: string | null
          upload_date: string | null
          url: string
          video_id: string
          views: number | null
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          dislikes?: number | null
          duration?: string | null
          id?: string
          likes?: number | null
          presenter?: string | null
          title: string
          topic?: string | null
          upload_date?: string | null
          url: string
          video_id: string
          views?: number | null
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          dislikes?: number | null
          duration?: string | null
          id?: string
          likes?: number | null
          presenter?: string | null
          title?: string
          topic?: string | null
          upload_date?: string | null
          url?: string
          video_id?: string
          views?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      parse_duration_seconds: {
        Args: { t: string }
        Returns: number
      }
      resolve_channel_key: {
        Args: { p_input: string }
        Returns: string
      }
      upsert_channel_stats: {
        Args: {
          p_channel_input: string
          p_hidden: boolean
          p_subscribers: number
          p_title: string
          p_views: number
        }
        Returns: undefined
      }
      upsert_videos: {
        Args: { p_rows: Json }
        Returns: number
      }
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
