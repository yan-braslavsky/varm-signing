import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PDFViewer } from '../components/PDFViewer';

describe('PDFViewer', () => {
  it('renders with valid URL', () => {
    const testUrl = 'https://example.com/document.pdf';
    render(<PDFViewer url={testUrl} />);
    
    expect(screen.getByText('Angebotsdokument')).toBeInTheDocument();
    expect(screen.getByTitle('Angebots-PDF')).toBeInTheDocument();
    expect(screen.getByText('PDF herunterladen')).toBeInTheDocument();
  });

  it('shows fallback message for empty URL', () => {
    render(<PDFViewer url="" />);
    
    expect(screen.getByText('Angebotsdokument')).toBeInTheDocument();
    expect(screen.getByText('Dokument nicht verfügbar')).toBeInTheDocument();
    expect(screen.getByText('Das Dokument wird nach der Verarbeitung verfügbar sein')).toBeInTheDocument();
  });

  it('shows fallback message for undefined URL', () => {
    render(<PDFViewer url={undefined as any} />);
    
    expect(screen.getByText('Dokument nicht verfügbar')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<PDFViewer url="https://example.com/test.pdf" className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows loading state initially', () => {
    render(<PDFViewer url="https://example.com/document.pdf" />);
    
    expect(screen.getByText('Dokument wird geladen...')).toBeInTheDocument();
  });
});
