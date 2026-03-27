import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function IndexPage() {
  const user = await getAuthUser();

  if (user) {
    if (user.role === 'ADMIN') {
      redirect('/admin');
    } else {
      redirect('/home');
    }
  } else {
    redirect('/login');
  }
}
