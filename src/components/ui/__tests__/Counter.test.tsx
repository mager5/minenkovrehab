import React from 'react'
import { render, screen } from '@testing-library/react'
import { Counter } from '../Counter'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
       const { initial: _initial, whileInView: _whileInView, viewport: _viewport, transition: _transition, whileHover: _whileHover, ...restProps } = props;
       return <div {...restProps}>{children}</div>;
     },
     p: ({ children, ...props }: any) => {
       const { initial: _initial, whileInView: _whileInView, viewport: _viewport, transition: _transition, ...restProps } = props;
       return <p {...restProps}>{children}</p>;
     },
  },
  useInView: () => true,
  useAnimation: () => ({
    start: jest.fn(),
    set: jest.fn(),
  }),
}))

describe('Counter Component', () => {
  it('renders counter with label', () => {
    render(<Counter value={100} label="Patients Treated" />)
    expect(screen.getByText('Patients Treated')).toBeInTheDocument()
  })

  it('renders with custom delay', () => {
    render(<Counter value={300} label="Treatments" delay={1000} />)
    expect(screen.getByText('Treatments')).toBeInTheDocument()
  })

  it('renders counter component structure', () => {
    render(<Counter value={50} label="Years Experience" plus />)
    expect(screen.getByText('Years Experience')).toBeInTheDocument()
  })
})