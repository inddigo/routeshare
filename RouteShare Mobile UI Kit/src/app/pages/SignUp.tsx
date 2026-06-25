import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export function SignUp() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white px-6 font-sans">
      <div className="flex-1 flex flex-col pt-14 pb-8">
        
        {/* Top Section: Header */}
        <div className="mb-8">
          <Link to="/login" className="w-10 h-10 -ml-2 mb-4 rounded-full flex items-center justify-center transition active:bg-gray-100">
            <ArrowLeft size={24} className="text-[#002855]" strokeWidth={2.5} />
          </Link>
          <h1 className="text-[#1C1C1E] text-3xl font-bold tracking-tight">Crea tu cuenta</h1>
          <p className="text-[#8E8E93] text-sm mt-2">Únete a la comunidad de RouteShare</p>
        </div>

        {/* Middle Section: The Registration Form */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          
          {/* Full Name Input */}
          <div>
            <label className="block text-[#1C1C1E] text-sm font-semibold mb-2">
              Nombre completo
            </label>
            <div className="bg-[#F5F5F5] rounded-xl flex items-center px-4 py-3.5 border border-transparent focus-within:border-[#002855] focus-within:bg-white transition-colors">
              <User size={20} className="text-[#8E8E93] mr-3 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Ej. Juan Pérez"
                className="w-full text-[#1C1C1E] font-medium text-base outline-none bg-transparent placeholder-[#8E8E93]"
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-[#1C1C1E] text-sm font-semibold mb-2">
              Correo electrónico
            </label>
            <div className="bg-[#F5F5F5] rounded-xl flex items-center px-4 py-3.5 border border-transparent focus-within:border-[#002855] focus-within:bg-white transition-colors">
              <Mail size={20} className="text-[#8E8E93] mr-3 flex-shrink-0" />
              <input 
                type="email" 
                placeholder="usuario@ejemplo.com"
                className="w-full text-[#1C1C1E] font-medium text-base outline-none bg-transparent placeholder-[#8E8E93]"
              />
            </div>
          </div>

          {/* Phone Input */}
          <div>
            <label className="block text-[#1C1C1E] text-sm font-semibold mb-2">
              Teléfono
            </label>
            <div className="bg-[#F5F5F5] rounded-xl flex items-center px-4 py-3.5 border border-transparent focus-within:border-[#002855] focus-within:bg-white transition-colors">
              <Phone size={20} className="text-[#8E8E93] mr-3 flex-shrink-0" />
              <input 
                type="tel" 
                placeholder="+56 9 0000 0000"
                className="w-full text-[#1C1C1E] font-medium text-base outline-none bg-transparent placeholder-[#8E8E93]"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[#1C1C1E] text-sm font-semibold mb-2">
              Contraseña
            </label>
            <div className="bg-[#F5F5F5] rounded-xl flex items-center px-4 py-3.5 border border-transparent focus-within:border-[#002855] focus-within:bg-white transition-colors">
              <Lock size={20} className="text-[#8E8E93] mr-3 flex-shrink-0" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className="w-full text-[#1C1C1E] font-medium text-base outline-none bg-transparent placeholder-[#8E8E93]"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-[#8E8E93] focus:outline-none hover:text-[#1C1C1E] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="pt-2 pb-1 flex items-start gap-3">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                className="w-5 h-5 rounded-md border-gray-300 text-[#002855] focus:ring-[#002855] bg-[#F5F5F5] transition-colors cursor-pointer accent-[#002855]"
              />
            </div>
            <label htmlFor="terms" className="text-[#8E8E93] text-sm leading-tight cursor-pointer">
              Acepto los <a href="#" className="text-[#002855] font-bold hover:underline">Términos y Condiciones</a>
            </label>
          </div>

          {/* Primary Action */}
          <div className="pt-2">
            <Link to="/" className="w-full bg-[#002855] active:bg-[#001D3D] transition-colors text-white py-4 rounded-xl font-bold text-base flex items-center justify-center shadow-md block text-center">
              Crear cuenta
            </Link>
          </div>
        </form>

        {/* Bottom Section: Alternative Registration & Login */}
        <div className="mt-8 mb-6 flex items-center">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-[#8E8E93] text-sm font-semibold px-4 tracking-wider">O</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <div className="space-y-3">
          <button className="w-full bg-white active:bg-gray-50 transition-colors border border-gray-200 py-3.5 rounded-xl flex items-center justify-center gap-3 text-[#1C1C1E] font-semibold shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Regístrate con Google
          </button>
          
          <button className="w-full bg-white active:bg-gray-50 transition-colors border border-gray-200 py-3.5 rounded-xl flex items-center justify-center gap-3 text-[#1C1C1E] font-semibold shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="w-5 h-5">
              <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            Regístrate con Apple
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-2 pb-4 text-center">
          <p className="text-[#8E8E93] text-sm">
            ¿Ya tienes cuenta? <Link to="/login" className="text-[#002855] font-bold hover:underline">Inicia sesión</Link>
          </p>
        </div>

      </div>
    </div>
  );
}