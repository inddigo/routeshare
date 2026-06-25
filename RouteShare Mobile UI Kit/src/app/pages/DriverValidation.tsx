import { ArrowLeft, AlertCircle, Car, UploadCloud, Camera, Lock } from "lucide-react";
import { Link } from "react-router";

export function DriverValidation() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-white font-sans">
      {/* Header (Sub-screen navigation) */}
      <div className="px-6 pt-14 pb-4 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-4">
          <Link to="/profile" className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center transition active:bg-gray-100">
            <ArrowLeft size={24} className="text-[#002855]" strokeWidth={2.5} />
          </Link>
          <h1 className="text-[#1C1C1E] text-2xl font-bold tracking-tight">Verificación de conductor</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Top Banner: Pending Status */}
        <div className="bg-[#FFF3E0] px-6 py-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-[#E65100] flex-shrink-0 mt-0.5" />
          <p className="text-[#E65100] text-sm font-medium leading-snug">
            Acción requerida: Sube tus documentos para activar tu perfil de conductor.
          </p>
        </div>

        <div className="px-6 py-6 space-y-8">
          
          {/* Section 1: Datos del Vehículo */}
          <section>
            <h2 className="text-[#8E8E93] text-xs font-bold tracking-wider mb-4">DATOS DEL VEHÍCULO</h2>
            <div className="space-y-4">
              
              {/* Marca y Modelo */}
              <div>
                <label className="block text-[#1C1C1E] text-sm font-semibold mb-2">
                  Marca y Modelo
                </label>
                <div className="bg-[#F5F5F5] rounded-xl flex items-center px-4 py-3.5 border border-transparent focus-within:border-[#002855] focus-within:bg-white transition-colors">
                  <input 
                    type="text" 
                    placeholder="Ej. Toyota Yaris"
                    className="w-full text-[#1C1C1E] font-medium text-base outline-none bg-transparent placeholder-[#8E8E93]"
                  />
                </div>
              </div>

              {/* Patente */}
              <div>
                <label className="block text-[#1C1C1E] text-sm font-semibold mb-2">
                  Patente
                </label>
                <div className="bg-[#F5F5F5] rounded-xl flex items-center px-4 py-3.5 border border-transparent focus-within:border-[#002855] focus-within:bg-white transition-colors">
                  <input 
                    type="text" 
                    placeholder="Ej. ABCD-12"
                    className="w-full text-[#1C1C1E] font-medium text-base outline-none bg-transparent placeholder-[#8E8E93]"
                  />
                  <Car size={20} className="text-[#8E8E93] ml-3 flex-shrink-0" />
                </div>
              </div>

            </div>
          </section>

          {/* Section 2: Documentos Legales */}
          <section>
            <h2 className="text-[#8E8E93] text-xs font-bold tracking-wider mb-1">DOCUMENTOS REQUERIDOS</h2>
            <p className="text-[#8E8E93] text-sm mb-5 leading-snug">
              Sube fotos claras y legibles. Formatos aceptados: JPG, PNG, PDF.
            </p>

            <div className="space-y-5">
              
              {/* Upload Card 1: Licencia */}
              <div>
                <label className="block text-[#1C1C1E] text-sm font-semibold mb-2">
                  Licencia de Conducir
                </label>
                <button type="button" className="w-full border-2 border-dashed border-[#d1d1d6] bg-[#F5F5F5] rounded-xl px-4 py-8 flex flex-col items-center justify-center gap-3 transition-colors active:bg-[#ebebeb]">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-[#002855]">
                    <Camera size={24} />
                  </div>
                  <span className="text-[#1C1C1E] text-sm font-semibold px-4 text-center">
                    Toca para subir foto<br/><span className="text-[#8E8E93] font-medium">(Anverso y Reverso)</span>
                  </span>
                </button>
              </div>

              {/* Upload Card 2: Padrón */}
              <div>
                <label className="block text-[#1C1C1E] text-sm font-semibold mb-2">
                  Padrón del Vehículo
                </label>
                <button type="button" className="w-full border-2 border-dashed border-[#d1d1d6] bg-[#F5F5F5] rounded-xl px-4 py-8 flex flex-col items-center justify-center gap-3 transition-colors active:bg-[#ebebeb]">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-[#002855]">
                    <UploadCloud size={24} />
                  </div>
                  <span className="text-[#1C1C1E] text-sm font-semibold px-4 text-center">
                    Toca para subir el padrón
                  </span>
                </button>
              </div>

            </div>
          </section>

          {/* Trust & Security Badge */}
          <div className="pt-2 pb-6 flex items-start gap-3 justify-center px-4">
            <Lock size={16} className="text-[#8E8E93] flex-shrink-0 mt-0.5" />
            <p className="text-[#8E8E93] text-xs font-medium text-center leading-relaxed">
              Tus documentos son confidenciales y solo se usan para validación de seguridad.
            </p>
          </div>

        </div>
      </div>

      {/* Primary Action (CTA) */}
      <div className="fixed bottom-0 w-full max-w-[420px] bg-white border-t border-gray-100 p-6 z-20">
        <button className="w-full bg-[#002855] active:bg-[#001D3D] transition-colors text-white py-4 rounded-xl font-bold text-base flex items-center justify-center shadow-md block text-center">
          Enviar para revisión
        </button>
      </div>
    </div>
  );
}