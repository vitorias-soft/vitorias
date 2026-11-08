"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { deleteResource, type Resource, setPublished } from "@/app/(painel)/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function LinkButton({
  href,
  children,
  ...props
}: { href: string } & Omit<React.ComponentProps<typeof Button>, "render" | "nativeButton">) {
  return (
    <Button render={<Link href={href} />} nativeButton={false} {...props}>
      {children}
    </Button>
  );
}

export function PublishSwitch({
  resource,
  id,
  published,
  label,
}: {
  resource: Resource;
  id: string;
  published: boolean;
  label: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Switch
        checked={published}
        disabled={pending}
        aria-label={`Publicar ${label}`}
        className="data-checked:bg-success"
        onCheckedChange={(checked) =>
          startTransition(async () => {
            const result = await setPublished(resource, id, checked);
            setError(result.error ?? null);
          })
        }
      />
      {error ? (
        <p role="alert" className="max-w-52 text-right text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function DeleteButton({
  resource,
  id,
  label,
}: {
  resource: Resource;
  id: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="icon" aria-label={`Excluir ${label}`}>
            <Trash2 />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir “{label}”?</AlertDialogTitle>
          <AlertDialogDescription>
            O item sai do painel e, na próxima sincronização, do app. Não é possível desfazer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={() => startTransition(() => deleteResource(resource, id))}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
