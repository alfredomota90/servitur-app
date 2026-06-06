import { supabaseUrl } from '@/lib/supabase'

export function getPaymentAttachmentUrl(attachmentPath: string): string {
  if (attachmentPath.startsWith('data:') || attachmentPath.startsWith('blob:')) {
    return attachmentPath
  }
  return `${supabaseUrl}/storage/v1/object/public/payments/${attachmentPath}`
}
