import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as api from '@/services/api'

const { mockHttp } = vi.hoisted(() => ({
  mockHttp: {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    post: vi.fn(),
  },
}))

vi.mock('axios', () => ({
  default: { create: vi.fn(() => mockHttp) },
}))

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploadImage sends FormData with file', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    mockHttp.post.mockResolvedValue({ data: { id: 'test-id' } })

    await api.uploadImage(mockFile)

    expect(mockHttp.post).toHaveBeenCalledWith(
      '/inspections/upload',
      expect.any(FormData)
    )
  })

  it('login sends credentials correctly', async () => {
    mockHttp.post.mockResolvedValue({
      data: { access_token: 'test-token', token_type: 'bearer' }
    })

    await api.login('testuser', 'password123')

    expect(mockHttp.post).toHaveBeenCalledWith(
      '/auth/token',
      expect.any(URLSearchParams),
      expect.objectContaining({ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }),
    )
  })

  it('register sends user data correctly', async () => {
    mockHttp.post.mockResolvedValue({
      data: { access_token: 'test-token', token_type: 'bearer' }
    })

    await api.register('newuser', 'password123')

    expect(mockHttp.post).toHaveBeenCalledWith(
      '/auth/register',
      { username: 'newuser', password: 'password123' }
    )
  })
})
