import { ArrowLeft, CreditCard, HelpCircle, Lock } from "lucide-react";
import { Link } from "react-router";

export function AddPaymentMethod() {
  return (
    <div className="flex flex-col h-full bg-white font-sans">
      
      {/* Header */}
      <div className="pt-14 pb-4 px-5 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-100">
        <Link to="/payment-methods" className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center transition active:bg-gray-100">
          <ArrowLeft size={24} className="text-[#002855]" strokeWidth={2.5} />
        </Link>
        <h1 className="text-[#1C1C1E] text-lg font-bold tracking-tight absolute left-1/2 -translate-x-1/2">
          Agregar tarjeta
        </h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-32 flex flex-col">
        
        {/* Form Section */}
        <form className="space-y-5 flex-1">
          
          {/* Input 1: Número de tarjeta */}
          <div className="space-y-1.5">
            <label htmlFor="cardNumber" className="block text-[#8E8E93] text-sm font-medium ml-1">
              Número de tarjeta
            </label>
            <div className="relative">
              <input
                type="text"
                id="cardNumber"
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                className="w-full bg-[#F5F5F5] text-[#1C1C1E] placeholder:text-[#8E8E93] text-base rounded-xl py-4 pl-4 pr-12 outline-none focus:ring-2 focus:ring-[#FFB81C]/50 focus:bg-white transition-all font-medium tracking-wide"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <CreditCard size={20} className="text-[#8E8E93]" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Input Row 2: Vencimiento & CVV */}
          <div className="flex gap-4">
            <div className="space-y-1.5 flex-1">
              <label htmlFor="expiry" className="block text-[#8E8E93] text-sm font-medium ml-1">
                Vencimiento
              </label>
              <input
                type="text"
                id="expiry"
                placeholder="MM/AA"
                maxLength={5}
                className="w-full bg-[#F5F5F5] text-[#1C1C1E] placeholder:text-[#8E8E93] text-base rounded-xl py-4 px-4 outline-none focus:ring-2 focus:ring-[#FFB81C]/50 focus:bg-white transition-all font-medium tracking-wide"
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <label htmlFor="cvv" className="flex items-center gap-1.5 text-[#8E8E93] text-sm font-medium ml-1">
                CVV
                <HelpCircle size={14} className="text-[#8E8E93]" />
              </label>
              <input
                type="text"
                id="cvv"
                placeholder="123"
                maxLength={4}
                className="w-full bg-[#F5F5F5] text-[#1C1C1E] placeholder:text-[#8E8E93] text-base rounded-xl py-4 px-4 outline-none focus:ring-2 focus:ring-[#FFB81C]/50 focus:bg-white transition-all font-medium tracking-wide"
              />
            </div>
          </div>

          {/* Input 3: Nombre del titular */}
          <div className="space-y-1.5 pt-2">
            <label htmlFor="cardName" className="block text-[#8E8E93] text-sm font-medium ml-1">
              Nombre del titular
            </label>
            <input
              type="text"
              id="cardName"
              placeholder="Como aparece en la tarjeta"
              className="w-full bg-[#F5F5F5] text-[#1C1C1E] placeholder:text-[#8E8E93] text-base rounded-xl py-4 px-4 outline-none focus:ring-2 focus:ring-[#FFB81C]/50 focus:bg-white transition-all font-medium"
            />
          </div>

        </form>

        {/* Trust & Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <Lock size={14} className="text-[#4CAF50] shrink-0" strokeWidth={2.5} />
          <p className="text-[#8E8E93] text-xs font-medium text-center">
            Tus datos están encriptados y procesados de forma segura.
          </p>
        </div>
      </div>

      {/* Primary Action (CTA) */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-5 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-20 pb-safe">
        <button className="w-full bg-[#002855] active:bg-[#001D3D] transition-colors text-white py-4 rounded-xl font-bold text-base flex items-center justify-center shadow-md">
          Guardar tarjeta
        </button>
      </div>

    </div>
  );
}
