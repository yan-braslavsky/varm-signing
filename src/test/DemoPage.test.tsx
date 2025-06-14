import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { DemoPage } from '../pages/DemoPage'

describe('DemoPage', () => {
  it('renders the demo page with title', async () => {
    render(
      <MemoryRouter>
        <DemoPage />
      </MemoryRouter>
    )
    
    // Wait for the content to load (after the loading skeleton)
    await waitFor(() => {
      expect(screen.getByText('VARM Digital Signing Demo')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    expect(screen.getByText('Choose an offer to test the digital signing experience')).toBeInTheDocument()
  })

  it('displays demo features section', async () => {
    render(
      <MemoryRouter>
        <DemoPage />
      </MemoryRouter>
    )
    
    // Wait for offers to load
    await waitFor(() => {
      expect(screen.getByText(/Demo Features:/)).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Check if demo features description is present
    expect(screen.getByText(/Realistic API delays, error handling, mobile-responsive design/)).toBeInTheDocument()
  })

  it('shows app features section', async () => {
    render(
      <MemoryRouter>
        <DemoPage />
      </MemoryRouter>
    )
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('🎯 App Features')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    expect(screen.getByText('Core Functionality')).toBeInTheDocument()
    expect(screen.getByText('Technical Features')).toBeInTheDocument()
  })
})
