"use client";

import { startTransition, useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { LinkButton } from "./resource-controls";

export type FormState = { errors?: Record<string, string> };

type Option = { value: string; label: string };

export type Field = {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
} & (
  | { type: "text" | "url" | "number" | "password"; defaultValue?: string | number | null }
  | { type: "textarea"; defaultValue?: string | null }
  | { type: "switch"; defaultChecked?: boolean }
  | { type: "select"; options: Option[]; defaultValue?: string | null }
  | { type: "checkboxes"; options: Option[]; defaultValues?: string[] }
);

type Props = {
  fields: Field[];
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  cancelHref: string;
  submitLabel?: string;
  hideCancel?: boolean;
};

export function ResourceForm({
  fields,
  action,
  cancelHref,
  submitLabel = "Salvar",
  hideCancel = false,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    // onSubmit em vez de `action`: o reset automático do React 19 apagaria o
    // que foi digitado quando a validação falha.
    <form
      noValidate
      className="flex max-w-2xl flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      {fields.map((field) => (
        <FieldRow key={field.name} field={field} error={state.errors?.[field.name]} />
      ))}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : submitLabel}
        </Button>
        {hideCancel ? null : (
          <LinkButton href={cancelHref} variant="ghost">
            Cancelar
          </LinkButton>
        )}
      </div>
    </form>
  );
}

function FieldRow({ field, error }: { field: Field; error?: string }) {
  const id = `field-${field.name}`;
  const errorId = `${id}-error`;
  const aria = { "aria-invalid": error ? true : undefined, "aria-describedby": error ? errorId : undefined };

  return (
    <div className="flex flex-col gap-2">
      {field.type === "switch" ? (
        <div className="flex items-center gap-3">
          <Switch
            id={id}
            name={field.name}
            defaultChecked={field.defaultChecked}
            className="data-checked:bg-success"
            {...aria}
          />
          <Label htmlFor={id}>{field.label}</Label>
        </div>
      ) : (
        <Label htmlFor={field.type === "checkboxes" ? undefined : id}>
          {field.label}
          {field.required ? <span aria-hidden> *</span> : null}
        </Label>
      )}

      {field.type === "textarea" ? (
        <Textarea
          id={id}
          name={field.name}
          rows={5}
          required={field.required}
          placeholder={field.placeholder}
          defaultValue={field.defaultValue ?? ""}
          {...aria}
        />
      ) : null}

      {field.type === "text" ||
      field.type === "url" ||
      field.type === "number" ||
      field.type === "password" ? (
        <Input
          id={id}
          name={field.name}
          type={field.type === "number" ? "text" : field.type}
          autoComplete={field.type === "password" || field.name === "email" ? "off" : undefined}
          inputMode={field.type === "number" ? "decimal" : undefined}
          required={field.required}
          placeholder={field.placeholder}
          defaultValue={field.defaultValue ?? ""}
          {...aria}
        />
      ) : null}

      {field.type === "select" ? (
        <select
          id={id}
          name={field.name}
          required={field.required}
          defaultValue={field.defaultValue ?? ""}
          className="h-9 rounded-lg border border-input bg-card px-3 text-sm"
          {...aria}
        >
          <option value="" disabled>
            Selecione
          </option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      {field.type === "checkboxes" ? (
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {field.options.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <Checkbox
                name={field.name}
                value={option.value}
                defaultChecked={field.defaultValues?.includes(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      ) : null}

      {field.hint ? <p className="text-sm text-muted-foreground">{field.hint}</p> : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
