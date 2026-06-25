import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white px-6 font-sans">
      <div className="flex-1 flex flex-col pt-16 pb-8">
        
        {/* Top Section: Branding & Welcome */}
        <div className="text-center mt-8 mb-10">
          <h1 className="text-[#002855] text-4xl font-extrabold tracking-tight">RouteShare</h1>
          <h2 className="text-[#1C1C1E] text-2xl font-semibold mt-8">Bienvenido de nuevo</h2>
          <p className="text-[#8E8E93] text-sm mt-2">Inicia sesión para continuar tu viaje</p>
        </div>

        {/* Middle Section: The Form */}
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          
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
            
            <div className="text-right mt-3">
              <a href="#" className="text-[#002855] text-sm font-semibold hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          {/* Primary Action */}
          <div className="pt-2">
            <Link to="/" className="w-full bg-[#002855] active:bg-[#001D3D] transition-colors text-white py-4 rounded-xl font-bold text-base flex items-center justify-center shadow-md block text-center">
              Iniciar sesión
            </Link>
          </div>
        </form>

        {/* Bottom Section: Social Login & Registration */}
        <div className="mt-10 mb-6 flex items-center">
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
            Continuar con Google
          </button>
          
          <button className="w-full bg-white active:bg-gray-50 transition-colors border border-gray-200 py-3.5 rounded-xl flex items-center justify-center gap-3 text-[#1C1C1E] font-semibold shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="w-5 h-5">
              <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            Continuar con Apple
          </button>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 pb-4 text-center">
          <p className="text-[#8E8E93] text-sm">
            ¿No tienes cuenta? <Link to="/signup" className="text-[#002855] font-bold hover:underline">Regístrate</Link>
          </p>
        </div>

      </div>
    </div>
  );
}