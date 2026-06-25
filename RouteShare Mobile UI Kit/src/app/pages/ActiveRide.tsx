import { ArrowLeft, ShieldAlert, MessageCircle, Share2, MapPin } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function ActiveRide() {
  return (
    <div className="h-full w-full relative bg-gray-200 overflow-hidden font-sans flex flex-col">
      {/* Full Screen Geographical Map Background */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1548345680-f5475ea5df84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb29nbGUlMjBtYXBzJTIwbmF2aWdhdGlvbiUyMGRyaXZpbmclMjBjbGVhbnxlbnwxfHx8fDE3ODA2Mjk5MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Map Background"
          className="w-full h-full object-cover opacity-60"
        />
        {/* Map overlay styling to make it look cleaner and more app-like */}
        <div className="absolute inset-0 bg-[#F5F5F5]/40 mix-blend-overlay" />
        
        {/* Route Line & Vehicle Indicator */}
        <div className="absolute top-[35%] left-[20%] right-[30%] h-1.5 bg-[#002855] rounded-full z-10 rotate-[25deg] shadow-sm flex items-center">
            {/* Origin/Current Location Marker (Car) */}
            <div className="absolute -left-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-[#002855]">
              <CarTopViewIcon size={14} />
            </div>
            {/* Destination Marker */}
            <div className="absolute -right-2 w-4 h-4 rounded-full bg-[#002855] border-[3px] border-white shadow-md" />
        </div>
      </div>

      {/* Top Floating Elements */}
      <div className="absolute top-0 w-full px-5 pt-12 z-20 flex justify-between items-start pointer-events-none">
        <Link to="/trips" className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center text-[#002855] transition hover:scale-105 pointer-events-auto">
          <ArrowLeft size={24} strokeWidth={2.5} />
        </Link>
        
        <button className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center text-[#D32F2F] transition hover:scale-105 pointer-events-auto group relative">
          <ShieldAlert size={22} strokeWidth={2.5} />
          <span className="absolute right-12 bg-white px-3 py-1.5 rounded-lg text-[#D32F2F] font-bold text-xs shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Emergencia
          </span>
        </button>
      </div>

      {/* Bottom Sheet (Active Ride Card) */}
      <div className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-30 flex flex-col max-h-[85vh]">
        
        {/* Pull Indicator */}
        <div className="w-full pt-3 pb-1 flex justify-center cursor-grab">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pb-8 pt-4 overflow-y-auto">
          
          {/* Section 1: Trip Status */}
          <div className="text-center mb-6">
            <h2 className="text-[#1C1C1E] text-2xl font-bold tracking-tight mb-1">Llegando en 15 min</h2>
            <p className="text-[#8E8E93] text-sm font-medium flex items-center justify-center gap-1.5">
              <MapPin size={14} />
              Destino: Av. Brasil 2950, Valparaíso
            </p>
          </div>

          {/* Section 2: Driver & Vehicle */}
          <div className="bg-[#F5F5F5] rounded-2xl p-4 flex items-center gap-4 mb-6 border border-gray-100">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-gray-200">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1620400975473-777541fd7add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwY29sbGVnZSUyMHN0dWRlbnQlMjBzbWlsaW5nJTIwcHJvZmlsZXxlbnwxfHx8fDE3ODA2Mjk1NzR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Martín Gómez"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-[#1C1C1E] font-bold text-lg leading-tight">Martín Gómez</h3>
              <p className="text-[#1C1C1E] text-xs font-semibold mt-1 bg-white inline-block px-2.5 py-1 rounded-md shadow-sm border border-gray-100">
                Toyota Yaris Blanco • <span className="text-[#8E8E93]">ABCD-12</span>
              </p>
            </div>
          </div>

          {/* Section 3: The Security PIN (CRITICAL) */}
          <div className="border-2 border-[#FFB81C]/20 bg-[#FFB81C]/5 rounded-2xl p-5 mb-6 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#FFB81C]" />
            <h4 className="text-[#1C1C1E] font-bold text-sm mb-1 uppercase tracking-wider">PIN de abordaje</h4>
            <p className="text-[#8E8E93] text-xs leading-relaxed mb-4 max-w-[250px] mx-auto">
              Díctale este código al conductor para liberar el pago en custodia
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="bg-white border-2 border-[#FFB81C] w-14 h-16 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-[#1C1C1E] text-3xl font-black">4</span>
              </div>
              <div className="bg-white border-2 border-[#FFB81C] w-14 h-16 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-[#1C1C1E] text-3xl font-black">8</span>
              </div>
              <div className="bg-white border-2 border-[#FFB81C] w-14 h-16 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-[#1C1C1E] text-3xl font-black">2</span>
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex gap-4">
            <button className="flex-1 bg-[#F5F5F5] hover:bg-gray-200 transition-colors py-3.5 rounded-xl flex flex-col items-center justify-center gap-1.5 border border-gray-100">
              <MessageCircle size={22} className="text-[#002855]" />
              <span className="text-[#002855] text-xs font-bold">Contactar</span>
            </button>
            <button className="flex-1 bg-[#F5F5F5] hover:bg-gray-200 transition-colors py-3.5 rounded-xl flex flex-col items-center justify-center gap-1.5 border border-gray-100">
              <Share2 size={22} className="text-[#002855]" />
              <span className="text-[#002855] text-xs font-bold">Compartir ruta</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// Icon representing car from top view
function CarTopViewIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 8C5 6.89543 5.89543 6 7 6H17C18.1046 6 19 6.89543 19 8V16C19 17.1046 18.1046 18 17 18H7C5.89543 18 5 17.1046 5 16V8Z" fill="#002855"/>
      <path d="M7 6V4C7 3.44772 7.44772 3 8 3H16C16.5523 3 17 3.44772 17 4V6" stroke="#002855" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 18V20C7 20.5523 7.44772 21 8 21H16C16.5523 21 17 20.5523 17 20V18" stroke="#002855" strokeWidth="2" strokeLinecap="round"/>
      <path d="M4 10H5V14H4C3.44772 14 3 13.5523 3 13V11C3 10.4477 3.44772 10 4 10Z" fill="#002855"/>
      <path d="M20 10H19V14H20C20.5523 14 21 13.5523 21 13V11C21 10.4477 20.5523 10 20 10Z" fill="#002855"/>
      <rect x="8" y="9" width="8" height="6" rx="1" fill="white" fillOpacity="0.5"/>
    </svg>
  );
}