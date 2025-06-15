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
      expect(screen.getByText('Digitale Unterzeichnungsplattform')).toBeInTheDocument()
    }, { timeout: 3000 })

    expect(screen.getByText('W\xE4hlen Sie ein Angebot aus, um den digitalen Unterzeichnungsprozess abzuschlie\xDFen')).toBeInTheDocument()
  })
})
