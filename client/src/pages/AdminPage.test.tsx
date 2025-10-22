import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminPage } from './AdminPage';
import * as api from '../services/api';

// Mock the API module
vi.mock('../services/api');

describe('AdminPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  it('renders passphrase input form when not authenticated', () => {
    render(<AdminPage />);

    expect(screen.getByLabelText(/passphrase/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('shows "Admin Panel" when admin test succeeds', async () => {
    vi.mocked(api.adminLogin).mockResolvedValue('mock-jwt-token');
    vi.mocked(api.testAdminAuth).mockResolvedValue(true);
    vi.mocked(api.getSightings).mockResolvedValue([]);

    render(<AdminPage />);

    const passphraseInput = screen.getByLabelText(/passphrase/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(passphraseInput, { target: { value: 'test-passphrase' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    expect(api.adminLogin).toHaveBeenCalledWith('test-passphrase');
    expect(api.testAdminAuth).toHaveBeenCalledWith('mock-jwt-token');
  });

  it('shows "Failed to authenticate" when admin test fails', async () => {
    vi.mocked(api.adminLogin).mockResolvedValue('mock-jwt-token');
    vi.mocked(api.testAdminAuth).mockResolvedValue(false);

    render(<AdminPage />);

    const passphraseInput = screen.getByLabelText(/passphrase/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(passphraseInput, { target: { value: 'wrong-passphrase' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to authenticate')).toBeInTheDocument();
    });
  });

  it('shows "Failed to authenticate" when login throws error', async () => {
    vi.mocked(api.adminLogin).mockRejectedValue(new Error('Invalid passphrase'));

    render(<AdminPage />);

    const passphraseInput = screen.getByLabelText(/passphrase/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(passphraseInput, { target: { value: 'wrong-passphrase' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to authenticate')).toBeInTheDocument();
    });
  });

  it('stores token in sessionStorage on successful authentication', async () => {
    vi.mocked(api.adminLogin).mockResolvedValue('mock-jwt-token');
    vi.mocked(api.testAdminAuth).mockResolvedValue(true);
    vi.mocked(api.getSightings).mockResolvedValue([]);

    render(<AdminPage />);

    const passphraseInput = screen.getByLabelText(/passphrase/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(passphraseInput, { target: { value: 'test-passphrase' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    expect(sessionStorage.getItem('adminToken')).toBe('mock-jwt-token');
  });

  it('shows authenticated state if valid token exists in sessionStorage', async () => {
    // Set a token in sessionStorage
    sessionStorage.setItem('adminToken', 'existing-token');
    vi.mocked(api.testAdminAuth).mockResolvedValue(true);
    vi.mocked(api.getSightings).mockResolvedValue([]);

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    expect(api.testAdminAuth).toHaveBeenCalledWith('existing-token');
  });

  it('shows login form if token in sessionStorage is invalid', async () => {
    // Set an invalid token in sessionStorage
    sessionStorage.setItem('adminToken', 'invalid-token');
    vi.mocked(api.testAdminAuth).mockResolvedValue(false);

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/passphrase/i)).toBeInTheDocument();
    });

    // Token should be cleared from sessionStorage
    expect(sessionStorage.getItem('adminToken')).toBeNull();
  });
});
