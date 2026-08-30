import { lazy, Suspense, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useGetCurrentUser, getGetCurrentUserQueryKey } from '@workspace/api-client-react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import { SiWhatsapp } from 'react-icons/si';

const Home = lazy(() => import('@/pages/home'));
const Products = lazy(() => import('@/pages/products'));
const ProductDetail = lazy(() => import('@/pages/product-detail'));
const ProductDetailDynamic = lazy(() => import('@/pages/product-detail-dynamic'));
const Solutions = lazy(() => import('@/pages/solutions'));
const About = lazy(() => import('@/pages/about'));
const Contact = lazy(() => import('@/pages/contact'));
const GetQuote = lazy(() => import('@/pages/get-quote'));
const DownloadCenter = lazy(() => import('@/pages/download-center'));
const FAQPage = lazy(() => import('@/pages/faq'));
const QualityControl = lazy(() => import('@/pages/quality-control'));
const ReplacementSupport = lazy(() => import('@/pages/replacement-support'));
const SelectionGuide = lazy(() => import('@/pages/selection-guide'));
const Configurator = lazy(() => import('@/pages/selection-guide'));
const Privacy = lazy(() => import('@/pages/privacy'));
const Terms = lazy(() => import('@/pages/terms'));
const Crm = lazy(() => import('@/pages/crm'));

// Defaults tuned for the CRM: v5's out-of-the-box staleTime of 0 means every
// screen mount/remount and every window refocus refetches immediately, which
// multiplies API calls once several staff have the CRM open. A 30s staleTime
// plus disabling refetch-on-focus cuts that down while still keeping data
// fresh enough for day-to-day use; screens with genuinely live data (e.g.
// stock notifications) can opt back into a shorter staleTime per-query.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function AuthInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        {...props}
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#093C71]/30"
      />
    </div>
  );
}

function SignInForm({ prefillEmail, notice }: { prefillEmail?: string; notice?: string | null }) {
  const client = useQueryClient();
  const [email, setEmail] = useState(prefillEmail ?? '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${basePath}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Invalid email or password');
        return;
      }
      await client.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
    } catch {
      setError('Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {notice && (
        <p className="mb-4 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>
      )}
      <AuthInput
        label="Email"
        type="email"
        required
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <AuthInput
        label="Password"
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-[#093C71] focus:ring-[#093C71]/30"
        />
        Remember me on this device
      </label>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-[#093C71] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#072d55] disabled:opacity-60"
      >
        {submitting ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}

function SignUpForm({ onSignedUp }: { onSignedUp: (email: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${basePath}/api/auth/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Could not create account');
        return;
      }
      onSignedUp(email);
    } catch {
      setError('Unable to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <AuthInput
        label="Name (optional)"
        type="text"
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <AuthInput
        label="Email"
        type="email"
        required
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <AuthInput
        label="Password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <AuthInput
        label="Confirm password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-[#093C71] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#072d55] disabled:opacity-60"
      >
        {submitting ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}

function AuthPage() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [signedUpEmail, setSignedUpEmail] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-[380px] max-w-full rounded-lg bg-white p-8 shadow-xl">
        <h1 className="mb-1 text-xl font-bold text-[#093C71]">
          {mode === 'sign-in' ? 'Staff sign in' : 'Create your account'}
        </h1>
        <p className="mb-6 text-sm text-slate-500">
          {mode === 'sign-in'
            ? 'Sign in with your Starshine Drive CRM credentials.'
            : 'Set up your own Starshine Drive CRM login.'}
        </p>

        <div className="mb-6 flex rounded-md bg-slate-100 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode('sign-in')}
            className={`flex-1 rounded px-3 py-1.5 transition-colors ${mode === 'sign-in' ? 'bg-white text-[#093C71] shadow' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('sign-up')}
            className={`flex-1 rounded px-3 py-1.5 transition-colors ${mode === 'sign-up' ? 'bg-white text-[#093C71] shadow' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sign up
          </button>
        </div>

        {mode === 'sign-in' ? (
          <SignInForm
            prefillEmail={signedUpEmail ?? undefined}
            notice={signedUpEmail ? 'Account created. Sign in with your new password.' : null}
          />
        ) : (
          <SignUpForm
            onSignedUp={(email) => {
              setSignedUpEmail(email);
              setMode('sign-in');
            }}
          />
        )}
      </div>
    </div>
  );
}

function ProtectedCrm() {
  const { data, isLoading, isError } = useGetCurrentUser({ query: { queryKey: getGetCurrentUserQueryKey(), retry: false } });
  if (isLoading) return <div className="min-h-screen bg-white" aria-busy="true" />;
  if (isError || !data) return <AuthPage />;
  return <Crm />;
}

function ProductDetailRoute() {
  const { slug } = useParams<{ slug: string }>();
  const [isLegacy, setIsLegacy] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    import('@/data/products').then(({ getProductBySlug }) => {
      if (!cancelled) setIsLegacy(!!getProductBySlug(slug ?? ''));
    });
    return () => { cancelled = true; };
  }, [slug]);
  if (isLegacy === null) return <div className="min-h-screen bg-white" aria-busy="true" />;
  return isLegacy ? <ProductDetail /> : <ProductDetailDynamic />;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);
  return null;
}

function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/+919925001323"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Starshine Drive on WhatsApp"
      title="Chat with Starshine Drive on WhatsApp"
      className="floating-whatsapp group fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(9,60,113,0.26)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#EF6F24]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] floating-whatsapp-pulse" aria-hidden="true" />
      <SiWhatsapp className="relative h-7 w-7 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
    </a>
  );
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-screen bg-white" aria-busy="true" />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:slug" component={ProductDetailRoute} />
          <Route path="/solutions" component={Solutions} />
          <Route path="/solutions/:id" component={Solutions} />
          <Route path="/about" component={About} />
          <Route path="/about/:id" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/support/:id" component={Home} />
          <Route path="/get-quote" component={GetQuote} />
          <Route path="/download-center" component={DownloadCenter} />
          <Route path="/faq" component={FAQPage} />
          <Route path="/quality-control" component={QualityControl} />
          <Route path="/replacement-support" component={ReplacementSupport} />
          <Route path="/selection-guide" component={SelectionGuide} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/crm" component={ProtectedCrm} />
          <Route path="/sign-in/*?" component={AuthPage} />
          <Route path="/configurator" component={Configurator} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <FloatingWhatsApp />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
