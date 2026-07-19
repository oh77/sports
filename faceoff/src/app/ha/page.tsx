import { redirect } from 'next/navigation';
import { CURRENT_SEASON } from '@/app/config/statnet';

// Bare /ha resolves to the current season.
export default function HaIndexPage() {
  redirect(`/ha/${CURRENT_SEASON.key}`);
}
