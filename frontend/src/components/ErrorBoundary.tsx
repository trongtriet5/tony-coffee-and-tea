'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          padding: '20px',
          textAlign: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '48px',
            maxWidth: '480px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '16px',
            }}>
              😵
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 900,
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}>
              Đã xảy ra lỗi
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '24px',
              lineHeight: 1.6,
            }}>
              {this.state.error?.message || 'Đã có lỗi không mong muốn xảy ra. Vui lòng thử lại.'}
            </p>
            <button
              onClick={this.handleRetry}
              style={{
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: '0.2s',
              }}
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
