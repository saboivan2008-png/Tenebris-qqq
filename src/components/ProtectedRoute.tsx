import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ReactNode, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  useEffect(() => {
    if (!currentUser || !currentUser.email) {
      setIsAuthorized(false);
      return;
    }

    const emailNorm = currentUser.email.trim().toLowerCase();
    
    // Hlavny Super Admin
    if (emailNorm === 'usc31@auru.space') {
      setIsAuthorized(true);
      return;
    }

    // Overenie ci je v zozname autorizovanych adminov z AdminTeamManagement
    const checkAdminList = async () => {
      try {
        const q = query(
          collection(db, 'authorized_admins'),
          where('email', '==', emailNorm),
          where('status', '==', 'active')
        );
        const snap = await getDocs(q);
        setIsAuthorized(!snap.empty);
      } catch (err) {
        console.error('Admin auth check error:', err);
        // Fallback: ak je to zakladny superadmin
        setIsAuthorized(emailNorm === 'usc31@auru.space');
      }
    };

    checkAdminList();
  }, [currentUser]);
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-mono font-bold uppercase tracking-widest p-6 text-center">
        <p className="text-zinc-500 animate-pulse">Overovanie bezpečnostných oprávnení...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-black uppercase tracking-widest p-6 text-center">
        <div>
          <h1 className="text-4xl text-red-600 mb-4">ACCESS DENIED</h1>
          <p className="text-zinc-500 mb-6">Tento účet ({currentUser.email}) nemá oprávnenie pre vstup do U.S.C. Centrály.</p>
          <a href="/login" className="inline-block px-6 py-3 bg-red-600 text-white text-xs font-bold border-2 border-black">
            Prepnúť Účet
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
