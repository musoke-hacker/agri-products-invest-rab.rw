import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';

export default async function IndexPage() {
  const user = await getAuthUser();

  if (user) {
    redirect('/home');
  } else {
    redirect('/login');
  }
}
