export function TitlePage({
  title,
  description,
  children,
  icon,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold flex gap-2 items-center">
          {icon} {title}
        </h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
