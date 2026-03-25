import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Public Pages
import Home from "./pages/Home";
import Profiles from "./pages/Profiles";
import ProfileDetail from "./pages/ProfileDetail";
import Offerings from "./pages/Offerings";
import OfferingDetail from "./pages/OfferingDetail";
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
import MapPage from "./pages/MapPage";
import Academy from "./pages/Academy";
import AcademyDetail from "./pages/AcademyDetail";
import Studios from "./pages/Studios";
import StudioDetail from "./pages/StudioDetail";

// Auth / User Pages
import Dashboard from "./pages/Dashboard";
import MyAccount from "./pages/MyAccount";
import CreateProfile from "./pages/CreateProfile";
import EditProfile from "./pages/EditProfile";
import CreateOffering from "./pages/CreateOffering";
import CreateOpportunity from "./pages/CreateOpportunity";
import ImageGenerator from "./pages/ImageGenerator";

// Admin Pages
import AdminPanel from "./pages/admin/AdminPanel";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOfferings from "./pages/admin/AdminOfferings";
import AdminOpportunities from "./pages/admin/AdminOpportunities";
import AdminContent from "./pages/admin/AdminContent";
import AdminLogs from "./pages/admin/AdminLogs";

// Owner Dashboard
import OwnerDashboard from "./pages/owner/OwnerDashboard";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/perfis" component={Profiles} />
      <Route path="/perfis/:id" component={ProfileDetail} />
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

      {/* Admin */}
      <Route path="/admin" component={AdminPanel} />
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
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
