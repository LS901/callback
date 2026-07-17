import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { TechQuestionsClient } from './TechQuestionsClient';

export default async function TechQuestionsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return <TechQuestionsClient />;
}
