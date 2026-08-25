import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
          <span className="material-symbols-outlined text-[40px] text-error">error</span>
          <h1 className="text-headline-md text-on-surface">Something went wrong</h1>
          <p className="max-w-sm text-body-md text-on-surface-variant">
            This page ran into an unexpected error. Reloading usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary px-4 py-2 text-label-md text-on-primary hover:opacity-90"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
