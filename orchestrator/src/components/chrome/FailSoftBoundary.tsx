"use client";

import React from "react";

interface FailSoftBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name?: string;
}

interface FailSoftBoundaryState {
  hasError: boolean;
}

export class FailSoftBoundary extends React.Component<
  FailSoftBoundaryProps,
  FailSoftBoundaryState
> {
  state: FailSoftBoundaryState = { hasError: false };

  static getDerivedStateFromError(): FailSoftBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(
      `Fail-soft boundary suppressed ${this.props.name ?? "optional panel"} error:`,
      error,
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}
