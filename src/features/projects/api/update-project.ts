import { useMutation, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'

import type { Project } from './get-projects'

const projectColumnMap = {
  clientId: 'client_id',
  name: 'name',
  description: 'description',
  status: 'status',
} satisfies Record<string, string>

export const updateProject = async (id: string, project: Partial<Project>): Promise<void> => {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const [key, column] of Object.entries(projectColumnMap)) {
    const value = project[key as keyof Project]
    if (value !== undefined) updates[column] = value
  }
  const { error } = await supabase.from('projects').update(updates).eq('id', id)
  if (error) throw error
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => updateProject(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })
}
