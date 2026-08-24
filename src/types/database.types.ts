export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          timezone: string
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          timezone?: string
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          timezone?: string
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          icon?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          estimated_minutes: number | null
          due_date: string | null
          routine_run_id: string | null
          routine_template_item_id: string | null
          status: 'todo' | 'in_progress' | 'completed' | 'archived'
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          title: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          estimated_minutes?: number | null
          due_date?: string | null
          routine_run_id?: string | null
          routine_template_item_id?: string | null
          status?: 'todo' | 'in_progress' | 'completed' | 'archived'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          estimated_minutes?: number | null
          due_date?: string | null
          routine_run_id?: string | null
          routine_template_item_id?: string | null
          status?: 'todo' | 'in_progress' | 'completed' | 'archived'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bills: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          name: string
          payee: string | null
          default_amount: number
          currency: string
          first_due_date: string
          schedule_type: 'one_time' | 'monthly'
          is_auto_pay: boolean
          notes: string | null
          archived_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          name: string
          payee?: string | null
          default_amount?: number
          currency?: string
          first_due_date: string
          schedule_type: 'one_time' | 'monthly'
          is_auto_pay?: boolean
          notes?: string | null
          archived_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          name?: string
          payee?: string | null
          default_amount?: number
          currency?: string
          first_due_date?: string
          schedule_type?: 'one_time' | 'monthly'
          is_auto_pay?: boolean
          notes?: string | null
          archived_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
