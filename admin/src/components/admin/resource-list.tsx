import { CheckCircle2, Pencil } from "lucide-react";

import type { Resource } from "@/app/(painel)/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { DeleteButton, LinkButton, PublishSwitch } from "./resource-controls";

export type ListItem = {
  id: string;
  badge?: string | null;
  title: string;
  subtitle?: string | null;
  note?: string | null;
  published: boolean;
};

type Props = {
  resource: Resource;
  heading: string;
  newLabel?: string;
  publishedLabel: string;
  hiddenLabel: string;
  savedMessage: string;
  saved: boolean;
  items: ListItem[];
};

export function ResourceList({
  resource,
  heading,
  newLabel,
  publishedLabel,
  hiddenLabel,
  savedMessage,
  saved,
  items,
}: Props) {
  const published = items.filter((item) => item.published);
  const hidden = items.filter((item) => !item.published);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold">{heading}</h1>
        {newLabel ? <LinkButton href={`/${resource}/novo`}>+ {newLabel}</LinkButton> : null}
      </div>

      {saved ? (
        <Alert>
          <CheckCircle2 />
          <AlertDescription>{savedMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Section title={`${publishedLabel} · ${published.length}`} resource={resource} items={published} />
      <Section title={`${hiddenLabel} · ${hidden.length}`} resource={resource} items={hidden} />
    </div>
  );
}

function Section({
  title,
  resource,
  items,
}: {
  title: string;
  resource: Resource;
  items: ListItem[];
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-lg font-bold text-muted-foreground">{title}</h2>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum item.</p> : null}
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card px-4 py-3"
          >
            {item.badge ? (
              <span className="w-28 shrink-0 rounded-lg bg-secondary px-2 py-1.5 text-center font-heading text-xs font-bold text-muted-foreground">
                {item.badge}
              </span>
            ) : null}
            <div className="min-w-48 flex-1">
              <p className="font-heading text-sm font-bold">{item.title}</p>
              {item.subtitle ? (
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              ) : null}
              {item.note ? <p className="text-sm font-medium text-destructive">{item.note}</p> : null}
            </div>
            <PublishSwitch
              resource={resource}
              id={item.id}
              published={item.published}
              label={item.title}
            />
            <LinkButton
              href={`/${resource}/${item.id}`}
              variant="secondary"
              size="icon"
              aria-label={`Editar ${item.title}`}
            >
              <Pencil />
            </LinkButton>
            <DeleteButton resource={resource} id={item.id} label={item.title} />
          </li>
        ))}
      </ul>
    </section>
  );
}
