import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Loader2 } from "lucide-react";
import { ToastContainer } from "./components/Toast";

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
const MapPage = lazy(() => import("./pages/MapPage"));
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
const NotFound = lazy(() => import("./pages/NotFound"));

// ─── Page loading fallback ───────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--n950)" }}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--o500)" }} />
        <p className="text-sm font-body" style={{ color: "var(--n400)" }}>Carregando...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public */}
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
        <Route path="/mapa" component={MapPage} />
        <Route path="/academia" component={Academy} />
        <Route path="/academia/:id" component={AcademyDetail} />
        <Route path="/estudios" component={Studios} />
        <Route path="/estudios/:id" component={StudioDetail} />

        {/* User */}
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

        {/* Admin */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/usuarios" component={AdminUsers} />
        <Route path="/admin/ofertas" component={AdminOfferings} />
        <Route path="/admin/oportunidades" component={AdminOpportunities} />
        <Route path="/admin/conteudo" component={AdminContent} />
        <Route path="/admin/logs" component={AdminLogs} />

        {/* Owner */}
        <Route path="/proprietario" component={OwnerDashboard} />

        {/* 404 */}
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
