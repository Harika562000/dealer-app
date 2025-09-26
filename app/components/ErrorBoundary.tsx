import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: (string | number)[];
  resetOnPropsChange?: boolean;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service
    this.setState({
      error,
      errorInfo,
    });

    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);

    // In development, you might want to show an alert
    if (__DEV__) {
      Alert.alert(
        'Development Error',
        `${error.name}: ${error.message}`,
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'Reset', 
            style: 'destructive',
            onPress: () => this.resetError()
          }
        ]
      );
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (resetKey, idx) => prevResetKeys[idx] !== resetKey
      );

      if (hasResetKeyChanged) {
        this.resetError();
      }
    }

    // Reset error boundary when any prop changes (if enabled)
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetError();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback component if provided
      if (Fallback) {
        return <Fallback error={error} resetError={this.resetError} errorInfo={errorInfo || undefined} />;
      }

      // Default error fallback UI
      return (
        <DefaultErrorFallback 
          error={error} 
          resetError={this.resetError} 
          errorInfo={errorInfo || undefined}
        />
      );
    }

    return children;
  }
}

// Default Error Fallback Component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError, 
  errorInfo 
}) => {
  const handleSendReport = () => {
    // In a real app, you would send this to your error reporting service
    const errorReport = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log('Error Report:', errorReport);
    
    // Simulate sending to error service
    Alert.alert(
      'Report Sent',
      'Thank you for helping us improve the app!',
      [{ text: 'OK', onPress: resetError }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={64} color="#e74c3c" />
        
        <Text style={styles.title}>Oops! Something went wrong</Text>
        
        <Text style={styles.message}>
          We encountered an unexpected error. Don&apos;t worry, this has been logged and we&apos;re working to fix it.
        </Text>

        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Information:</Text>
            <Text style={styles.debugText}>{error.name}: {error.message}</Text>
            {error.stack && (
              <Text style={styles.debugStack} numberOfLines={5}>
                {error.stack}
              </Text>
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={resetError}>
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleSendReport}>
            <Ionicons name="paper-plane-outline" size={20} color="#171C8F" />
            <Text style={styles.secondaryButtonText}>Send Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Specialized Error Boundaries for different contexts

// Screen-level error boundary
export const ScreenErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.log('Screen Error:', error.message);
      // Log to crash reporting service
    }}
    resetOnPropsChange={true}
  >
    {children}
  </ErrorBoundary>
);

// Component-level error boundary with custom fallback
export const ComponentErrorBoundary: React.FC<{ 
  children: React.ReactNode;
  componentName?: string;
}> = ({ children, componentName = 'Component' }) => (
  <ErrorBoundary
    fallback={({ error, resetError }) => (
      <View style={styles.componentError}>
        <Text style={styles.componentErrorText}>
          {componentName} failed to load
        </Text>
        <TouchableOpacity onPress={resetError} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )}
  >
    {children}
  </ErrorBoundary>
);

// Async error boundary for handling async errors
export const AsyncErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [asyncError, setAsyncError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setAsyncError(new Error(`Async Error: ${event.reason}`));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (asyncError) {
    return (
      <DefaultErrorFallback 
        error={asyncError} 
        resetError={() => setAsyncError(null)} 
      />
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginVertical: 16,
  },
  message: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  debugContainer: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#e74c3c',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  debugStack: {
    fontSize: 10,
    color: '#7f8c8d',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#171C8F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#171C8F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#171C8F',
    fontSize: 16,
    fontWeight: '600',
  },
  componentError: {
    backgroundColor: '#fee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 8,
  },
  componentErrorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#171C8F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryText: {
    color: 'white',
    fontSize: 12,
  },
});

export default ErrorBoundary;