'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Github, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/lib/auth';
import { getOAuthUrl } from '@/lib/api';

export default function LoginPageClient() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const [email, setEmail] = useState('admin@school.edu');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState(errorParam === 'suspended' ? 'Your account has been suspended.' : '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = await login(email, password);
      window.location.href = `/dashboard/${user.role}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            <GraduationCap className="h-7 w-7 text-blue-600" />
          </div>
          <CardTitle>School Portal</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide text-slate-400">
              <span className="bg-white px-2">or</span>
            </div>
          </div>

          <Link href={getOAuthUrl()} className="block">
            <Button variant="outline" className="w-full">
              <Github className="h-4 w-4" />
              Continue with GitHub
            </Button>
          </Link>

          <p className="mt-4 text-center text-xs text-slate-500">
            Demo: admin@school.edu / admin123
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
