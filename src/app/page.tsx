'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-40">
      <h1 className="text-xl">Welcome to Valiu Tech Home Challenge</h1>
      <div className="flex min-h-screen flex-col items-center justify-start gap-2">
        <Button>
          <Link href="/login">You can login to continue</Link>
        </Button>
        <Button>
          <Link href="/register">
            Does not have an account yet, please register
          </Link>
        </Button>
      </div>
    </main>
  );
}
