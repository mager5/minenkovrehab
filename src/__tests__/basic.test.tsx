import { render, screen } from '@testing-library/react'

// Basic test to verify testing setup
describe('Basic Test Suite', () => {
  it('should render a simple div', () => {
    render(<div data-testid="test-div">Hello World</div>)
    expect(screen.getByTestId('test-div')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should perform basic assertions', () => {
    expect(1 + 1).toBe(2)
    expect('hello').toBe('hello')
    expect(true).toBeTruthy()
  })

  it('should handle arrays', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })
})