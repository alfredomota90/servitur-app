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
          requires_papeleria: boolean
          entity_type: string
          status: string
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
          requires_papeleria?: boolean
          entity_type?: string
          status?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          billing_interval?: number | null
          last_trip_date?: string | null
          logo_url?: string | null
          requires_papeleria?: boolean
          entity_type?: string
          status?: string
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
          project_id: string | null
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
          cfdi_uuid: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          project_id?: string | null
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
          cfdi_uuid?: string | null
        }
        Update: {
          id?: string
          client_id?: string | null
          project_id?: string | null
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
          cfdi_uuid?: string | null
        }
      }
      requirement_items: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          category: string | null
          applies_to: string
          entity_type: string
          has_expiry: boolean
          has_file: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          category?: string | null
          applies_to: string
          entity_type?: string
          has_expiry?: boolean
          has_file?: boolean
          sort_order?: number
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          category?: string | null
          applies_to?: string
          entity_type?: string
          has_expiry?: boolean
          has_file?: boolean
          sort_order?: number
        }
      }
      requirement_subitems: {
        Row: {
          id: string
          item_id: string
          code: string
          name: string
          sort_order: number
        }
        Insert: {
          id?: string
          item_id: string
          code: string
          name: string
          sort_order?: number
        }
        Update: {
          id?: string
          item_id?: string
          code?: string
          name?: string
          sort_order?: number
        }
      }
      client_vehicles: {
        Row: {
          id: string
          client_id: string
          brand: string
          model: string
          year: number | null
          plate: string | null
          serial_number: string | null
          policy_number: string | null
          seats: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          brand: string
          model: string
          year?: number | null
          plate?: string | null
          serial_number?: string | null
          policy_number?: string | null
          seats?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          brand?: string
          model?: string
          year?: number | null
          plate?: string | null
          serial_number?: string | null
          policy_number?: string | null
          seats?: number | null
          notes?: string | null
        }
      }
      client_drivers: {
        Row: {
          id: string
          client_id: string
          name: string
          license_number: string | null
          license_expiry: string | null
          phone: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          license_number?: string | null
          license_expiry?: string | null
          phone?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          license_number?: string | null
          license_expiry?: string | null
          phone?: string | null
          notes?: string | null
        }
      }
      client_documents: {
        Row: {
          id: string
          client_id: string
          item_id: string
          subitem_id: string | null
          vehicle_id: string | null
          driver_id: string | null
          file_url: string | null
          notes: string | null
          expiry_date: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          client_id: string
          item_id: string
          subitem_id?: string | null
          vehicle_id?: string | null
          driver_id?: string | null
          file_url?: string | null
          notes?: string | null
          expiry_date?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          item_id?: string
          subitem_id?: string | null
          vehicle_id?: string | null
          driver_id?: string | null
          file_url?: string | null
          notes?: string | null
          expiry_date?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          client_id: string
          name: string
          description: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          description?: string | null
          status?: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          description?: string | null
          status?: string
        }
      }
      client_item_overrides: {
        Row: {
          id: string
          client_id: string
          item_id: string
          is_na: boolean
        }
        Insert: {
          id?: string
          client_id: string
          item_id: string
          is_na?: boolean
        }
        Update: {
          id?: string
          client_id?: string
          item_id?: string
          is_na?: boolean
        }
      }
    }
  }
}
