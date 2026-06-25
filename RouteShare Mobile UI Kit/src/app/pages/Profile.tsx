import { useState } from "react";
import { Link } from "react-router";
import { 
  Mail, 
  Phone, 
  IdCard, 
  ShieldCheck, 
  Settings, 
  CreditCard, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight 
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Profile() {
  const [role, setRole] = useState<"passenger" | "driver">("passenger");

  return (
    <div className="flex flex-col min-h-full bg-white pb-10">
      
      {/* Header & Top Section */}
      <div className="pt-16 pb-8 px-5 flex flex-col items-center justify-center text-center">
        {/* Profile Photo */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#F5F5F5] shadow-sm mb-4 bg-gray-100">
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1539125530496-3ca408f9c2d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbGUlMjBjb2xsZWdlJTIwc3R1ZGVudCUyMHByb2ZpbGUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3ODA2MzAxNDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Joshua Villavicencio"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* User Identity */}
        <h1 className="text-[#1C1C1E] text-2xl font-bold tracking-tight mb-1">Joshua Villavicencio</h1>
        <p className="text-[#8E8E93] text-sm font-medium mb-6">Ingeniería Informática PUCV</p>

        {/* Role Toggle */}
        <div className="bg-[#F5F5F5] p-1.5 rounded-full inline-flex border border-gray-100 shadow-inner">
          <button 
            onClick={() => setRole("passenger")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              role === "passenger" 
                ? "bg-[#002855] text-white shadow-sm" 
                : "text-[#8E8E93] hover:text-[#1C1C1E]"
            }`}
          >
            Pasajero
          </button>
          <button 
            onClick={() => setRole("driver")}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              role === "driver" 
                ? "bg-[#002855] text-white shadow-sm" 
                : "text-[#8E8E93] hover:text-[#1C1C1E]"
            }`}
          >
            Conductor
          </button>
        </div>
      </div>

      <div className="px-5 space-y-8">
        
        {/* Banner: Modo Conductor */}
        {role === "driver" && (
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-[#F5F5F5] mb-2">
            <div>
              <h3 className="text-[#1C1C1E] font-bold text-sm">Convertirse en Conductor</h3>
              <p className="text-[#8E8E93] text-xs mt-1">Gana dinero compartiendo tus viajes</p>
            </div>
            <Link to="/driver-validation" className="bg-[#002855] text-white px-4 py-2 rounded-lg font-bold text-xs transition active:bg-[#001D3D]">
              Activar
            </Link>
          </div>
        )}

        {/* Section 1: Datos Personales */}
        <div>
          <h2 className="text-[#002855] text-xs font-bold tracking-widest uppercase mb-3 px-2">
            Datos Personales
          </h2>
          <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            
            <div className="p-4 border-b border-gray-200/60 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-1">
                <Mail size={18} className="text-[#8E8E93]" />
                <span className="text-[#1C1C1E] text-sm font-bold">Correo</span>
              </div>
              <p className="text-[#8E8E93] text-sm pl-[30px]">joshua.villavicencio@mail.pucv.cl</p>
            </div>
            
            <div className="p-4 border-b border-gray-200/60 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-1">
                <Phone size={18} className="text-[#8E8E93]" />
                <span className="text-[#1C1C1E] text-sm font-bold">Teléfono</span>
              </div>
              <p className="text-[#8E8E93] text-sm pl-[30px]">+56 9 1234 5678</p>
            </div>

            <div className="p-4 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-1">
                <IdCard size={18} className="text-[#8E8E93]" />
                <span className="text-[#1C1C1E] text-sm font-bold">RUT</span>
              </div>
              <div className="flex items-center justify-between pl-[30px]">
                <p className="text-[#8E8E93] text-sm">19.234.567-8</p>
                <div className="flex items-center gap-1.5 bg-[#4CAF50]/15 px-2.5 py-1 rounded-md">
                  <ShieldCheck size={14} className="text-[#4CAF50]" strokeWidth={2.5} />
                  <span className="text-[#4CAF50] text-xs font-bold uppercase tracking-wider">Verificado</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Opciones */}
        <div>
          <h2 className="text-[#002855] text-xs font-bold tracking-widest uppercase mb-3 px-2">
            Opciones
          </h2>
          <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
            
            <Link to="/settings" className="flex items-center justify-between p-4 border-b border-gray-200/60 transition active:bg-gray-200 w-full">
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-[#1C1C1E]" strokeWidth={2} />
                <span className="text-[#1C1C1E] text-sm font-bold">Configuración de cuenta</span>
              </div>
              <ChevronRight size={20} className="text-[#8E8E93]" />
            </Link>
            
            <Link to="/payment-methods" className="flex items-center justify-between p-4 border-b border-gray-200/60 transition active:bg-gray-200 w-full">
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-[#1C1C1E]" strokeWidth={2} />
                <span className="text-[#1C1C1E] text-sm font-bold">Métodos de pago</span>
              </div>
              <ChevronRight size={20} className="text-[#8E8E93]" />
            </Link>

            <button className="flex items-center justify-between p-4 border-b border-gray-200/60 transition active:bg-gray-200">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-[#1C1C1E]" strokeWidth={2} />
                <span className="text-[#1C1C1E] text-sm font-bold">Seguridad y confianza</span>
              </div>
              <ChevronRight size={20} className="text-[#8E8E93]" />
            </button>

            <button className="flex items-center justify-between p-4 transition active:bg-gray-200">
              <div className="flex items-center gap-3">
                <HelpCircle size={20} className="text-[#1C1C1E]" strokeWidth={2} />
                <span className="text-[#1C1C1E] text-sm font-bold">Centro de ayuda</span>
              </div>
              <ChevronRight size={20} className="text-[#8E8E93]" />
            </button>

          </div>
        </div>

        {/* Section 3: Log Out */}
        <div className="pt-4 pb-8 flex justify-center">
          <Link to="/login" className="flex items-center gap-2.5 text-[#D32F2F] bg-[#D32F2F]/5 px-6 py-3 rounded-xl transition active:bg-[#D32F2F]/10 font-bold text-sm">
            <LogOut size={20} strokeWidth={2.5} />
            Cerrar sesión
          </Link>
        </div>

      </div>
    </div>
  );
}