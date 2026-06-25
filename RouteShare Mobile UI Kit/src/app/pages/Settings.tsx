import { ArrowLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";

export function Settings() {
  return (
    <div className="flex flex-col h-[100dvh] bg-white font-sans">
      {/* Header */}
      <div className="pt-14 pb-4 px-5 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-100">
        <Link to="/profile" className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center transition active:bg-gray-100">
          <ArrowLeft size={24} className="text-[#002855]" strokeWidth={2.5} />
        </Link>
        <h1 className="text-[#1C1C1E] text-lg font-bold tracking-tight absolute left-1/2 -translate-x-1/2">
          Configuración
        </h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-12 space-y-8">
        
        {/* Section 1: Perfil */}
        <section>
          <h2 className="text-[#8E8E93] text-xs font-bold tracking-widest uppercase mb-3 px-1">
            Perfil
          </h2>
          <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
            <button className="flex items-center justify-between p-4 border-b border-gray-200/60 transition active:bg-gray-200">
              <span className="text-[#1C1C1E] text-sm font-bold">Foto de perfil</span>
              <ChevronRight size={20} className="text-[#8E8E93]" />
            </button>
            <button className="flex items-center justify-between p-4 transition active:bg-gray-200">
              <span className="text-[#1C1C1E] text-sm font-bold">Número de teléfono</span>
              <div className="flex items-center gap-2">
                <span className="text-[#8E8E93] text-sm">+56 9 1234 5678</span>
                <ChevronRight size={20} className="text-[#8E8E93]" />
              </div>
            </button>
          </div>
        </section>

        {/* Section 2: Preferencias */}
        <section>
          <h2 className="text-[#8E8E93] text-xs font-bold tracking-widest uppercase mb-3 px-1">
            Preferencias
          </h2>
          <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200/60">
              <div className="flex-1 pr-4">
                <h3 className="text-[#1C1C1E] text-sm font-bold mb-0.5">Notificaciones de viaje</h3>
                <p className="text-[#8E8E93] text-xs">Avisos sobre conductores y rutas</p>
              </div>
              <button className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-[#002855] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002855] focus:ring-offset-2">
                <span className="translate-x-[22px] inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 border-b border-gray-200/60">
              <div className="flex-1 pr-4">
                <h3 className="text-[#1C1C1E] text-sm font-bold mb-0.5">Alertas de chat</h3>
                <p className="text-[#8E8E93] text-xs">Mensajes de tus compañeros de viaje</p>
              </div>
              <button className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-[#002855] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002855] focus:ring-offset-2">
                <span className="translate-x-[22px] inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex-1 pr-4">
                <h3 className="text-[#1C1C1E] text-sm font-bold mb-0.5">Correos promocionales</h3>
              </div>
              <button className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-[#E5E5EA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#002855] focus:ring-offset-2">
                <span className="translate-x-[2px] inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Privacidad y Seguridad */}
        <section>
          <h2 className="text-[#8E8E93] text-xs font-bold tracking-widest uppercase mb-3 px-1">
            Privacidad
          </h2>
          <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
            <button className="flex items-center justify-between p-4 border-b border-gray-200/60 transition active:bg-gray-200">
              <span className="text-[#1C1C1E] text-sm font-bold">Permisos de ubicación</span>
              <ChevronRight size={20} className="text-[#8E8E93]" />
            </button>
            <button className="flex items-center justify-between p-4 transition active:bg-gray-200">
              <span className="text-[#1C1C1E] text-sm font-bold">Contactos de emergencia</span>
              <ChevronRight size={20} className="text-[#8E8E93]" />
            </button>
          </div>
        </section>

        {/* Section 4: Cuenta */}
        <section>
          <h2 className="text-[#8E8E93] text-xs font-bold tracking-widest uppercase mb-3 px-1">
            Cuenta
          </h2>
          <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
            <button className="flex items-center p-4 transition active:bg-red-50 w-full text-left">
              <span className="text-[#D32F2F] text-sm font-bold">Eliminar cuenta</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}