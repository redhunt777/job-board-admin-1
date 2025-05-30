export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          phone: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          phone: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          phone?: string
        }
        Relationships: []
      }
      candidate_profiles: {
        Row: {
          additional_doc_link: string | null
          address: string | null
          candidate_email: string
          candidate_id: string | null
          created_at: string | null
          current_ctc: number | null
          disability: boolean | null
          expected_ctc: number | null
          gender: string | null
          linkedin_url: string | null
          mobile_number: string | null
          name: string
          notice_period: string | null
          portfolio_url: string | null
          profile_id: string
          resume_link: string | null
          updated_at: string | null
        }
        Insert: {
          additional_doc_link?: string | null
          address?: string | null
          candidate_email: string
          candidate_id?: string | null
          created_at?: string | null
          current_ctc?: number | null
          disability?: boolean | null
          expected_ctc?: number | null
          gender?: string | null
          linkedin_url?: string | null
          mobile_number?: string | null
          name?: string
          notice_period?: string | null
          portfolio_url?: string | null
          profile_id?: string
          resume_link?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_doc_link?: string | null
          address?: string | null
          candidate_email?: string
          candidate_id?: string | null
          created_at?: string | null
          current_ctc?: number | null
          disability?: boolean | null
          expected_ctc?: number | null
          gender?: string | null
          linkedin_url?: string | null
          mobile_number?: string | null
          name?: string
          notice_period?: string | null
          portfolio_url?: string | null
          profile_id?: string
          resume_link?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_profiles_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["candidate_id"]
          },
        ]
      }
      candidates: {
        Row: {
          candidate_id: string
          created_at: string | null
          email: string
          name: string
          updated_at: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          email: string
          name: string
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          email?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      education: {
        Row: {
          college_university: string
          degree: string | null
          education_id: string
          end_date: string | null
          field_of_study: string | null
          grade_percentage: number | null
          is_current: boolean | null
          profile_id: string
          start_date: string | null
        }
        Insert: {
          college_university: string
          degree?: string | null
          education_id?: string
          end_date?: string | null
          field_of_study?: string | null
          grade_percentage?: number | null
          is_current?: boolean | null
          profile_id: string
          start_date?: string | null
        }
        Update: {
          college_university?: string
          degree?: string | null
          education_id?: string
          end_date?: string | null
          field_of_study?: string | null
          grade_percentage?: number | null
          is_current?: boolean | null
          profile_id?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "education_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      experience: {
        Row: {
          company_name: string
          currently_working: boolean | null
          end_date: string | null
          experience_id: string
          job_title: string
          job_type: string | null
          profile_id: string
          start_date: string
        }
        Insert: {
          company_name: string
          currently_working?: boolean | null
          end_date?: string | null
          experience_id?: string
          job_title: string
          job_type?: string | null
          profile_id: string
          start_date: string
        }
        Update: {
          company_name?: string
          currently_working?: boolean | null
          end_date?: string | null
          experience_id?: string
          job_title?: string
          job_type?: string | null
          profile_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      job_applications: {
        Row: {
          application_id: string
          application_status: string
          applied_date: string
          created_at: string
          job_id: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          application_id?: string
          application_status?: string
          applied_date?: string
          created_at?: string
          job_id: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          application_status?: string
          applied_date?: string
          created_at?: string
          job_id?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_applications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      jobs: {
        Row: {
          admin_id: string
          application_deadline: string | null
          benefits: string[] | null
          company_logo_url: string | null
          company_name: string | null
          created_at: string | null
          job_description: string | null
          job_id: string
          job_location: string | null
          job_location_type: string | null
          job_title: string
          job_type: string | null
          max_experience_needed: number | null
          max_salary: number | null
          min_experience_needed: number | null
          min_salary: number | null
          requirements: string[] | null
          status: string | null
          updated_at: string | null
          working_type: string | null
        }
        Insert: {
          admin_id: string
          application_deadline?: string | null
          benefits?: string[] | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string | null
          job_description?: string | null
          job_id?: string
          job_location?: string | null
          job_location_type?: string | null
          job_title: string
          job_type?: string | null
          max_experience_needed?: number | null
          max_salary?: number | null
          min_experience_needed?: number | null
          min_salary?: number | null
          requirements?: string[] | null
          status?: string | null
          updated_at?: string | null
          working_type?: string | null
        }
        Update: {
          admin_id?: string
          application_deadline?: string | null
          benefits?: string[] | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string | null
          job_description?: string | null
          job_id?: string
          job_location?: string | null
          job_location_type?: string | null
          job_title?: string
          job_type?: string | null
          max_experience_needed?: number | null
          max_salary?: number | null
          min_experience_needed?: number | null
          min_salary?: number | null
          requirements?: string[] | null
          status?: string | null
          updated_at?: string | null
          working_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
