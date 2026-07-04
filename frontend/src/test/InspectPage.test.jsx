import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import InspectPage from '@/pages/InspectPage'
import * as api from '@/services/api'

// Mock the API module
vi.mock('@/services/api')

describe('InspectPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders upload interface', () => {
    render(<InspectPage />)
    expect(screen.getByText(/upload image/i)).toBeInTheDocument()
    expect(screen.getByText(/run inspection/i)).toBeInTheDocument()
  })

  it('shows file input and preview area', () => {
    render(<InspectPage />)
    const fileInput = screen.getByLabelText(/upload/i)
    expect(fileInput).toBeInTheDocument()
  })

  it('disables upload button when no file selected', () => {
    render(<InspectPage />)
    const uploadButton = screen.getByText(/run inspection/i)
    expect(uploadButton).toBeDisabled()
  })

  it('enables upload button when file is selected', async () => {
    render(<InspectPage />)
    const fileInput = screen.getByLabelText(/upload/i)
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      const uploadButton = screen.getByText(/run inspection/i)
      expect(uploadButton).not.toBeDisabled()
    })
  })

  it('calls upload API when button is clicked', async () => {
    api.uploadImage.mockResolvedValue({
      data: {
        id: 'test-id',
        status: 'OK',
        prediction: 'no_porosity',
        confidence: 0.95
      }
    })

    render(<InspectPage />)
    const fileInput = screen.getByLabelText(/upload/i)
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      const uploadButton = screen.getByText(/run inspection/i)
      fireEvent.click(uploadButton)
    })

    await waitFor(() => {
      expect(api.uploadImage).toHaveBeenCalledWith(file)
    })
  })

  it('displays prediction result after successful upload', async () => {
    api.uploadImage.mockResolvedValue({
      data: {
        id: 'test-id',
        status: 'OK',
        prediction: 'no_porosity',
        confidence: 0.95
      }
    })

    render(<InspectPage />)
    const fileInput = screen.getByLabelText(/upload/i)
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      const uploadButton = screen.getByText(/run inspection/i)
      fireEvent.click(uploadButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/ok/i)).toBeInTheDocument()
      expect(screen.getByText(/95%/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during upload', async () => {
    api.uploadImage.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({ data: { id: 'test-id', status: 'OK' } }), 100)
    ))

    render(<InspectPage />)
    const fileInput = screen.getByLabelText(/upload/i)
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      const uploadButton = screen.getByText(/run inspection/i)
      fireEvent.click(uploadButton)
    })

    expect(screen.getByText(/processing/i)).toBeInTheDocument()
  })
})
