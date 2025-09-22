import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiArrowDownSLine } from "@remixicon/react";

interface GenericPageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
  options?: Array<{ value: number; label: string }>;
  label?: string;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [
  { value: 6, label: "6 por página" },
  { value: 12, label: "12 por página" },
  { value: 24, label: "24 por página" },
  { value: 48, label: "48 por página" },
  { value: 96, label: "96 por página" },
];

export function GenericPageSizeSelector({
  pageSize,
  onPageSizeChange,
  totalItems,
  options = DEFAULT_PAGE_SIZE_OPTIONS,
  label = "Mostrar:",
}: GenericPageSizeSelectorProps) {
  const currentOption = options.find((option) => option.value === pageSize);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            {currentOption?.label || `${pageSize} por página`}
            <RiArrowDownSLine className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onPageSizeChange(option.value)}
              className={pageSize === option.value ? "bg-accent" : ""}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
