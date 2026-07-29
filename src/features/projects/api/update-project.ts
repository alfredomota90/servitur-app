import { useMutation, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'

import type { Project } from './get-projects'

export const updateProject = async (id: string, project: Partial<Project>): Promise<void> => {
  const { error } = await supabase
    .from('projects')
    .update({
      name: project.name,
      description: project.description || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => updateProject(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })
}
