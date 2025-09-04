import { useAuthService } from '../hooks/useAuthService';

export default function LandingPage() {
  const { login } = useAuthService();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <img 
          src="/cover.png" 
          alt="Game Trove" 
          className="w-full h-auto max-w-md mx-auto mb-8 rounded-lg shadow-2xl"
        />
        
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to Game Trove
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Your ultimate game collection management tool. Track, organize, and discover your favorite games across all platforms.
          </p>
        </div>

        <button
          onClick={() => login()}
          className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
        >
          Login to Continue
        </button>
      </div>
    </div>
  );
}