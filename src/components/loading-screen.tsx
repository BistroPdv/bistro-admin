interface LoadingScreenProps {
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingScreen({
  title = "Carregando...",
  description = "Aguarde um momento...",
  size = "md",
}: LoadingScreenProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div
            className={`animate-spin rounded-full border-4 border-muted ${sizeClasses[size]}`}
          ></div>
          <div
            className={`animate-spin rounded-full border-4 border-primary border-t-transparent absolute top-0 left-0 ${sizeClasses[size]}`}
          ></div>
        </div>
      </div>
    </div>
  );
}
