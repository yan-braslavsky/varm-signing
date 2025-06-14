import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PDFViewer } from '../components/PDFViewer';

describe('PDFViewer', () => {
  it('renders with valid URL', () => {
    const testUrl = 'https://example.com/document.pdf';
    render(<PDFViewer url={testUrl} />);
    
    expect(screen.getByText('Offer Document')).toBeInTheDocument();
    expect(screen.getByTitle('Offer PDF')).toBeInTheDocument();
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
  });

  it('shows fallback message for empty URL', () => {
    render(<PDFViewer url="" />);
    
    expect(screen.getByText('Offer Document')).toBeInTheDocument();
    expect(screen.getByText('Document not available')).toBeInTheDocument();
    expect(screen.getByText('The document will be available after processing')).toBeInTheDocument();
  });

  it('shows fallback message for undefined URL', () => {
    render(<PDFViewer url={undefined as any} />);
    
    expect(screen.getByText('Document not available')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<PDFViewer url="https://example.com/test.pdf" className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows loading state initially', () => {
    render(<PDFViewer url="https://example.com/document.pdf" />);
    
    expect(screen.getByText('Loading document...')).toBeInTheDocument();
  });
});
