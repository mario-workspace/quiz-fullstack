import { Suspense } from 'react';
import LoginPageClient from './login-client';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginPageClient />
    </Suspense>
  );
}
