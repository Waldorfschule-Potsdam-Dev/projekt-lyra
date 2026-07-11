import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  appName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary caught an error in ${this.props.appName || 'an app'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fee2e2', color: '#991b1b', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.5rem' }}>
            {this.props.appName ? `${this.props.appName} Crashed` : 'App Crashed'}
          </h2>
          <p style={{ marginBottom: '1rem' }}>The developers of this app have encountered a syntax or runtime error.</p>
          <pre style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '0.5rem', overflowX: 'auto', maxWidth: '100%', fontSize: '0.875rem', textAlign: 'left' }}>
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
