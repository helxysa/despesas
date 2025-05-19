import LoginForm from "./componentes/Login/Login"
import { PiggyAnimation } from "./componentes/PiggyAnimation"

export default function HomeLogin(){
    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            {/* Left side - Branding and marketing content */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-500 to-green-700 text-white p-8 flex-col justify-center items-center relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white opacity-10"></div>
                        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white opacity-10"></div>
                        <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white opacity-10"></div>
                    </div>
                </div>

                <div className="max-w-md mx-auto space-y-8 text-center relative z-10">
                    <div className="flex justify-center -mt-40">
                        <div>
                            <PiggyAnimation />
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold">Pou<span className="text-green-300">pix</span></h1>
                    <h2 className="text-2xl font-bold text-green-300 animate-pulse">Gerencie suas finanças!</h2>
                    <p className="text-lg bg-green-600/30 p-3 rounded-lg shadow-inner">
                        Organize suas dívidas, economize dinheiro e conquiste seus sonhos financeiros.
                    </p>

                </div>
            </div>

            {/* Right side - Login form */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-background">
                <div className="w-full max-w-md px-4 py-12 md:py-0">
                    <LoginForm />
                </div>
            </div>
        </div>
    )
}
