import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, SignIn, Show, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';

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
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#093C71',
    colorForeground: '#172033',
    colorMutedForeground: '#64748B',
    colorDanger: '#dc2626',
    colorBackground: '#ffffff',
    colorInput: '#ffffff',
    colorInputForeground: '#172033',
    colorNeutral: '#cbd5e1',
    fontFamily: 'IBM Plex Sans, sans-serif',
    borderRadius: '4px',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-white rounded-lg w-[440px] max-w-full overflow-hidden shadow-xl',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#093C71]',
    headerSubtitle: 'text-slate-500',
    formFieldLabel: 'text-slate-700',
    formButtonPrimary: 'bg-[#093C71] hover:bg-[#072d55] text-white',
    footerActionLink: 'text-[#093C71]',
    footerActionText: 'text-slate-500',
    dividerText: 'text-slate-500',
    formFieldInput: 'border-slate-300',
  },
};

function AuthPage() {
  return <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
    <SignIn routing="hash" fallbackRedirectUrl={`${basePath}/crm`} signUpFallbackRedirectUrl={`${basePath}/crm`} />
  </div>;
}

function ProtectedCrm() {
  return <><Show when="signed-in"><Crm /></Show><Show when="signed-out"><AuthPage /></Show></>;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const previousUserId = useRef<string | null | undefined>(undefined);
  useEffect(() => addListener(({ user }) => {
    const userId = user?.id ?? null;
    if (previousUserId.current !== undefined && previousUserId.current !== userId) queryClient.clear();
    previousUserId.current = userId;
  }), [addListener]);
  return null;
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
          <Route path="/configurator" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProvider
        publishableKey={clerkPubKey}
        proxyUrl={clerkProxyUrl}
        appearance={clerkAppearance}
        signInUrl={`${basePath}/sign-in`}
        routerPush={(to) => window.history.pushState(null, '', stripBase(to))}
        routerReplace={(to) => window.history.replaceState(null, '', stripBase(to))}
      >
        <QueryClientProvider client={queryClient}>
          <ClerkQueryClientCacheInvalidator />
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </WouterRouter>
  );
}

export default App;
