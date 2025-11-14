import { AppRoute } from "@/routes/AppRoute";
import { useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const location = useLocation();

  // Vérifie si la route est "Home" ("/")
  const isHome = location.pathname === "/";

  return (
    <div
      className={`bg-gradient-background ${
        isHome ? "extra-class-for-home" : ""
      }`}
    >
      <AppRoute />
      
      {/* ToastContainer placé ici une seule fois pour toute l'application */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;