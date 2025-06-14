import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { OffersPage } from '../pages/OffersPage'

describe('OffersPage', () => {
  it('renders the offers page with title', async () => {
    render(
      <MemoryRouter>
        <OffersPage />
      </MemoryRouter>
    )
    
    // Wait for the content to load (after the loading skeleton)
    await waitFor(() => {
      expect(screen.getByText('VARM Digital Signing Platform')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    expect(screen.getByText('Choose an offer to view and complete the digital signing process')).toBeInTheDocument()
  })

  it('displays features section', async () => {
    render(
      <MemoryRouter>
        <OffersPage />
      </MemoryRouter>
    )
    
    // Wait for offers to load
    await waitFor(() => {
      expect(screen.getByText(/Features:/)).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Check if features description is present
    expect(screen.getByText(/Secure digital signing, real-time status updates, mobile-responsive design/)).toBeInTheDocument()
  })
})
