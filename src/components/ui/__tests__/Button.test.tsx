import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, ...props }: any) => {
    return <a {...props}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('renders as disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    
    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders as link when href is provided', () => {
    render(<Button href="/test">Link Button</Button>)
    expect(screen.getByRole('link')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/test')
  })

  it('renders external link with proper attributes', () => {
    render(<Button href="https://example.com" external>External Link</Button>)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})