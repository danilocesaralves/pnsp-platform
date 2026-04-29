import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-8">
          <div className="flex w-full max-w-2xl flex-col items-center rounded-xl border border-border bg-card p-8 text-center">
            <AlertTriangle size={48} className="mb-6 flex-shrink-0 text-destructive" />

            <h2 className="mb-3 text-2xl font-semibold">Ops! Tivemos uma instabilidade.</h2>
            <p className="mb-6 text-muted-foreground">
              Algo inesperado aconteceu ao carregar esta página. Você pode recarregar e tentar novamente.
            </p>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2",
                "bg-primary text-primary-foreground",
                "hover:opacity-90"
              )}
            >
              <RotateCcw size={16} />
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
