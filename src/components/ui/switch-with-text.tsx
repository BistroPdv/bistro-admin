import { cn } from "@/lib/utils";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";

interface SwitchWithTextProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  uncheckText?: React.ReactNode;
  checkText?: React.ReactNode;
  className?: string;
}

const SwitchWithText = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchWithTextProps
>(
  (
    { className, uncheckText = "Não", checkText = "Sim", checked, ...props },
    ref
  ) => (
    <SwitchPrimitives.Root
      className={cn(
        "peer relative flex items-center justify-center h-6 w-[52px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className
      )}
      {...props}
      ref={ref}
      checked={checked}
    >
      <span
        className={cn(
          "absolute text-[10px] font-medium select-none text-white transition-all",
          checked ? "left-1.5" : "right-1.5"
        )}
      >
        {checked ? checkText : uncheckText}
      </span>
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none absolute block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-3 data-[state=unchecked]:-translate-x-3"
        )}
      />
    </SwitchPrimitives.Root>
  )
);
SwitchWithText.displayName = "SwitchWithText";

export { SwitchWithText };
