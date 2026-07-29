import { queryOptions, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import type { Database } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

type ProjectRow = Database['public']['Tables']['projects']['Row']

export const projectSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

export type Project = z.infer<typeof projectSchema>

const rowToProject = (row: ProjectRow): Project => ({
  id: row.id,
  clientId: row.client_id,
  name: row.name,
  description: row.description || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at || undefined,
})

export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase.from('projects').select('*')
  if (error) throw error
  return (data || []).map(rowToProject)
}

export const getProjectsByClientQueryOptions = (clientId: string) =>
  queryOptions({
    queryKey: ['projects', { clientId }],
    queryFn: () => getProjects().then((ps) => ps.filter((p) => p.clientId === clientId)),
  })

export const useProjects = () =>
  useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

export const useProjectsByClient = (clientId?: string) =>
  useQuery({
    queryKey: ['projects', { clientId }],
    queryFn: async () => {
      const all = await getProjects()
      return all.filter((p) => p.clientId === clientId)
    },
    enabled: !!clientId,
  })
