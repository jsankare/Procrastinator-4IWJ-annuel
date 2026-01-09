
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { describe, it, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

describe('POST /api/auth/login (via Nuxt proxy)', () => {
  it('returns token for valid credentials', async () => {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: 'user@example.com', password: 'secret' },
    })

    // The frontend proxy returns the proxied body. Assert shape
    expect(res).toBeDefined()
    // @ts-expect-error
    expect((res as any).success).toBe(true)
    // @ts-expect-error
    expect((res as any).data).toBeDefined()
    // @ts-expect-error
    expect((res as any).data.token).toBe('fake-jwt-token')
  })

  it('returns error body for invalid credentials', async () => {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: 'bad@example.com', password: 'wrong' },
    })

    expect(res).toBeDefined()
    // @ts-expect-error
    expect((res as any).success).toBe(false)
    // @ts-expect-error
    expect((res as any).message).toBe('Invalid email or password')
  })

  it('returns 400 body when missing fields', async () => {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: 'no-password@example.com' },
    })

    expect(res).toBeDefined()
    // @ts-expect-error
    expect((res as any).success).toBe(false)
    // @ts-expect-error
    expect((res as any).message).toBe('Email and password are required')
  })
})
