import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HTMLInputTypeAttribute, ReactElement } from "react";
import {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
  UseFormStateReturn,
} from "react-hook-form";
import { Checkbox } from "./ui/checkbox";
import {
  FormField as BaseFormField,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  icon?: React.ReactNode;
  type?: HTMLInputTypeAttribute | "select" | "checkbox";
  placeholder?: string;
  options?: { value: string; label: string }[];
  description?: string;
  render?: ({
    field,
    fieldState,
    formState,
  }: {
    field: ControllerRenderProps<T, Path<T>>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<T>;
  }) => ReactElement;
}

export function FormField<T extends FieldValues>(props: FormFieldProps<T>) {
  const {
    control,
    name,
    label,
    icon,
    type = "text",
    placeholder = "",
    render,
    options,
    description,
  } = props;
  return (
    <BaseFormField
      control={control}
      name={name}
      render={({ field, fieldState, formState }) => {
        if (render) {
          return render({ field, fieldState, formState });
        }

        return (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              {icon}
              {label}
            </FormLabel>
            {type === "select" ? (
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
                defaultValue={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === "checkbox" ? (
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                {description && (
                  <FormDescription>{description}</FormDescription>
                )}
              </div>
            ) : (
              <FormControl>
                <Input
                  placeholder={placeholder}
                  type={type as HTMLInputTypeAttribute}
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
            )}
            {type !== "checkbox" && description && (
              <FormDescription>{description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
