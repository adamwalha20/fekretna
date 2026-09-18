import { redirect } from 'next/navigation';

export default function PublicDiscoverReelsRedirect() {
  redirect('/app/ideas');
}
