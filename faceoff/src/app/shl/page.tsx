import { redirect } from 'next/navigation';
import { CURRENT_SEASON } from '@/app/config/statnet';

// Bare /shl resolves to the current season.
export default function ShlIndexPage() {
  redirect(`/shl/${CURRENT_SEASON.key}`);
}
