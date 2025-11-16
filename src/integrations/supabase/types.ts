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
      analysis_logs: {
        Row: {
          channel_id: string | null
          channel_name: string
          channel_url: string | null
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          channel_id?: string | null
          channel_name: string
          channel_url?: string | null
          created_at?: string
          id?: number
          user_id?: string
        }
        Update: {
          channel_id?: string | null
          channel_name?: string
          channel_url?: string | null
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          key_encrypted: string
          provider: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_encrypted: string
          provider: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key_encrypted?: string
          provider?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
      channel_meta: {
        Row: {
          channel_id: string
          created_at: string
          manager_name: string | null
          primary_topic: string | null
          topic_tags: string[] | null
          updated_at: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          manager_name?: string | null
          primary_topic?: string | null
          topic_tags?: string[] | null
          updated_at?: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          manager_name?: string | null
          primary_topic?: string | null
          topic_tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      channel_snapshots: {
        Row: {
          channel_id: string
          channel_title: string | null
          channel_url: string | null
          created_at: string
          id: number
          snapshot: Json | null
          snapshot_date: string
          subscriber_count: number | null
          user_id: string | null
          video_count: number
          view_count: number
        }
        Insert: {
          channel_id: string
          channel_title?: string | null
          channel_url?: string | null
          created_at?: string
          id?: number
          snapshot?: Json | null
          snapshot_date?: string
          subscriber_count?: number | null
          user_id?: string | null
          video_count?: number
          view_count?: number
        }
        Update: {
          channel_id?: string
          channel_title?: string | null
          channel_url?: string | null
          created_at?: string
          id?: number
          snapshot?: Json | null
          snapshot_date?: string
          subscriber_count?: number | null
          user_id?: string | null
          video_count?: number
          view_count?: number
        }
        Relationships: []
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
      channel_upload_stats: {
        Row: {
          avg_per_month: number
          avg_per_month_long: number
          avg_per_month_short: number
          avg_per_week: number
          channel_id: string
          computed_at: string
          uploads_12m: number
          uploads_12m_long: number
          uploads_12m_short: number
          uploads_12w: number
          window_months: number
          window_weeks: number
        }
        Insert: {
          avg_per_month?: number
          avg_per_month_long?: number
          avg_per_month_short?: number
          avg_per_week?: number
          channel_id: string
          computed_at?: string
          uploads_12m?: number
          uploads_12m_long?: number
          uploads_12m_short?: number
          uploads_12w?: number
          window_months?: number
          window_weeks?: number
        }
        Update: {
          avg_per_month?: number
          avg_per_month_long?: number
          avg_per_month_short?: number
          avg_per_week?: number
          channel_id?: string
          computed_at?: string
          uploads_12m?: number
          uploads_12m_long?: number
          uploads_12m_short?: number
          uploads_12w?: number
          window_months?: number
          window_weeks?: number
        }
        Relationships: []
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
      profiles: {
        Row: {
          created_at: string
          deleted_at: string | null
          display_name: string | null
          email: string | null
          id: string
          nickname: string | null
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          nickname?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          nickname?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      usage_daily: {
        Row: {
          analysis_count: number
          analytics_api_calls: number
          created_at: string | null
          data_api_calls: number
          data_save_count: number
          id: string
          updated_at: string | null
          usage_date: string
          user_id: string
        }
        Insert: {
          analysis_count?: number
          analytics_api_calls?: number
          created_at?: string | null
          data_api_calls?: number
          data_save_count?: number
          id?: string
          updated_at?: string | null
          usage_date: string
          user_id: string
        }
        Update: {
          analysis_count?: number
          analytics_api_calls?: number
          created_at?: string | null
          data_api_calls?: number
          data_save_count?: number
          id?: string
          updated_at?: string | null
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_stats: {
        Row: {
          analytics_api_calls: number | null
          analyzed_channels: number | null
          data_api_calls: number | null
          data_save: number | null
          day: string
          user_id: string
        }
        Insert: {
          analytics_api_calls?: number | null
          analyzed_channels?: number | null
          data_api_calls?: number | null
          data_save?: number | null
          day: string
          user_id: string
        }
        Update: {
          analytics_api_calls?: number | null
          analyzed_channels?: number | null
          data_api_calls?: number | null
          data_save?: number | null
          day?: string
          user_id?: string
        }
        Relationships: []
      }
      user_competitor_channels: {
        Row: {
          channel_url: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          channel_url: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          channel_url?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          allocated: number
          updated_at: string | null
          used: number
          user_id: string
        }
        Insert: {
          allocated?: number
          updated_at?: string | null
          used?: number
          user_id: string
        }
        Update: {
          allocated?: number
          updated_at?: string | null
          used?: number
          user_id?: string
        }
        Relationships: []
      }
      user_secrets: {
        Row: {
          created_at: string | null
          id: string
          supabase_anon_key_enc: string | null
          supabase_url_enc: string | null
          updated_at: string | null
          user_id: string
          youtube_analytics_api_enc: string | null
          youtube_data_api_enc: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          supabase_anon_key_enc?: string | null
          supabase_url_enc?: string | null
          updated_at?: string | null
          user_id: string
          youtube_analytics_api_enc?: string | null
          youtube_data_api_enc?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          supabase_anon_key_enc?: string | null
          supabase_url_enc?: string | null
          updated_at?: string | null
          user_id?: string
          youtube_analytics_api_enc?: string | null
          youtube_data_api_enc?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          api_supabase_anon_key: string | null
          api_supabase_url: string | null
          api_youtube_key: string | null
          avatar_url: string | null
          channel_default_url: string | null
          channel_include_shorts: boolean | null
          channel_range_days: number | null
          competitor_channels: Json | null
          connect_discord_webhook: string | null
          connect_ga_id: string | null
          connect_slack_webhook: string | null
          created_at: string | null
          credits_total: number | null
          credits_used: number | null
          default_range: string | null
          display_name: string | null
          general_date_format: string | null
          general_language: string | null
          general_theme: string | null
          general_timezone: string | null
          id: string
          supabase_anon_enc: string | null
          supabase_url_enc: string | null
          updated_at: string | null
          usage_api_calls_youtube: number | null
          usage_videos_scanned: number | null
          user_id: string
          yt_analytics_api_enc: string | null
          yt_data_api_enc: string | null
        }
        Insert: {
          api_supabase_anon_key?: string | null
          api_supabase_url?: string | null
          api_youtube_key?: string | null
          avatar_url?: string | null
          channel_default_url?: string | null
          channel_include_shorts?: boolean | null
          channel_range_days?: number | null
          competitor_channels?: Json | null
          connect_discord_webhook?: string | null
          connect_ga_id?: string | null
          connect_slack_webhook?: string | null
          created_at?: string | null
          credits_total?: number | null
          credits_used?: number | null
          default_range?: string | null
          display_name?: string | null
          general_date_format?: string | null
          general_language?: string | null
          general_theme?: string | null
          general_timezone?: string | null
          id?: string
          supabase_anon_enc?: string | null
          supabase_url_enc?: string | null
          updated_at?: string | null
          usage_api_calls_youtube?: number | null
          usage_videos_scanned?: number | null
          user_id: string
          yt_analytics_api_enc?: string | null
          yt_data_api_enc?: string | null
        }
        Update: {
          api_supabase_anon_key?: string | null
          api_supabase_url?: string | null
          api_youtube_key?: string | null
          avatar_url?: string | null
          channel_default_url?: string | null
          channel_include_shorts?: boolean | null
          channel_range_days?: number | null
          competitor_channels?: Json | null
          connect_discord_webhook?: string | null
          connect_ga_id?: string | null
          connect_slack_webhook?: string | null
          created_at?: string | null
          credits_total?: number | null
          credits_used?: number | null
          default_range?: string | null
          display_name?: string | null
          general_date_format?: string | null
          general_language?: string | null
          general_theme?: string | null
          general_timezone?: string | null
          id?: string
          supabase_anon_enc?: string | null
          supabase_url_enc?: string | null
          updated_at?: string | null
          usage_api_calls_youtube?: number | null
          usage_videos_scanned?: number | null
          user_id?: string
          yt_analytics_api_enc?: string | null
          yt_data_api_enc?: string | null
        }
        Relationships: []
      }
      video_snapshots: {
        Row: {
          comment_count: number
          created_at: string
          like_count: number
          snapshot_date: string
          video_id: string
          view_count: number
        }
        Insert: {
          comment_count?: number
          created_at?: string
          like_count?: number
          snapshot_date?: string
          video_id: string
          view_count?: number
        }
        Update: {
          comment_count?: number
          created_at?: string
          like_count?: number
          snapshot_date?: string
          video_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "video_snapshots_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["video_id"]
          },
        ]
      }
      videos: {
        Row: {
          channel_id: string
          created_at: string
          duration_seconds: number | null
          published_at: string | null
          title: string | null
          video_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          duration_seconds?: number | null
          published_at?: string | null
          title?: string | null
          video_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          duration_seconds?: number | null
          published_at?: string | null
          title?: string | null
          video_id?: string
        }
        Relationships: []
      }
      youtube_channels: {
        Row: {
          channel_id: string
          channel_name: string
          created_at: string | null
          last_updated: string | null
          subscriber_count: number | null
          total_videos: number | null
          total_views: number | null
        }
        Insert: {
          channel_id: string
          channel_name: string
          created_at?: string | null
          last_updated?: string | null
          subscriber_count?: number | null
          total_videos?: number | null
          total_views?: number | null
        }
        Update: {
          channel_id?: string
          channel_name?: string
          created_at?: string | null
          last_updated?: string | null
          subscriber_count?: number | null
          total_videos?: number | null
          total_views?: number | null
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          channel_id: string
          comments: number | null
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
          comments?: number | null
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
          comments?: number | null
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
      yta_analysis_runs: {
        Row: {
          added_videos: number | null
          channel_id: string
          comments_delta: number | null
          finished_at: string | null
          id: string
          run_type: string
          started_at: string | null
          total_comments_after: number | null
          touched_videos: number | null
          user_id: string | null
        }
        Insert: {
          added_videos?: number | null
          channel_id: string
          comments_delta?: number | null
          finished_at?: string | null
          id?: string
          run_type: string
          started_at?: string | null
          total_comments_after?: number | null
          touched_videos?: number | null
          user_id?: string | null
        }
        Update: {
          added_videos?: number | null
          channel_id?: string
          comments_delta?: number | null
          finished_at?: string | null
          id?: string
          run_type?: string
          started_at?: string | null
          total_comments_after?: number | null
          touched_videos?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      yta_channel_videos: {
        Row: {
          channel_id: string
          comment_count: number
          etag: string | null
          published_at: string | null
          updated_at: string | null
          video_id: string
        }
        Insert: {
          channel_id: string
          comment_count?: number
          etag?: string | null
          published_at?: string | null
          updated_at?: string | null
          video_id: string
        }
        Update: {
          channel_id?: string
          comment_count?: number
          etag?: string | null
          published_at?: string | null
          updated_at?: string | null
          video_id?: string
        }
        Relationships: []
      }
      yta_channels: {
        Row: {
          channel_id: string
          comments_total: number
          created_at: string | null
          last_delta_scan_at: string | null
          last_full_scan_at: string | null
          last_video_published_at: string | null
          title: string | null
          updated_at: string | null
          uploads_playlist_id: string | null
        }
        Insert: {
          channel_id: string
          comments_total?: number
          created_at?: string | null
          last_delta_scan_at?: string | null
          last_full_scan_at?: string | null
          last_video_published_at?: string | null
          title?: string | null
          updated_at?: string | null
          uploads_playlist_id?: string | null
        }
        Update: {
          channel_id?: string
          comments_total?: number
          created_at?: string | null
          last_delta_scan_at?: string | null
          last_full_scan_at?: string | null
          last_video_published_at?: string | null
          title?: string | null
          updated_at?: string | null
          uploads_playlist_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_all_videos: {
        Row: {
          channel_id: string | null
          created_at: string | null
          duration_seconds: number | null
          published_at: string | null
          title: string | null
          video_id: string | null
        }
        Relationships: []
      }
      v_channel_comment_stats: {
        Row: {
          avg_per_video: number | null
          channel_id: string | null
          max_per_video: number | null
          min_per_video: number | null
          total_comments: number | null
          videos_with_snapshot: number | null
        }
        Relationships: []
      }
      v_channel_daily_delta: {
        Row: {
          channel_id: string | null
          comment_delta: number | null
          like_delta: number | null
          snapshot_date: string | null
          view_delta: number | null
        }
        Relationships: []
      }
      v_channel_videos: {
        Row: {
          channel_id: string | null
          video_id: string | null
        }
        Relationships: []
      }
      v_latest_channel_snapshot: {
        Row: {
          channel_id: string | null
          channel_title: string | null
          channel_url: string | null
          created_at: string | null
          id: number | null
          snapshot: Json | null
          user_id: string | null
        }
        Relationships: []
      }
      v_latest_video_snapshot: {
        Row: {
          comment_count: number | null
          created_at: string | null
          like_count: number | null
          snapshot_date: string | null
          video_id: string | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_snapshots_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["video_id"]
          },
        ]
      }
      v_subscription_deltas: {
        Row: {
          channel_id: string | null
          day_delta: number | null
          month_delta: number | null
          week_delta: number | null
          year_delta: number | null
        }
        Relationships: []
      }
      v_video_daily_delta: {
        Row: {
          comment_delta: number | null
          like_delta: number | null
          snapshot_date: string | null
          video_id: string | null
          view_delta: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_snapshots_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["video_id"]
          },
        ]
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      parse_duration_seconds: { Args: { t: string }; Returns: number }
      resolve_channel_key: { Args: { p_input: string }; Returns: string }
      snapshot_video: {
        Args: {
          p_channel_id: string
          p_comment_count: number
          p_like_count: number
          p_snap_date?: string
          p_title: string
          p_url: string
          p_video_id: string
          p_view_count: number
        }
        Returns: undefined
      }
      to_seconds: { Args: { t: string }; Returns: number }
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
      upsert_videos: { Args: { p_rows: Json }; Returns: number }
    }
    Enums: {
      membership_tier: "free" | "plus" | "pro" | "Earlybird" | "admin"
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
      membership_tier: ["free", "plus", "pro", "Earlybird", "admin"],
    },
  },
} as const
