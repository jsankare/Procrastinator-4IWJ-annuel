/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

describe('POST /api/workspaces (via Nuxt proxy)', () => {
  it('returns workspace for valid data', async () => {
    const res = await $fetch('/api/workspaces', {
      method: 'POST',
      body: { name: 'New Workspace' },
    })

    // The frontend proxy returns the proxied body. Assert shape
    expect(res).toBeDefined()
    // @ts-expect-error
    expect((res as any).success).toBe(true)
    // @ts-expect-error
    expect((res as any).data).toBeDefined()
    // @ts-expect-error
    expect((res as any).data.name).toBe('New Workspace')
  })

  it('returns error body for invalid data', async () => {
    const res = await $fetch('/api/workspaces', {
      method: 'POST',
      body: {},
    })

    expect(res).toBeDefined()
    // @ts-expect-error
    expect((res as any).success).toBe(false)
    // @ts-expect-error
    expect((res as any).message).toBe('Workspace name is required')
  })
})
