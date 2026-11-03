import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/preact'
import { Marques } from './Marques'

describe('Marques', () => {
  it('perComprovar mostra «⁇ per comprovar»', () => {
    render(<Marques perComprovar />)
    expect(screen.getByText('⁇ per comprovar')).toBeTruthy()
  })
  it('extra mostra «extra»; sense res no mostra res', () => {
    const { container, rerender } = render(<Marques extra />)
    expect(screen.getByText('extra')).toBeTruthy()
    rerender(<Marques />)
    expect(container.textContent).toBe('')
  })
})
