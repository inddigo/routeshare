import { ArrowLeft, Star, Calendar, Clock, Armchair, Navigation, MapPin, Banknote, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function TripDetails() {
  return (
    <div className="flex flex-col min-h-full bg-[#F5F5F5] relative pb-32">
      
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-50 shadow-sm flex items-center gap-4 border-b border-gray-50">
        <Link to="/search" className="text-[#002855] transition hover:opacity-70 p-1">
          <ArrowLeft size={24} strokeWidth={2.5} />
        </Link>
        <h1 className="text-[#1C1C1E] text-xl font-bold tracking-tight">Detalles del viaje</h1>
      </div>

      {/* Map Section (Upper 40%) */}
      <div className="h-64 w-full relative bg-gray-200">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHJvYWRtYXAlMjB2aXN1YWxpemF0aW9uJTIwYXBwfGVufDF8fHx8MTc4MDYyOTU2OXww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Map Route"
          className="w-full h-full object-cover opacity-80 mix-blend-multiply"
        />
        {/* Overlay gradient to blend map into content slightly */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F5F5F5]/60 pointer-events-none" />

        {/* Route Line overlay on Map */}
        <div className="absolute top-[40%] left-1/4 right-1/4 h-1 bg-[#002855] rounded-full flex items-center justify-between z-10 shadow-sm rotate-12">
            <div className="w-4 h-4 rounded-full bg-gray-400 border-[3px] border-white shadow-md relative -left-1" />
            <div className="w-4 h-4 rounded-full bg-[#002855] border-[3px] border-white shadow-md relative -right-1" />
        </div>
      </div>

      {/* Driver Details Card (Over Map Bottom Edge) */}
      <div className="px-5 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0 bg-gray-100">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1620400975473-777541fd7add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwY29sbGVnZSUyMHN0dWRlbnQlMjBzbWlsaW5nJTIwcHJvZmlsZXxlbnwxfHx8fDE3ODA2Mjk1NzR8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Martín Gómez"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-0.5">
              <h2 className="text-[#1C1C1E] text-lg font-bold">Martín Gómez</h2>
              <div className="flex items-center gap-1 bg-[#FFB81C]/10 px-2 py-0.5 rounded-md">
                <Star size={14} className="text-[#FFB81C] fill-[#FFB81C]" />
                <span className="text-[#FFB81C] font-bold text-xs">4.8/5.0</span>
              </div>
            </div>
            <p className="text-[#8E8E93] text-sm font-medium">Ingeniería PUCV</p>
            <p className="text-[#1C1C1E] text-xs font-semibold mt-1.5 flex items-center gap-1.5">
               <CarIcon size={12} />
               Toyota Yaris Blanco
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5 space-y-5">
        
        {/* Structured Trip Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {/* Group 1: Timeline */}
          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <Calendar size={18} className="text-[#002855]" />
              <span className="text-[#1C1C1E] text-sm font-bold">Hoy</span>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <Clock size={18} className="text-[#002855]" />
              <span className="text-[#1C1C1E] text-sm font-bold">14:30</span>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="flex flex-col items-center gap-1.5 flex-1 relative">
              <Armchair size={18} className="text-[#002855]" />
              <span className="text-[#1C1C1E] text-sm font-bold">3 libres</span>
            </div>
          </div>

          {/* Group 2: Points */}
          <div className="pt-5 flex items-stretch gap-4">
             <div className="flex flex-col items-center py-2">
                <div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white ring-2 ring-gray-100 relative z-10 flex items-center justify-center" />
                <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                <div className="w-3 h-3 rounded-full bg-[#002855] border-2 border-white ring-2 ring-[#002855]/20 relative z-10" />
             </div>
             
             <div className="flex flex-col justify-between py-1 gap-6 flex-1">
                <div>
                  <p className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Navigation size={10} className="text-gray-400" /> Punto de Encuentro
                  </p>
                  <p className="text-sm text-[#1C1C1E] font-bold leading-tight">San Antonio</p>
                  <p className="text-xs text-[#8E8E93] mt-0.5">Av. Centenario 120, San Antonio</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin size={10} className="text-[#002855]" /> Punto de Parada
                  </p>
                  <p className="text-sm text-[#1C1C1E] font-bold leading-tight">Av. Brasil 2950</p>
                  <p className="text-xs text-[#8E8E93] mt-0.5">Valparaíso, Campus Casa Central PUCV</p>
                </div>
             </div>
          </div>
        </div>

        {/* Payment/Escrow Section */}
        <div>
          <h3 className="text-[#1C1C1E] font-bold text-sm tracking-tight mb-3 px-1">Seguridad y Pago</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                  <Banknote size={16} className="text-[#1C1C1E]" />
                </div>
                <span className="text-[#1C1C1E] font-bold text-sm">Aporte sugerido</span>
              </div>
              <span className="text-[#1C1C1E] font-bold text-lg">2.000 CLP</span>
            </div>

            <div className="p-4 bg-[#FFB81C]/5">
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="text-[#FFB81C] mt-0.5 shrink-0" strokeWidth={2.5} />
                <div>
                  <p className="text-[#1C1C1E] font-bold text-sm">Pago en custodia garantizado</p>
                  <p className="text-[#8E8E93] text-xs mt-1 leading-snug">
                    Tu aporte se mantiene seguro y solo se libera al conductor cuando confirmas tu llegada con tu PIN de viaje.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Other Passengers */}
        <div>
          <h3 className="text-[#1C1C1E] font-bold text-sm tracking-tight mb-3 px-1">Pasajeros confirmados</h3>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1.5">
               <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
                  <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1506863530036-1efeddceb993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBzdHVkZW50JTIwbmF0dXJhbCUyMGxpZ2h0aW5nJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzgwNjI5NTcyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Elena"
                    className="w-full h-full object-cover"
                  />
               </div>
               <span className="text-xs font-semibold text-[#1C1C1E]">Elena</span>
            </div>
            
            {/* Empty seat placeholder */}
            <div className="flex flex-col items-center gap-1.5 opacity-50">
               <div className="w-12 h-12 rounded-full border border-dashed border-gray-300 bg-[#F5F5F5] flex items-center justify-center">
                  <Armchair size={16} className="text-gray-400" />
               </div>
               <span className="text-xs font-medium text-[#8E8E93]">Libre</span>
            </div>
          </div>
        </div>

      </div>

      {/* Primary Action (CTA) - Fixed at bottom */}
      <div className="fixed bottom-0 w-full max-w-[420px] bg-white border-t border-gray-100 p-5 pb-safe z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <button className="w-full bg-[#FFB81C] text-[#1C1C1E] py-4 rounded-xl font-bold text-lg shadow-sm transition hover:bg-[#e5a519] active:scale-[0.98]">
          Solicitar viaje
        </button>
      </div>

    </div>
  );
}

// Internal icon to prevent missing import
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