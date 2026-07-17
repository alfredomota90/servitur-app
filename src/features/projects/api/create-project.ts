import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Project } from './get-projects'

export type CreateProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>

export const createProject = async (input: CreateProjectInput): Promise<Project> => {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      client_id: input.clientId,
      name: input.name,
      description: input.description || null,
    })
    .select()
    .single()
  if (error) throw error
  return {
    id: data.id,
    clientId: data.client_id,
    name: data.name,
    description: data.description || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at || undefined,
  }
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
