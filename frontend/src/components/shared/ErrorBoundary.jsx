import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // This lifecycle method is called after an error has been thrown by a descendant component.
  // It receives the error that was thrown as a parameter and should return a value to update state.
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  // This lifecycle method is also called after an error has been thrown by a descendant component.
  // It receives two parameters: the error and information about which component threw the error.
  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here.
    // For example: logErrorToMyService(error, errorInfo);
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error: error }); // Optionally store the error object in state
  }

  render() {
    // If an error occurred, render the fallback UI.
    if (this.state.hasError) {
      return (
        <div 
          className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-800 p-4 text-center"
          role="alert"
        >
          <h1 className="text-4xl font-bold mb-4">Oops!</h1>
          <h2 className="text-2xl font-semibold mb-4">Something went wrong.</h2>
          <p className="max-w-md mb-6 text-red-700">
            We're sorry for the inconvenience. Our team has been notified of this issue. Please try refreshing the page or come back later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
          >
            Refresh Page
          </button>
          
          {/* For development, it can be useful to see the error details */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-8 p-4 bg-red-100 border border-red-200 rounded-md text-left max-w-2xl overflow-auto">
              <h3 className="font-bold mb-2">Error Details (Development Mode):</h3>
              <pre className="text-sm whitespace-pre-wrap">
                {this.state.error.toString()}
              </pre>
            </div>
          )}
        </div>
      );
    }

    // If there's no error, render the children components as normal.
    return this.props.children;
  }
}

export default ErrorBoundary;