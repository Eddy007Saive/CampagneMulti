import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { Home } from "@/pages/dashboard/home";
import { 
  Create as NewProduit, 
  liste as Produit, 
  CampaignDetailDashboard, 
  CampaignContactsInterface,
  EditCampaign 
} from "@/pages/Campagne";
import { 
  CreateContact as NewContact, 
  listeContacts as Contacts 
} from "@/pages/Contacts";
import { 
  LinkedInConfigInterface,
  UserGuideInterface,
  NotificationsInterface 
} from "@/pages/Configuration";
import { SignIn, SignUp } from "@/pages/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { useConfigurationCheck as RequireConfiguration  } from "@/hooks/useConfigurationCheck";

export function AppRoute() {
  return (
    <Routes>
      {/* Routes Dashboard - PROTÉGÉES + VÉRIFICATION CONFIG */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RequireConfiguration>
              <Dashboard />
            </RequireConfiguration>
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<Home />} />
        <Route path="campagne" element={<Produit />} />
        <Route path="nouvelle/campagne" element={<NewProduit />} />
        <Route path="campagne/contacts/create/:campaignId" element={<NewContact />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="campagne/:id" element={<CampaignDetailDashboard />} />
        
        {/* Page de configuration - accessible sans vérification */}
        <Route path="configuration" element={<LinkedInConfigInterface />} />
        
        <Route path="campagne/contacts/:id" element={<CampaignContactsInterface />} />
        <Route path="campagne/edit/:id" element={<EditCampaign />} />
        <Route path="guide" element={<UserGuideInterface />} />
        <Route path="Notification" element={<NotificationsInterface />} />
        <Route index element={<Navigate to="home" replace />} />
      </Route>

      {/* Routes Auth - PUBLIQUES */}
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        }
      >
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route index element={<Navigate to="sign-in" replace />} />
      </Route>

      {/* Redirections globales */}
      <Route 
        path="/" 
        element={<Navigate to="/dashboard/home" replace />} 
      />
      <Route 
        path="*" 
        element={<Navigate to="/dashboard/home" replace />} 
      />
    </Routes>
  );
}

export default AppRoute;