import { Calendar, Clock, Search as SearchIcon, Armchair } from "lucide-react";
import { Link } from "react-router";

export function Search() {
  return (
    <div className="flex flex-col min-h-full bg-white">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-30 shadow-sm">
        <h1 className="text-[#1C1C1E] text-2xl font-bold tracking-tight">Buscar viajes</h1>
        <p className="text-[#8E8E93] text-sm mt-1">Encuentra el mejor viaje que se adapte a ti</p>
      </div>

      <div className="px-5 py-6 space-y-8">
        
        {/* Filter Card (Búsqueda) */}
        <div className="bg-[#F5F5F5] rounded-3xl p-5 shadow-sm">
          {/* Location Inputs: Origin & Destination */}
          <div className="relative pl-3 space-y-4">
            {/* Connecting line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-300 rounded-full" />
            
            {/* Origin Input */}
            <div className="relative z-10 flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-1 pl-0">
               <div className="w-10 flex items-center justify-center">
                 <div className="w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-white ring-2 ring-gray-100" />
               </div>
               <input 
                 type="text" 
                 placeholder="Origen"
                 defaultValue="Av. Brasil 2241"
                 className="flex-1 bg-transparent border-none py-3 text-sm font-bold text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none focus:ring-0"
               />
            </div>
            
            {/* Destination Input */}
            <div className="relative z-10 flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-1 pl-0">
               <div className="w-10 flex items-center justify-center">
                 <div className="w-2.5 h-2.5 rounded-full bg-[#002855] border-2 border-white ring-2 ring-[#002855]/20" />
               </div>
               <input 
                 type="text" 
                 placeholder="Destino"
                 className="flex-1 bg-transparent border-none py-3 text-sm font-bold text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none focus:ring-0"
               />
            </div>
          </div>

          <div className="h-px w-full bg-gray-200 my-5" />

          {/* Details Row: Date, Time, Seats */}
          <div className="flex gap-3">
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col items-center justify-center gap-1.5">
              <Calendar size={20} className="text-[#002855]" strokeWidth={2} />
              <span className="text-[10px] text-[#8E8E93] uppercase font-bold tracking-wider">Fecha</span>
              <span className="text-xs font-bold text-[#1C1C1E]">Hoy</span>
            </div>
            
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col items-center justify-center gap-1.5">
              <Clock size={20} className="text-[#002855]" strokeWidth={2} />
              <span className="text-[10px] text-[#8E8E93] uppercase font-bold tracking-wider">Horario</span>
              <span className="text-xs font-bold text-[#1C1C1E]">14:30</span>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col items-center justify-center gap-1.5">
              <Armchair size={20} className="text-[#002855]" strokeWidth={2} />
              <span className="text-[10px] text-[#8E8E93] uppercase font-bold tracking-wider">Asientos</span>
              <span className="text-xs font-bold text-[#1C1C1E]">1</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button className="w-full mt-6 bg-[#FFB81C] text-[#1C1C1E] font-bold text-base py-4 rounded-xl shadow-sm hover:bg-[#e5a519] transition flex items-center justify-center gap-2">
            <SearchIcon size={20} strokeWidth={2.5} />
            Buscar viajes
          </button>
        </div>

        {/* Results List (Viajes disponibles) */}
        <div className="space-y-4 pb-6">
          <h2 className="text-[#1C1C1E] font-bold text-lg tracking-tight">Viajes disponibles</h2>
          
          <RideCard 
             origin="Av. Brasil 2241"
             destination="San Antonio"
             date="Hoy"
             time="14:30"
             seats={3}
          />
          <RideCard 
             origin="Av. Brasil 2241"
             destination="Plaza Sotomayor"
             date="Hoy"
             time="15:15"
             seats={1}
          />
          <RideCard 
             origin="Av. Brasil 2241"
             destination="Viña del Mar"
             date="Hoy"
             time="16:00"
             seats={2}
          />
        </div>

      </div>
    </div>
  );
}

function RideCard({ origin, destination, date, time, seats }: { origin: string, destination: string, date: string, time: string, seats: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 p-4 transition hover:border-[#002855]/30">
      <div className="flex justify-between items-start">
        
        {/* Left Side: Route Visualization */}
        <div className="flex items-stretch gap-3">
           <div className="flex flex-col items-center py-1">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <div className="w-0.5 flex-1 bg-gray-200 my-1" />
              <div className="w-2 h-2 rounded-full bg-[#002855]" />
           </div>
           <div className="flex flex-col justify-between py-0.5 gap-4">
              <p className="text-sm text-[#1C1C1E] font-bold">{origin}</p>
              <p className="text-sm text-[#1C1C1E] font-bold">{destination}</p>
           </div>
        </div>

        {/* Right Side: Details */}
        <div className="flex flex-col items-end gap-2 text-right">
          <div className="flex items-center gap-2 text-[#8E8E93] bg-[#F5F5F5] px-2.5 py-1 rounded-md min-w-[80px] justify-between">
            <Calendar size={14} className="text-[#002855]" />
            <span className="text-xs font-semibold text-[#1C1C1E]">{date}</span>
          </div>
          <div className="flex items-center gap-2 text-[#8E8E93] bg-[#F5F5F5] px-2.5 py-1 rounded-md min-w-[80px] justify-between">
            <Clock size={14} className="text-[#002855]" />
            <span className="text-xs font-semibold text-[#1C1C1E]">{time}</span>
          </div>
          <div className="flex items-center gap-2 text-[#8E8E93] bg-[#F5F5F5] px-2.5 py-1 rounded-md min-w-[80px] justify-between">
            <Armchair size={14} className="text-[#002855]" />
            <span className="text-xs font-semibold text-[#1C1C1E]">{seats}</span>
          </div>
        </div>
        
      </div>
      
      {/* Action Button */}
      <Link to="/trip-details" className="w-full mt-5 bg-[#002855] text-white py-2.5 rounded-xl font-bold text-sm transition hover:bg-[#001c3d] flex items-center justify-center">
        Seleccionar
      </Link>
    </div>
  )
}
