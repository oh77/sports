import { redirect } from 'next/navigation';
import { CURRENT_SEASON } from '@/app/config/statnet';

// Bare /sdhl resolves to the current season.
export default function SdhlIndexPage() {
  redirect(`/sdhl/${CURRENT_SEASON.key}`);
}
