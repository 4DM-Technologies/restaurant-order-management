import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, RefreshCcw } from 'lucide-react';

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

export default class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Route render error:', error);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-soroco-cream flex flex-col items-center justify-center px-6">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-soroco-amber rounded-full flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-soroco-espresso">
              Soroco House
            </span>
          </div>

          <div className="w-16 h-16 bg-soroco-linen rounded-full flex items-center justify-center mb-7">
            <RefreshCcw className="w-7 h-7 text-soroco-mocha" />
          </div>

          <div className="text-center max-w-md">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-soroco-charcoal mb-3">
              Something went wrong.
            </h1>
            <p className="font-body text-soroco-mocha text-base mb-8 leading-relaxed">
              This page hit an unexpected error. Retry, or head back to the
              menu to keep browsing.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button type="button" onClick={this.handleRetry} className="btn-primary">
                <RefreshCcw className="w-4 h-4" />
                Retry
              </button>
              <Link to="/menu" className="btn-ghost">
                Back to Menu
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}