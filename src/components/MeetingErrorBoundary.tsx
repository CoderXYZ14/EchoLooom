"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class MeetingErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("MeetingErrorBoundary | Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-red-400 mb-4">
                Meeting Failed
              </h2>
              <p className="text-gray-300 mb-6">
                There was an unexpected error loading the meeting. Please try
                again.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Retry Meeting
                </Button>
                <Button
                  onClick={() => (window.location.href = "/dashboard")}
                  variant="outline"
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </div>
              {this.state.error && (
                <details className="mt-4 text-sm text-gray-400">
                  <summary className="cursor-pointer">Error Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
