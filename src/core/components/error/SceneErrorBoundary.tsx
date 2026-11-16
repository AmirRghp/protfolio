import { Component, type ErrorInfo, type ReactNode } from "react";

export type SceneErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type SceneErrorBoundaryState = {
  hasError: boolean;
};

/**
 * Top-level error boundary for lazy-loaded 3D/WebGL scenes and chunks.
 * Ensures network or asset decoding failures degrade gracefully without crashing the entire SPA.
 */
export class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

export default SceneErrorBoundary;
