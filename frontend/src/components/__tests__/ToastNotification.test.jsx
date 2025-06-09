import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ToastNotification from '../ToastNotification';

describe('ToastNotification', () => {
  it('deve renderizar notificação básica', () => {
    render(
      <ToastNotification
        open={true}
        message="Test message"
        severity="success"
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('deve mostrar progress bar quando showProgress é true', () => {
    render(
      <ToastNotification
        open={true}
        message="Loading..."
        severity="info"
        showProgress={true}
        progress={50}
      />
    );

    expect(screen.getByText('50% concluído')).toBeInTheDocument();
  });

  it('deve mostrar botão retry quando allowRetry é true', () => {
    render(
      <ToastNotification
        open={true}
        message="Error occurred"
        severity="error"
        allowRetry={true}
        retryText="Try Again"
      />
    );

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('deve chamar onRetry quando botão retry é clicado', async () => {
    const mockOnRetry = vi.fn();

    render(
      <ToastNotification
        open={true}
        message="Error occurred"
        severity="error"
        allowRetry={true}
        onRetry={mockOnRetry}
      />
    );

    const retryButton = screen.getByText('Tentar Novamente');
    fireEvent.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onClose quando X é clicado', () => {
    const mockOnClose = vi.fn();

    render(
      <ToastNotification
        open={true}
        message="Test message"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar título quando fornecido', () => {
    render(
      <ToastNotification
        open={true}
        message="Test message"
        title="Test Title"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
}); 