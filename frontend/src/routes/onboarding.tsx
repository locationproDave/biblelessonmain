import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSession } from '@/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import { preferencesAPI } from '@/lib/api'
import { Onboarding } from '@/components/Onboarding'
import { useEffect } from 'react'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

function OnboardingPage() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const { data: onboardingDone } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: preferencesAPI.hasCompletedOnboarding,
    enabled: !!session,
  })

  // Redirect if already completed or not logged in
  useEffect(() => {
    if (onboardingDone === true) {
      navigate({ to: '/lessons' })
    }
    if (session === null) {
      navigate({ to: '/signup' })
    }
  }, [onboardingDone, session, navigate])

  if (!session || onboardingDone !== false) return null

  return <Onboarding onComplete={() => navigate({ to: '/lessons' })} />
}
