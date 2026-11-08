import { useEffect, useState } from 'react';

import { onContentChanged, readCatalog } from './content-db';
import type { Catalog } from './content-types';

type State =
  | { status: 'loading'; catalog: null }
  | { status: 'error'; catalog: null }
  | { status: 'ready'; catalog: Catalog };

/** Lê o catálogo local e recarrega quando uma sincronização o substitui. */
export function useCatalog(): State {
  const [state, setState] = useState<State>({ status: 'loading', catalog: null });

  useEffect(() => {
    let active = true;
    const load = () => {
      readCatalog()
        .then((catalog) => active && setState({ status: 'ready', catalog }))
        .catch(() => active && setState({ status: 'error', catalog: null }));
    };
    load();
    const unsubscribe = onContentChanged(load);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return state;
}
