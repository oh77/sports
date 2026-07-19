import { redirect } from 'next/navigation';
import { CURRENT_CHL_SEASON } from '@/app/config/chl';

// Bare /chl resolves to the current season.
export default function ChlIndexPage() {
  redirect(`/chl/${CURRENT_CHL_SEASON.key}`);
}
