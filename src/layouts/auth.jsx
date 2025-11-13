import { Outlet } from "react-router-dom";
import {
  ChartPieIcon,
  UserIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@material-tailwind/react";
import { Navbar, Footer } from "@/widgets/layout";

export function Auth() {
  const navbarRoutes = [

    {
      name: "sign up",
      path: "/auth/sign-up",
      icon: UserPlusIcon,
    },
    {
      name: "sign in",
      path: "/auth/sign-in",
      icon: ArrowRightOnRectangleIcon,
    },
  ];

  return (
    <div className="relative min-h-screen w-full">
      
      {/* C'est ici que SignIn et SignUp s'affichent */}
      <Outlet />
      
      <Footer />
    </div>
  );
}

Auth.displayName = "/src/layout/Auth.jsx";

export default Auth;