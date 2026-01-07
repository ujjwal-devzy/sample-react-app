import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

function renderWithRouter(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('App routing', () => {
  it('renders login page on /login', () => {
    renderWithRouter(['/login']);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  it('renders not found page for unknown routes', () => {
    renderWithRouter(['/unknown-route']);
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });
});


