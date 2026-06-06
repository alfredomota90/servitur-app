import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          billing_interval: number | null
          last_trip_date: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          billing_interval?: number | null
          last_trip_date?: string | null
          logo_url?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          billing_interval?: number | null
          last_trip_date?: string | null
          logo_url?: string | null
        }
      }
      trips: {
        Row: {
          id: string
          client_id: string | null
          from_location: string
          to_location: string
          date: string
          price: number
          frequency: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          from_location: string
          to_location: string
          date: string
          price: number
          frequency?: string
          notes?: string | null
        }
        Update: {
          id?: string
          client_id?: string | null
          from_location?: string
          to_location?: string
          date?: string
          price?: number
          frequency?: string
          notes?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          invoice_id: string | null
          amount: number
          method: string
          reference: string | null
          attachment_path: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          invoice_id?: string | null
          amount: number
          method: string
          reference?: string | null
          attachment_path?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          invoice_id?: string | null
          amount?: number
          method?: string
          reference?: string | null
          attachment_path?: string | null
          created_at?: string | null
        }
      }
      invoices: {
        Row: {
          id: string
          client_id: string | null
          period: string
          total: number
          status: string
          created_at: string
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_attachment_path: string | null
          payment_id: string | null
          updated_at: string | null
          trip_date: string | null
          from_location: string | null
          to_location: string | null
          frequency: string | null
          notes: string | null
          serie_folio: string | null
          rfc_receptor: string | null
          receptor_name: string | null
          invoice_description: string | null
          total_mxn: number | null
          certification_date: string | null
          xml_path: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          period: string
          total: number
          status?: string
          payment_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_attachment_path?: string | null
          updated_at?: string | null
          trip_date?: string | null
          from_location?: string | null
          to_location?: string | null
          frequency?: string | null
          notes?: string | null
          serie_folio?: string | null
          rfc_receptor?: string | null
          receptor_name?: string | null
          invoice_description?: string | null
          total_mxn?: number | null
          certification_date?: string | null
          xml_path?: string | null
        }
        Update: {
          id?: string
          client_id?: string | null
          period?: string
          total?: number
          status?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_attachment_path?: string | null
          payment_id?: string | null
          updated_at?: string | null
          trip_date?: string | null
          from_location?: string | null
          to_location?: string | null
          frequency?: string | null
          notes?: string | null
          serie_folio?: string | null
          rfc_receptor?: string | null
          receptor_name?: string | null
          invoice_description?: string | null
          total_mxn?: number | null
          certification_date?: string | null
          xml_path?: string | null
        }
      }
    }
  }
}
