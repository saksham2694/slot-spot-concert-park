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
      airport_booking_slots: {
        Row: {
          booking_id: string
          created_at: string
          customer_arrived: boolean | null
          id: string
          parking_layout_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          customer_arrived?: boolean | null
          id?: string
          parking_layout_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          customer_arrived?: boolean | null
          id?: string
          parking_layout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "airport_booking_slots_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "airport_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "airport_booking_slots_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vendor_airport_bookings_view"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "airport_booking_slots_parking_layout_id_fkey"
            columns: ["parking_layout_id"]
            isOneToOne: false
            referencedRelation: "airport_parking_layouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "airport_booking_slots_parking_layout_id_fkey"
            columns: ["parking_layout_id"]
            isOneToOne: false
            referencedRelation: "vendor_airport_bookings_view"
            referencedColumns: ["parking_layout_id"]
          },
        ]
      }
      airport_bookings: {
        Row: {
          airport_id: string
          created_at: string
          end_date: string
          id: string
          payment_amount: number | null
          payment_date: string | null
          payment_mode: string | null
          payment_order_id: string | null
          payment_reference_id: string | null
          qr_code_url: string | null
          start_date: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          airport_id: string
          created_at?: string
          end_date: string
          id?: string
          payment_amount?: number | null
          payment_date?: string | null
          payment_mode?: string | null
          payment_order_id?: string | null
          payment_reference_id?: string | null
          qr_code_url?: string | null
          start_date: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          airport_id?: string
          created_at?: string
          end_date?: string
          id?: string
          payment_amount?: number | null
          payment_date?: string | null
          payment_mode?: string | null
          payment_order_id?: string | null
          payment_reference_id?: string | null
          qr_code_url?: string | null
          start_date?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "airport_bookings_airport_id_fkey"
            columns: ["airport_id"]
            isOneToOne: false
            referencedRelation: "airports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "airport_bookings_airport_id_fkey"
            columns: ["airport_id"]
            isOneToOne: false
            referencedRelation: "vendor_airport_bookings_view"
            referencedColumns: ["airport_id"]
          },
        ]
      }
      airport_parking_layouts: {
        Row: {
          airport_id: string | null
          column_number: number
          id: string
          is_reserved: boolean | null
          price: number
          row_number: number
        }
        Insert: {
          airport_id?: string | null
          column_number: number
          id?: string
          is_reserved?: boolean | null
          price: number
          row_number: number
        }
        Update: {
          airport_id?: string | null
          column_number?: number
          id?: string
          is_reserved?: boolean | null
          price?: number
          row_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "airport_parking_layouts_airport_id_fkey"
            columns: ["airport_id"]
            isOneToOne: false
            referencedRelation: "airports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "airport_parking_layouts_airport_id_fkey"
            columns: ["airport_id"]
            isOneToOne: false
            referencedRelation: "vendor_airport_bookings_view"
            referencedColumns: ["airport_id"]
          },
        ]
      }
      airports: {
        Row: {
          available_parking_slots: number
          created_at: string
          hourly_rate: number
          id: string
          image_url: string | null
          location: string
          name: string
          total_parking_slots: number
        }
        Insert: {
          available_parking_slots: number
          created_at?: string
          hourly_rate?: number
          id?: string
          image_url?: string | null
          location: string
          name: string
          total_parking_slots: number
        }
        Update: {
          available_parking_slots?: number
          created_at?: string
          hourly_rate?: number
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          total_parking_slots?: number
        }
        Relationships: []
      }
      booking_slots: {
        Row: {
          booking_id: string
          created_at: string
          customer_arrived: boolean | null
          id: string
          parking_layout_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          customer_arrived?: boolean | null
          id?: string
          parking_layout_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          customer_arrived?: boolean | null
          id?: string
          parking_layout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_slots_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_slots_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vendor_bookings_view"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "booking_slots_parking_layout_id_fkey"
            columns: ["parking_layout_id"]
            isOneToOne: false
            referencedRelation: "parking_layouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_slots_parking_layout_id_fkey"
            columns: ["parking_layout_id"]
            isOneToOne: false
            referencedRelation: "vendor_bookings_view"
            referencedColumns: ["parking_layout_id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string | null
          event_id: string | null
          id: string
          parking_layout_id: string | null
          payment_amount: number | null
          payment_date: string | null
          payment_mode: string | null
          payment_order_id: string | null
          payment_reference_id: string | null
          qr_code_url: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          booking_date?: string | null
          event_id?: string | null
          id?: string
          parking_layout_id?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_mode?: string | null
          payment_order_id?: string | null
          payment_reference_id?: string | null
          qr_code_url?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          booking_date?: string | null
          event_id?: string | null
          id?: string
          parking_layout_id?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_mode?: string | null
          payment_order_id?: string | null
          payment_reference_id?: string | null
          qr_code_url?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "vendor_bookings_view"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "bookings_parking_layout_id_fkey"
            columns: ["parking_layout_id"]
            isOneToOne: false
            referencedRelation: "parking_layouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_parking_layout_id_fkey"
            columns: ["parking_layout_id"]
            isOneToOne: false
            referencedRelation: "vendor_bookings_view"
            referencedColumns: ["parking_layout_id"]
          },
        ]
      }
      events: {
        Row: {
          available_parking_slots: number
          created_at: string | null
          date: string
          id: string
          image_url: string | null
          location: string
          parking_price: number
          title: string
          total_parking_slots: number
        }
        Insert: {
          available_parking_slots: number
          created_at?: string | null
          date: string
          id?: string
          image_url?: string | null
          location: string
          parking_price?: number
          title: string
          total_parking_slots: number
        }
        Update: {
          available_parking_slots?: number
          created_at?: string | null
          date?: string
          id?: string
          image_url?: string | null
          location?: string
          parking_price?: number
          title?: string
          total_parking_slots?: number
        }
        Relationships: []
      }
      parking_layouts: {
        Row: {
          column_number: number
          event_id: string | null
          id: string
          is_reserved: boolean | null
          price: number
          row_number: number
        }
        Insert: {
          column_number: number
          event_id?: string | null
          id?: string
          is_reserved?: boolean | null
          price: number
          row_number: number
        }
        Update: {
          column_number?: number
          event_id?: string | null
          id?: string
          is_reserved?: boolean | null
          price?: number
          row_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "parking_layouts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parking_layouts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "vendor_bookings_view"
            referencedColumns: ["event_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
        }
        Relationships: []
      }
      universities: {
        Row: {
          available_parking_slots: number
          created_at: string
          hourly_rate: number
          id: string
          image_url: string | null
          location: string
          name: string
          total_parking_slots: number
        }
        Insert: {
          available_parking_slots: number
          created_at?: string
          hourly_rate?: number
          id?: string
          image_url?: string | null
          location: string
          name: string
          total_parking_slots: number
        }
        Update: {
          available_parking_slots?: number
          created_at?: string
          hourly_rate?: number
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          total_parking_slots?: number
        }
        Relationships: []
      }
      university_booking_slots: {
        Row: {
          booking_id: string
          created_at: string
          customer_arrived: boolean | null
          id: string
          parking_layout_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          customer_arrived?: boolean | null
          id?: string
          parking_layout_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          customer_arrived?: boolean | null
          id?: string
          parking_layout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "university_booking_slots_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "university_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_booking_slots_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vendor_university_bookings_view"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "university_booking_slots_parking_layout_id_fkey"
            columns: ["parking_layout_id"]
            isOneToOne: false
            referencedRelation: "university_parking_layouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_booking_slots_parking_layout_id_fkey"
            columns: ["parking_layout_id"]
            isOneToOne: false
            referencedRelation: "vendor_university_bookings_view"
            referencedColumns: ["parking_layout_id"]
          },
        ]
      }
      university_bookings: {
        Row: {
          created_at: string
          end_date: string
          id: string
          payment_amount: number | null
          payment_date: string | null
          payment_mode: string | null
          payment_order_id: string | null
          payment_reference_id: string | null
          qr_code_url: string | null
          start_date: string
          status: string | null
          university_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          payment_amount?: number | null
          payment_date?: string | null
          payment_mode?: string | null
          payment_order_id?: string | null
          payment_reference_id?: string | null
          qr_code_url?: string | null
          start_date: string
          status?: string | null
          university_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          payment_amount?: number | null
          payment_date?: string | null
          payment_mode?: string | null
          payment_order_id?: string | null
          payment_reference_id?: string | null
          qr_code_url?: string | null
          start_date?: string
          status?: string | null
          university_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "university_bookings_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_bookings_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "vendor_university_bookings_view"
            referencedColumns: ["university_id"]
          },
        ]
      }
      university_parking_layouts: {
        Row: {
          column_number: number
          id: string
          is_reserved: boolean | null
          price: number
          row_number: number
          university_id: string | null
        }
        Insert: {
          column_number: number
          id?: string
          is_reserved?: boolean | null
          price: number
          row_number: number
          university_id?: string | null
        }
        Update: {
          column_number?: number
          id?: string
          is_reserved?: boolean | null
          price?: number
          row_number?: number
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "university_parking_layouts_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_parking_layouts_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "vendor_university_bookings_view"
            referencedColumns: ["university_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_admin: boolean | null
          is_vendor: boolean | null
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          is_vendor?: boolean | null
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_vendor?: boolean | null
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      vendor_airport_bookings_view: {
        Row: {
          airport_id: string | null
          airport_location: string | null
          airport_name: string | null
          booking_date: string | null
          booking_id: string | null
          booking_slot_id: string | null
          booking_status: string | null
          column_number: number | null
          customer_arrived: boolean | null
          customer_email: string | null
          customer_name: string | null
          end_date: string | null
          parking_layout_id: string | null
          qr_code_url: string | null
          row_number: number | null
          slot_id: string | null
          start_date: string | null
          user_id: string | null
        }
        Relationships: []
      }
      vendor_bookings_view: {
        Row: {
          booking_date: string | null
          booking_id: string | null
          booking_slot_id: string | null
          booking_status: string | null
          column_number: number | null
          customer_arrived: boolean | null
          customer_email: string | null
          customer_name: string | null
          event_date: string | null
          event_id: string | null
          event_location: string | null
          event_title: string | null
          parking_layout_id: string | null
          qr_code_url: string | null
          row_number: number | null
          slot_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
      vendor_university_bookings_view: {
        Row: {
          booking_date: string | null
          booking_id: string | null
          booking_slot_id: string | null
          booking_status: string | null
          column_number: number | null
          customer_arrived: boolean | null
          customer_email: string | null
          customer_name: string | null
          end_date: string | null
          parking_layout_id: string | null
          qr_code_url: string | null
          row_number: number | null
          slot_id: string | null
          start_date: string | null
          university_id: string | null
          university_location: string | null
          university_name: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      decrement: {
        Args: { x: number; row_id: string }
        Returns: number
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      increment: {
        Args: { x: number; row_id: string }
        Returns: number
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_customer_arrived: {
        Args: { booking_id_param: string }
        Returns: {
          booking_id: string
          created_at: string
          customer_arrived: boolean | null
          id: string
          parking_layout_id: string
        }[]
      }
      sync_all_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_users_to_profiles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user" | "vendor"
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
    Enums: {
      app_role: ["admin", "user", "vendor"],
    },
  },
} as const
