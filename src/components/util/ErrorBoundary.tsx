import React from "react";

type Props = {
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error("🧯 ErrorBoundary caught an error", {
      error,
      errorInfo,
      location: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
