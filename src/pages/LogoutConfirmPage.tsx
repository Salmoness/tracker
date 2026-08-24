import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowRight, Home, Zap } from 'lucide-react'

export const LogoutConfirmPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6 shadow-xl shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-2">Logged Out Successfully</h1>
        <p className="text-slate-400 text-sm mb-8">
          Your active session has been safely closed and all local authentication tokens cleared.
        </p>

        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <Link
            to="/login"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <span>Log In Again</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/"
            className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white font-medium text-sm transition-all flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center space-x-2 text-slate-600 text-xs">
          <Zap className="w-4 h-4 text-indigo-500/60" />
          <span>Tracker Security System</span>
        </div>
      </div>
    </div>
  )
}
