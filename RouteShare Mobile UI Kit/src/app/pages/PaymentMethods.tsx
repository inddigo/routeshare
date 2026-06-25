import { ArrowLeft, CreditCard, Landmark, Plus } from "lucide-react";
import { Link } from "react-router";

export function PaymentMethods() {
  return (
    <div className="flex flex-col h-full bg-white font-sans">
      
      {/* Header */}
      <div className="pt-14 pb-4 px-5 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-100">
        <Link to="/profile" className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center transition active:bg-gray-100">
          <ArrowLeft size={24} className="text-[#002855]" strokeWidth={2.5} />
        </Link>
        <h1 className="text-[#1C1C1E] text-lg font-bold tracking-tight absolute left-1/2 -translate-x-1/2">
          Métodos de pago
        </h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24 space-y-8">
        
        {/* Section 1: Saldo RouteShare (Wallet/Escrow Balance) */}
        <div className="bg-[#002855] rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
          
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">Saldo disponible</p>
            <h2 className="text-white text-4xl font-bold tracking-tight">$ 12.500 CLP</h2>
          </div>

          <div className="mt-6">
            <button className="text-[#FFB81C] text-sm font-bold tracking-wide transition active:opacity-70">
              Retirar fondos
            </button>
          </div>
        </div>

        {/* Section 2: Tarjetas Vinculadas (Linked Cards) */}
        <div>
          <h3 className="text-[#8E8E93] text-xs font-bold tracking-widest uppercase mb-3 px-1">
            Tarjetas guardadas
          </h3>
          <div className="space-y-3">
            
            {/* Card 1 (Default) */}
            <div className="bg-[#F5F5F5] rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="w-12 h-8 bg-white rounded flex items-center justify-center shrink-0 border border-gray-200 shadow-sm">
                <CreditCard size={20} className="text-[#1C1C1E]" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#1C1C1E] text-sm font-bold tracking-wider">•••• •••• •••• 4242</p>
                <p className="text-[#8E8E93] text-xs mt-0.5">Expira 12/28</p>
              </div>
              <div className="bg-[#4CAF50]/10 border border-[#4CAF50]/20 px-2 py-1 rounded-md shrink-0">
                <span className="text-[#4CAF50] text-[10px] font-bold uppercase tracking-wider">Predeterminado</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F5F5F5] rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm">
              <div className="w-12 h-8 bg-white rounded flex items-center justify-center shrink-0 border border-gray-200 shadow-sm">
                <CreditCard size={20} className="text-[#1C1C1E]" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#1C1C1E] text-sm font-bold tracking-wider">•••• •••• •••• 8810</p>
                <p className="text-[#8E8E93] text-xs mt-0.5">Expira 09/25</p>
              </div>
            </div>

          </div>
        </div>

        {/* Section 3: Cuentas Bancarias (Bank Accounts for Drivers) */}
        <div>
          <h3 className="text-[#8E8E93] text-xs font-bold tracking-widest uppercase mb-3 px-1">
            Cuentas para retiro
          </h3>
          <div className="bg-[#F5F5F5] rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 border border-gray-200 shadow-sm">
              <Landmark size={20} className="text-[#1C1C1E]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#1C1C1E] text-sm font-bold truncate">Cuenta RUT BancoEstado</p>
              <p className="text-[#8E8E93] text-sm mt-0.5 tracking-wider">•••• 5678</p>
            </div>
          </div>
        </div>

      </div>

      {/* Primary Action (CTA) */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-5 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-20">
        <Link to="/add-payment-method" className="w-full bg-[#F5F5F5] hover:bg-gray-200 transition-colors text-[#002855] py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-gray-200 shadow-sm">
          <Plus size={20} strokeWidth={2.5} />
          Agregar nuevo método de pago
        </Link>
      </div>

    </div>
  );
}