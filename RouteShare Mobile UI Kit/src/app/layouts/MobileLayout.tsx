import { Outlet, NavLink, useLocation } from "react-router";
import { Home, Search, Car, User } from "lucide-react";

export function MobileLayout() {
  const location = useLocation();
  const hideNavigation = location.pathname.includes("/trip-details") || location.pathname.includes("/active-ride") || location.pathname.includes("/payment-methods") || location.pathname.includes("/add-payment-method") || location.pathname.includes("/settings") || location.pathname.includes("/offer-ride") || location.pathname.includes("/login") || location.pathname.includes("/signup") || location.pathname.includes("/driver-validation");

  return (
    <div className="mx-auto w-full max-w-[420px] h-screen bg-white flex flex-col relative shadow-2xl overflow-hidden border border-[#F5F5F5] font-sans">
      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto bg-[#F5F5F5] ${hideNavigation ? '' : 'pb-20'}`}>
        <Outlet />
      </main>

      {/* Bottom Navigation Bar */}
      {!hideNavigation && (
        <nav className="absolute bottom-0 w-full bg-white border-t border-[#F5F5F5] px-4 py-3 flex justify-between items-center z-50">
          <NavItem to="/" icon={<Home size={24} />} label="Inicio" />
          <NavItem to="/search" icon={<Search size={24} />} label="Buscar Viaje" />
          <NavItem to="/trips" icon={<Car size={24} />} label="Mis Viajes" />
          <NavItem to="/profile" icon={<User size={24} />} label="Perfil" />
        </nav>
      )}
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center w-full space-y-1 transition-colors ${
          isActive ? "text-[#002855]" : "text-[#8E8E93] hover:text-[#002855]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={isActive ? "text-[#002855]" : "text-[#8E8E93]"}>{icon}</div>
          <span className="text-[10px] font-medium tracking-tight">{label}</span>
        </>
      )}
    </NavLink>
  );
}
