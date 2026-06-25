import { Navigation, PlusCircle, Search } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Home() {
  return (
    <div className="flex flex-col min-h-full pb-8">
      {/* Header */}
      <div className="bg-[#002855] px-6 pt-12 pb-8 rounded-b-[2rem] shadow-sm relative overflow-hidden">
        {/* Subtle decorative background shape */}
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <div className="w-48 h-48 rounded-full bg-white" />
        </div>
        
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-white text-2xl font-semibold tracking-tight">Bienvenido, Diego</h1>
            <p className="text-white/80 text-sm mt-1">¿A dónde vamos hoy?</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-[#FFB81C] overflow-hidden bg-white/20">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1620400975473-777541fd7add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwbWFsZSUyMHN0dWRlbnQlMjBjYXN1YWwlMjBwcm9maWxlfGVufDF8fHx8MTc4MDYyODU3NXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Perfil"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20 space-y-5">
        
        {/* Main Action Buttons */}
        <div className="flex gap-3">
          <Link to="/search" className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 transition active:scale-95 hover:bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-[#002855]/10 flex items-center justify-center text-[#002855]">
              <Search size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[#1C1C1E] text-sm font-medium">Encontrar viaje</span>
          </Link>
          <Link to="/offer-ride" className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 transition active:scale-95 hover:bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-[#FFB81C]/20 flex items-center justify-center text-[#FFB81C]">
              <PlusCircle size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[#1C1C1E] text-sm font-medium">Ofrecer viaje</span>
          </Link>
        </div>

        {/* Next Trip Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-[#1C1C1E] font-semibold">Tu Próximo Viaje</h2>
            <span className="bg-[#FFB81C]/15 text-[#b38113] text-xs font-semibold px-2 py-1 rounded-md">Hoy, 14:30</span>
          </div>
          <div className="p-5">
            <div className="flex relative pl-2">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200 rounded-full" />
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#002855] mt-1 z-10 border-2 border-white ring-2 ring-[#002855]/20" />
                  <div>
                    <p className="text-[#1C1C1E] font-medium text-sm">Av. Brasil 2950, Valparaíso</p>
                    <p className="text-[#8E8E93] text-xs mt-0.5">Campus Casa Central PUCV</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFB81C] mt-1 z-10 border-2 border-white ring-2 ring-[#FFB81C]/20" />
                  <div>
                    <p className="text-[#1C1C1E] font-medium text-sm">Estación Viña del Mar</p>
                    <p className="text-[#8E8E93] text-xs mt-0.5">Centro Viña del Mar</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden">
                  <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1620400975473-777541fd7add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwbWFsZSUyMHN0dWRlbnQlMjBjYXN1YWwlMjBwcm9maWxlfGVufDF8fHx8MTc4MDYyODU3NXww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Driver"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                <div>
                  <p className="text-[#1C1C1E] text-sm font-medium">Martín (Conductor)</p>
                  <div className="flex items-center text-[#8E8E93] text-xs mt-0.5 gap-1">
                    <CarIcon size={12} />
                    <span>Toyota Yaris Blanco</span>
                  </div>
                </div>
              </div>
              <button className="bg-[#002855] text-white text-xs font-medium px-4 py-2 rounded-lg transition hover:bg-[#001c3d]">
                Ver detalles
              </button>
            </div>
          </div>
        </div>

        {/* Map View */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-[#1C1C1E] font-semibold text-sm">Rutas Universitarias Activas</h2>
            <button className="text-[#002855] text-xs font-medium">Actualizar</button>
          </div>
          <div className="h-40 w-full relative bg-gray-100">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1736117705482-6d897896e077?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwbWFwJTIwbmF2aWdhdGlvbiUyMHN0cmVldCUyMHZpZXd8ZW58MXx8fHwxNzgwNjI4NTcxfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Map View"
              className="w-full h-full object-cover opacity-70"
            />
            {/* Map overlays / markers */}
            <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 bg-[#002855] text-white p-1.5 rounded-full shadow-lg border-2 border-white">
               <Navigation size={14} className="rotate-45" />
            </div>
            <div className="absolute top-1/3 right-1/3 transform -translate-x-1/2 -translate-y-1/2 bg-[#FFB81C] text-[#002855] p-1.5 rounded-full shadow-lg border-2 border-white">
               <Navigation size={14} className="rotate-45" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Simple internal icon to prevent missing import
function CarIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}
