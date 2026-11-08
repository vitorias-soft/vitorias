import { useState } from 'react';

import { Screen } from '@/components/screen';
import { Segmented } from '@/components/ui';

import { ReportForm } from './report-form';
import { SavedReports } from './saved-reports';

const TABS = [
  { value: 'first', label: 'Primeira pessoa' },
  { value: 'third', label: 'Terceira pessoa' },
  { value: 'saved', label: 'Salvos' },
] as const;

export function ReportScreen() {
  const [tab, setTab] = useState<'first' | 'third' | 'saved'>('first');

  return (
    <Screen>
      <Segmented options={TABS} value={tab} onChange={setTab} />
      {tab === 'saved' ? <SavedReports /> : <ReportForm key={tab} perspective={tab} />}
    </Screen>
  );
}
