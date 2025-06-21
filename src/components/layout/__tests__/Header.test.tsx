import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '../Header'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

// Mock Next.js Link and Image
jest.mock('next/link', () => {
  const MockLink = ({ children, ...props }: any) => {
    return <a {...props}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

jest.mock('next/image', () => {
  const MockImage = ({ alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} {...props} />
  }
  MockImage.displayName = 'MockImage'
  return MockImage
})

// Mock BookingModal
jest.mock('../../shared/BookingModal', () => {
  const MockBookingModal = ({ isOpen, onClose: _onClose }: any) => {
    return isOpen ? <div data-testid="booking-modal">Booking Modal</div> : null
  }
  MockBookingModal.displayName = 'MockBookingModal'
  return MockBookingModal
})

describe('Header Component', () => {
  beforeEach(() => {
    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    })
  })

  it('renders header component', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders navigation elements', () => {
    render(<Header />)
    const navElements = screen.getAllByRole('navigation')
    expect(navElements.length).toBeGreaterThan(0)
  })

  it('renders interactive elements', () => {
    render(<Header />)
    // Check that there are buttons in the header
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders links', () => {
    render(<Header />)
    // Check that there are links in the header
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('has proper structure', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
  })

  it('handles scroll events', () => {
    render(<Header />)
    
    // Simulate scroll
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 50,
    })
    
    fireEvent.scroll(window)
    
    // Header should still be present
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})