'use client';

import React, { useState } from 'react';
import { useAuthStore, useNavStore, useLocaleStore } from '@/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ArrowRight, Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuthStore();
  const { navigate } = useNavStore();
  const { locale } = useLocaleStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success(t('auth.welcomeBack', locale));
      } else {
        if (!name.trim()) {
          setError(t('auth.nameRequired', locale));
          setIsLoading(false);
          return;
        }
        await register(email, password, name);
        toast.success(t('auth.accountCreated', locale));
      }
      navigate('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.authFailed', locale));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">AutoTrade Pro</h1>
            <p className="text-sm text-muted-foreground">{t('nav.platform', locale)}</p>
          </div>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/5">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">
              {mode === 'login' ? t('auth.signIn', locale) : t('auth.createAccount', locale)}
            </CardTitle>
            <CardDescription>
              {mode === 'login'
                ? t('auth.enterCredentials', locale)
                : t('auth.getStarted', locale)}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-medium">
                    {t('auth.name', locale)}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 h-10"
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium">
                  {t('auth.email', locale)}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-medium">
                  {t('auth.password', locale)}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.passwordPlaceholder', locale)}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 h-10"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t('auth.terms', locale)}
                </p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full h-10 font-medium"
                disabled={isLoading || !email || !password || (mode === 'register' && !name)}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? t('auth.signIn', locale) : t('auth.createAccount', locale)}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Demo mode button */}
              {mode === 'login' && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 border-primary/30 hover:bg-primary/10"
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const res = await fetch('/api/auth/demo', { method: 'POST' });
                      if (!res.ok) throw new Error('Demo login failed');
                      const data = await res.json();
                      localStorage.setItem('token', data.token);
                      useAuthStore.setState({
                        isAuthenticated: true,
                        userId: data.user.id,
                        email: data.user.email,
                        name: data.user.name,
                        role: data.user.role,
                        token: data.token,
                      });
                      toast.success(t('auth.demoWelcome', locale));
                      navigate('dashboard');
                    } catch (err) {
                      setError(t('auth.demoFailed', locale));
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  {t('auth.demoMode', locale)}
                </Button>
              )}

              <div className="flex items-center gap-2 w-full">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                }}
              >
                {mode === 'login' ? (
                  <>{t('auth.noAccount', locale)} <span className="ml-1 font-semibold text-primary">{t('auth.signUp', locale)}</span></>
                ) : (
                  <>{t('auth.hasAccount', locale)} <span className="ml-1 font-semibold text-primary">{t('auth.signIn', locale)}</span></>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer branding */}
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          {t('auth.secured', locale)} · &copy; {new Date().getFullYear()} AutoTrade Pro
        </p>
      </div>
    </div>
  );
}
