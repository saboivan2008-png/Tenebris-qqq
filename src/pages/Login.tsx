import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ShieldAlert, LogIn, Key, Mail, UserPlus } from 'lucide-react';

export default function Login() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/admin');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User voluntarily closed popup, do not treat as critical system error
        return;
      }
      console.error(err);
      setError('Prístup zamietnutý. Systémová chyba pri Google prihlásení.');
    }
  };

  const handleEmailSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (isResetMode) {
      if (!email) {
        setError('Zadaj email pre reset hesla.');
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email.trim());
        setMessage('Odkaz na reset hesla bol odoslaný na tvoj email.');
        setIsResetMode(false);
      } catch (err: any) {
        console.error(err);
        setError('Nepodarilo sa odoslať reset hesla.');
      }
      return;
    }

    if (!email || !password) {
      setError('Zadaj email a heslo.');
      return;
    }

    if (password.length < 6) {
      setError('Heslo musí mať aspoň 6 znakov.');
      return;
    }
    
    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        navigate('/admin');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        navigate('/admin');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Nesprávne heslo alebo účet neexistuje. Ak sa prihlasujete prvýkrát, kliknite na "Vytvoriť / Nastaviť heslo".');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Tento účet už existuje. Prihláste sa zadaným heslom alebo použite reset hesla.');
      } else {
        setError('Chyba overenia: ' + (err.message || 'Skontrolujte údaje'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-sans selection:bg-red-600 selection:text-white p-6">
      {/* Background Decorator */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
      
      <div className="w-full max-w-md bg-zinc-900 border-4 border-black p-8 relative z-10 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-black border-2 border-red-600 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tighter text-white text-center mb-2">
          U.S.C Control
        </h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-center text-sm mb-8">
          Authorized Personnel Only
        </p>

        {error && (
          <div className="bg-black border-2 border-red-600 text-red-500 p-4 mb-6 font-bold uppercase text-sm text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-black border-2 border-green-600 text-green-500 p-4 mb-6 font-bold uppercase text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input 
              type="email" 
              placeholder="E-MAIL" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border-2 border-black p-4 pl-12 text-white font-bold uppercase placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>
          
          {!isResetMode && (
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input 
                type="password" 
                placeholder="HESLO" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border-2 border-black p-4 pl-12 text-white font-bold uppercase placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest border-4 border-black hover:bg-red-500 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none flex items-center justify-center gap-3 mt-2"
          >
            {isResetMode ? 'Odoslať Reset Hesla' : isRegisterMode ? 'Vytvoriť Účet & Vstúpiť' : 'Prihlásiť (Heslo)'}
          </button>
        </form>

        <div className="flex flex-wrap justify-between items-center gap-2 mb-6 text-xs font-bold uppercase tracking-widest">
          <button 
            type="button" 
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setIsResetMode(false);
              setError('');
              setMessage('');
            }}
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            {isRegisterMode ? 'Mám už heslo -> Prihlásiť' : '+ Nastaviť / Vytvoriť nové heslo'}
          </button>

          <button 
            type="button" 
            onClick={() => {
              setIsResetMode(!isResetMode);
              setIsRegisterMode(false);
              setError('');
              setMessage('');
            }}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            {isResetMode ? 'Späť' : 'Zabudnuté heslo?'}
          </button>
        </div>

        <div className="relative border-t-2 border-black pt-6">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-900 px-4 text-zinc-500 font-bold uppercase tracking-widest text-xs">
            ALEBO
          </div>
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest border-4 border-black hover:bg-zinc-200 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none flex items-center justify-center gap-3"
          >
            <LogIn className="w-5 h-5" />
            Prihlásiť cez Google
          </button>
        </div>
      </div>
    </div>
  );
}
