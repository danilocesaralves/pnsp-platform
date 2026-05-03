import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Loader2 } from "lucide-react";
import { ToastContainer } from "./components/Toast";
import { useAuth } from "@/_core/hooks/useAuth";

// ─── Lazy-loaded pages (code splitting) ─────────────────────────────────────
const Home = lazy(() => import("./pages/Home"));
const Profiles = lazy(() => import("./pages/Profiles"));
const ProfileDetail = lazy(() => import("./pages/ProfileDetail"));
const ProfileBySlug = lazy(() => import("./pages/ProfileBySlug"));
const EntrarPage = lazy(() => import("./pages/EntrarPage"));
const CadastrarPage = lazy(() => import("./pages/CadastrarPage"));
const Offerings = lazy(() => import("./pages/Offerings"));
const OfferingDetail = lazy(() => import("./pages/OfferingDetail"));
const Opportunities = lazy(() => import("./pages/Opportunities"));
const OpportunityDetail = lazy(() => import("./pages/OpportunityDetail"));
const MapaVivo = lazy(() => import("./pages/MapaVivo"));
const Academy = lazy(() => import("./pages/Academy"));
const AcademyDetail = lazy(() => import("./pages/AcademyDetail"));
const Studios = lazy(() => import("./pages/Studios"));
const StudioDetail = lazy(() => import("./pages/StudioDetail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyAccount = lazy(() => import("./pages/MyAccount"));
const CreateProfile = lazy(() => import("./pages/CreateProfile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const CreateOffering = lazy(() => import("./pages/CreateOffering"));
const CreateOpportunity = lazy(() => import("./pages/CreateOpportunity"));
const ImageGenerator = lazy(() => import("./pages/ImageGenerator"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminPanel = lazy(() => import("./pages/admin/AdminPanel"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminOfferings = lazy(() => import("./pages/admin/AdminOfferings"));
const AdminOpportunities = lazy(() => import("./pages/admin/AdminOpportunities"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminLogs = lazy(() => import("./pages/admin/AdminLogs"));
const OwnerDashboard = lazy(() => import("./pages/owner/OwnerDashboard"));
const Messages = lazy(() => import("./pages/Messages"));
const Bookings = lazy(() => import("./pages/Bookings"));
const Contracts = lazy(() => import("./pages/Contracts"));
const Sponsors = lazy(() => import("./pages/Sponsors"));
const Payments = lazy(() => import("./pages/Payments"));
const Marketing = lazy(() => import("./pages/Marketing"));
const Community = lazy(() => import("./pages/Community"));
const Memories = lazy(() => import("./pages/Memories"));
const FAQ = lazy(() => import("./pages/FAQ"));
const AgencyDashboard = lazy(() => import("./pages/AgencyDashboard"));
const PreLaunch = lazy(() => import("./pages/PreLaunch"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ─── Page loading fallback ───────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <Loader2 style={{ width: 32, height: 32, color: "#d4a817", animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.40)", fontFamily: "var(--font-body)" }}>Carregando...</p>
      </div>
    </div>
  );
}

// ─── Admin guard — redireciona se não autenticado ou sem permissão ────────────
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) { setLocation("/entrar"); return; }
    const ok = user?.role === "admin" || user?.role === "owner" || user?.email === "composisamba@gmail.com";
    if (!ok) setLocation("/");
  }, [loading, isAuthenticated, user?.role, user?.email]);

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return null;
  const ok = user?.role === "admin" || user?.role === "owner" || user?.email === "composisamba@gmail.com";
  if (!ok) return null;
  return <>{children}</>;
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* ── Público — funciona sem login ─────────────────────────────────── */}
        <Route path="/" component={Home} />
        <Route path="/perfis" component={Profiles} />
        <Route path="/explorar" component={Profiles} />
        <Route path="/perfil/:slug" component={ProfileBySlug} />
        <Route path="/perfis/:id" component={ProfileDetail} />
        <Route path="/entrar" component={EntrarPage} />
        <Route path="/cadastrar" component={CadastrarPage} />
        <Route path="/ofertas" component={Offerings} />
        <Route path="/ofertas/:id" component={OfferingDetail} />
        <Route path="/oportunidades" component={Opportunities} />
        <Route path="/oportunidades/:id" component={OpportunityDetail} />
        <Route path="/mapa" component={MapaVivo} />
        <Route path="/faq" component={FAQ} />
        <Route path="/academia" component={Academy} />
        <Route path="/academia/:id" component={AcademyDetail} />
        <Route path="/estudios" component={Studios} />
        <Route path="/estudios/:id" component={StudioDetail} />
        <Route path="/pre-lancamento" component={PreLaunch} />

        {/* ── Usuário autenticado (redirecionam internamente se não logado) ── */}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/minha-conta" component={MyAccount} />
        <Route path="/criar-perfil" component={CreateProfile} />
        <Route path="/editar-perfil/:id" component={EditProfile} />
        <Route path="/criar-oferta" component={CreateOffering} />
        <Route path="/criar-oportunidade" component={CreateOpportunity} />
        <Route path="/criar-imagem" component={ImageGenerator} />
        <Route path="/mensagens" component={Messages} />
        <Route path="/negociacoes" component={Bookings} />
        <Route path="/contratos" component={Contracts} />
        <Route path="/patrocinadores" component={Sponsors} />
        <Route path="/pagamentos" component={Payments} />
        <Route path="/marketing" component={Marketing} />
        <Route path="/comunidade" component={Community} />
        <Route path="/memorias" component={Memories} />
        <Route path="/agencia" component={AgencyDashboard} />

        {/* ── Admin — exige autenticação + role admin/owner ─────────────────── */}
        <Route path="/admin">{() => <AdminGuard><AdminDashboard /></AdminGuard>}</Route>
        <Route path="/admin/painel">{() => <AdminGuard><AdminPanel /></AdminGuard>}</Route>
        <Route path="/admin/usuarios">{() => <AdminGuard><AdminUsers /></AdminGuard>}</Route>
        <Route path="/admin/ofertas">{() => <AdminGuard><AdminOfferings /></AdminGuard>}</Route>
        <Route path="/admin/oportunidades">{() => <AdminGuard><AdminOpportunities /></AdminGuard>}</Route>
        <Route path="/admin/conteudo">{() => <AdminGuard><AdminContent /></AdminGuard>}</Route>
        <Route path="/admin/logs">{() => <AdminGuard><AdminLogs /></AdminGuard>}</Route>
        <Route path="/proprietario">{() => <AdminGuard><OwnerDashboard /></AdminGuard>}</Route>

        {/* ── 404 ─────────────────────────────────────────────────────────── */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
          <ToastContainer />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
