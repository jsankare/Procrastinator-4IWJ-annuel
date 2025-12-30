export default defineNuxtRouteMiddleware(async (to) => {
  // Only guard admin routes
  if (!to.path.startsWith('/admin')) return

  // Only run this middleware on the client (auth store reads localStorage)
  if (!import.meta.client) return

  const { useAuthStore } = await import('~/composables/useAuthStore')
  const authStore = useAuthStore()

  try {
    await authStore.init()
  } catch (err) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  if (!authStore.token?.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  try {
    await authStore.fetchCurrentUser()
  } catch (err) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  const user = authStore.user?.value

  if (!user || user.role !== 'admin') {
    return navigateTo('/')
  }

  return
})
