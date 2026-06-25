import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Calendar, 
  Clock, 
  Minus, 
  Plus, 
  Edit3 
} from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function OfferRide() {
  return (
    <div className="flex flex-col h-[100dvh] bg-[#F5F5F5] font-sans">
      
      {/* Header */}
      <div className="pt-14 pb-4 px-5 flex items-center justify-between sticky top-0 bg-white z-20 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <Link to="/" className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center transition active:bg-gray-100">
          <ArrowLeft size={24} className="text-[#002855]" strokeWidth={2.5} />
        </Link>
        <h1 className="text-[#1C1C1E] text-lg font-bold tracking-tight absolute left-1/2 -translate-x-1/2">
          Ofrecer viaje
        </h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        
        {/* Section 1: Mini Map Preview */}
        <div className="w-full h-48 relative bg-gray-200">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxjYWUlMjBtYXB8ZW58MHx8fHwxNzgxNjA4MjM4fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Map Preview"
            className="w-full h-full object-cover opacity-80 mix-blend-multiply"
          />
          {/* Faded overlay for cleaner look */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/40" />
          
          {/* Fake route line overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-24 pointer-events-none">
            <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
              <path 
                d="M 20,80 Q 80,80 100,50 T 180,20" 
                fill="none" 
                stroke="#002855" 
                strokeWidth="4" 
                strokeLinecap="round" 
                className="drop-shadow-md"
              />
              <circle cx="20" cy="80" r="6" fill="#1C1C1E" stroke="white" strokeWidth="3" />
              <circle cx="180" cy="20" r="8" fill="#FFB81C" stroke="white" strokeWidth="3" />
            </svg>
          </div>
        </div>

        {/* Form Container */}
        <div className="px-5 -mt-6 relative z-10 space-y-4">
          
          {/* Section 2: Configuración de Ruta (Route Card) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="relative pl-8">
              
              {/* Connecting Line Graphic */}
              <div className="absolute left-2.5 top-6 bottom-6 w-0.5 bg-gray-200" />
              
              {/* Origen Input */}
              <div className="relative mb-5">
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-white">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1C1C1E]" />
                </div>
                <label className="block text-[#8E8E93] text-[11px] font-bold tracking-widest uppercase mb-1">
                  Origen
                </label>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <input 
                    type="text" 
                    placeholder="San Antonio (Centro)" 
                    defaultValue="San Antonio (Centro)"
                    className="flex-1 text-[#1C1C1E] font-medium text-base outline-none bg-transparent"
                  />
                  <Edit3 size={16} className="text-[#8E8E93] ml-2" />
                </div>
              </div>

              {/* Destino Input */}
              <div className="relative">
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-white">
                  <Navigation size={14} className="text-[#FFB81C] fill-[#FFB81C]" />
                </div>
                <label className="block text-[#8E8E93] text-[11px] font-bold tracking-widest uppercase mb-1">
                  Destino
                </label>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <input 
                    type="text" 
                    placeholder="Av. Brasil 2950, Valparaíso" 
                    defaultValue="Av. Brasil 2950, Valparaíso"
                    className="flex-1 text-[#1C1C1E] font-medium text-base outline-none bg-transparent"
                  />
                  <MapPin size={16} className="text-[#8E8E93] ml-2" />
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Detalles del Viaje */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-6">
            
            {/* Date & Time Row */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[#8E8E93] text-[11px] font-bold tracking-widest uppercase mb-2">
                  Fecha
                </label>
                <div className="bg-[#F5F5F5] rounded-xl flex items-center px-4 py-3 border border-transparent focus-within:border-[#FFB81C]/30 focus-within:bg-white transition-colors">
                  <Calendar size={18} className="text-[#8E8E93] mr-3" />
                  <input 
                    type="text" 
                    defaultValue="16/06/2026"
                    className="w-full text-[#1C1C1E] font-medium text-sm outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-[#8E8E93] text-[11px] font-bold tracking-widest uppercase mb-2">
                  Hora de salida
                </label>
                <div className="bg-[#F5F5F5] rounded-xl flex items-center px-4 py-3 border border-transparent focus-within:border-[#FFB81C]/30 focus-within:bg-white transition-colors">
                  <Clock size={18} className="text-[#8E8E93] mr-3" />
                  <input 
                    type="text" 
                    defaultValue="07:15 AM"
                    className="w-full text-[#1C1C1E] font-medium text-sm outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Seats Stepper */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-5">
              <div>
                <h3 className="text-[#1C1C1E] font-bold text-sm">Asientos disponibles</h3>
                <p className="text-[#8E8E93] text-xs mt-0.5">Espacio libre en el auto</p>
              </div>
              
              <div className="flex items-center gap-4 bg-[#F5F5F5] rounded-full p-1.5">
                <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 text-[#002855] active:bg-gray-50 transition">
                  <Minus size={18} strokeWidth={2.5} />
                </button>
                <span className="text-[#1C1C1E] font-bold text-lg min-w-[20px] text-center">3</span>
                <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 text-[#002855] active:bg-gray-50 transition">
                  <Plus size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

          </div>

          {/* Section 4: Aporte */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-[#8E8E93] text-[11px] font-bold tracking-widest uppercase mb-4 text-center">
              Aporte sugerido por pasajero
            </h3>
            
            <div className="flex flex-col items-center">
              <input 
                type="text" 
                defaultValue="$ 2.000 CLP"
                className="text-4xl font-bold text-[#1C1C1E] text-center w-full outline-none bg-transparent"
              />
              <div className="w-24 h-0.5 bg-gray-200 mt-2 mb-4" />
              
              <div className="bg-[#4CAF50]/10 px-4 py-2.5 rounded-lg flex items-center justify-center w-full">
                <p className="text-[#4CAF50] text-xs font-medium text-center">
                  Este monto será retenido en custodia por la app
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Primary Action (CTA) */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-5 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-20 pb-safe">
        <button className="w-full bg-[#002855] active:bg-[#001D3D] transition-colors text-white py-4 rounded-xl font-bold text-base flex items-center justify-center shadow-md relative overflow-hidden">
          <span className="relative z-10">Publicar viaje</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full active:translate-y-0 transition-transform" />
        </button>
      </div>

    </div>
  );
}