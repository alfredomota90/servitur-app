import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

import { MainErrorFallback } from '@/components/errors/main'

export function ErrorElement() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return <MainErrorFallback error={new Error(`${error.status} ${error.statusText}`)} />
  }

  return <MainErrorFallback error={error instanceof Error ? error : undefined} />
}
