import { useState } from "react";
import { Leaf, ShieldCheck } from "lucide-react";

import { Link } from "react-router";

export function Trips() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");

  return (
    <div className="flex flex-col min-h-full bg-white">
      {/* Header & Tabs */}
      <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-30 shadow-sm border-b border-gray-50">
        <h1 className="text-[#1C1C1E] text-2xl font-bold tracking-tight mb-5">Mis viajes</h1>
        
        {/* Segmented Control */}
        <div className="flex p-1 bg-[#F5F5F5] rounded-xl border border-gray-100">
          <button 
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === "upcoming" 
                ? "bg-[#002855] text-white shadow-sm" 
                : "bg-transparent text-[#8E8E93] hover:text-[#1C1C1E]"
            }`}
          >
            Próximos
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === "history" 
                ? "bg-[#002855] text-white shadow-sm" 
                : "bg-transparent text-[#8E8E93] hover:text-[#1C1C1E]"
            }`}
          >
            Historial
          </button>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        
        {/* Global Impact Banner */}
        <div className="bg-[#F5F5F5] rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm">
           <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
             <Leaf size={20} className="text-[#FFB81C]" strokeWidth={2.5} />
           </div>
           <p className="text-[#1C1C1E] font-medium text-sm leading-snug">
             Impacto total: <span className="font-bold">15 kg de CO2 ahorrados</span>
           </p>
        </div>

        {/* Tab Content */}
        {activeTab === "upcoming" ? (
          <div className="space-y-4 pb-10">
            <TripCard 
              date="Mañana, 08:00 AM"
              status="Confirmado"
              origin="San Antonio"
              destination="Av. Brasil 2241"
            />
          </div>
        ) : (
          <div className="space-y-4 pb-10">
             <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl">
               <p className="text-[#8E8E93] font-bold text-sm">No hay viajes en tu historial.</p>
               <p className="text-[#8E8E93] text-xs mt-1">Tus viajes pasados aparecerán aquí.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TripCard({ date, status, origin, destination }: { date: string, status: string, origin: string, destination: string }) {
  return (
    <div className="bg-white rounded-[1.5rem] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-gray-100 p-5 transition hover:border-[#002855]/30">
      
      {/* Card Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[#1C1C1E] font-bold text-lg tracking-tight">{date}</h3>
        <span className="bg-[#e6f4ea] text-[#137333] font-bold text-xs px-3 py-1.5 rounded-md tracking-wide uppercase">
          {status}
        </span>
      </div>

      {/* Route Visualization */}
      <div className="flex items-stretch gap-4 mb-6">
         <div className="flex flex-col items-center py-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-white ring-2 ring-gray-100" />
            <div className="w-0.5 flex-1 bg-gray-200 my-1" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#002855] border-2 border-white ring-2 ring-[#002855]/20" />
         </div>
         <div className="flex flex-col justify-between py-0.5 gap-6">
            <div>
              <p className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider mb-0.5">Origen</p>
              <p className="text-sm text-[#1C1C1E] font-bold">{origin}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider mb-0.5">Destino</p>
              <p className="text-sm text-[#1C1C1E] font-bold">{destination}</p>
            </div>
         </div>
      </div>

      {/* Escrow Row */}
      <div className="bg-[#F5F5F5] rounded-xl p-3.5 flex items-center gap-3 mb-5 border border-gray-100">
        <ShieldCheck size={20} className="text-[#002855]" strokeWidth={2.5} />
        <span className="text-[#1C1C1E] text-sm font-bold">Pago en custodia</span>
      </div>

      {/* Action Button */}
      <Link to="/active-ride" className="w-full flex items-center justify-center bg-[#002855] text-white py-4 rounded-xl font-bold text-sm transition hover:bg-[#001c3d] shadow-sm">
        Ver detalles
      </Link>
    </div>
  )
}
