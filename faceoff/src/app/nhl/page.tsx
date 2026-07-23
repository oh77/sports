import { redirect } from 'next/navigation';
import { CURRENT_NHL_SEASON } from '@/app/config/nhl';

// Bare /nhl resolves to the current season.
export default function NhlIndexPage() {
  redirect(`/nhl/${CURRENT_NHL_SEASON.key}`);
}
