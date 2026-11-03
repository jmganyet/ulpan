import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/preact'
import { App } from './app'

describe('App', () => {
  it('mostra el títol', () => {
    render(<App />)
    expect(screen.getByText('Hebreu del màster')).toBeTruthy()
  })
})
