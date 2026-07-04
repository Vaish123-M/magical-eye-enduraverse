import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import * as api from '@/services/api'

vi.mock('axios')

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploadImage sends FormData with file', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    axios.post.mockResolvedValue({ data: { id: 'test-id' } })

    await api.uploadImage(mockFile)

    expect(axios.post).toHaveBeenCalledWith(
      '/inspections/upload',
      expect.any(FormData),
      expect.objectContaining({
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    )
  })

  it('login sends credentials correctly', async () => {
    axios.post.mockResolvedValue({ 
      data: { access_token: 'test-token', token_type: 'bearer' }
    })

    await api.login('testuser', 'password123')

    expect(axios.post).toHaveBeenCalledWith(
      '/auth/login',
      expect.any(URLSearchParams)
    )
  })

  it('register sends user data correctly', async () => {
    axios.post.mockResolvedValue({ 
      data: { access_token: 'test-token', token_type: 'bearer' }
    })

    await api.register('newuser', 'password123')

    expect(axios.post).toHaveBeenCalledWith(
      '/auth/register',
      { username: 'newuser', password: 'password123' }
    )
  })
})
