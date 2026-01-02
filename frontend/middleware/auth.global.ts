export default defineNuxtRouteMiddleware(async (to) => {
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/setup-2fa',
    '/verify-2fa'
  ]

  // Allow access to public routes
  if (publicRoutes.includes(to.path)) {
    return
  }

  // Allow access to invite routes (they have their own auth logic)
  if (to.path.startsWith('/invite/')) {
    return
  }


  const { useAuthStore } = await import('~/composables/useAuthStore')
  const authStore = useAuthStore()

  try {
    await authStore.init()
  } catch (err) {
    console.error('Auth init failed:', err)
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // Check if user has a valid token
  if (!authStore.token?.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // Verify the token is still valid by fetching current user
  try {
    await authStore.fetchCurrentUser()
  } catch (err) {
    console.error('Token validation failed:', err)
    // Clear invalid token and redirect
    authStore.logout()
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // Check if user data exists
  const user = authStore.user?.value
  if (!user) {
    console.error('User data not available')
    authStore.logout()
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // User is authenticated, allow access
  return
})
