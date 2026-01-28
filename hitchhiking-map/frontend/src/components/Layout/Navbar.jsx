import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../Auth/AuthModal';
import AdminPanel from '../Admin/AdminPanel';
import UserPanel from '../User/UserPanel';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);


  return (
   <>
   <nav className="navbar">
      <div className="navbar-brand">
        <h1>Hitchhiking Map</h1>
      </div>
      
      <div className="navbar-menu">
        {user ? (
          <>
          {isAdmin() && (
                <button 
                  onClick={() => setShowAdminPanel(true)} 
                  className="btn-admin"
                >
                  Panel Admina
                </button>
              )}
          {!isAdmin() && (
                <button 
                  onClick={() => setShowUserPanel(true)} 
                  className="btn-user"
                >
                   Panel Użytkownika
                </button>
              )}
            <span className="navbar-user">
              {user.username} {isAdmin() && "★"}
            </span>
            <button onClick={logout} className="btn-logout">
              Wyloguj
            </button>
          </>
        ) : (
          <button onClick={() => setShowAuthModal(true)} className="btn-login">Zaloguj</button>
        )}
      </div>
    </nav>

    <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    {isAdmin() && (
        <AdminPanel
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
          />
      )}
    {user && !isAdmin() && (
        <UserPanel
          isOpen={showUserPanel}
          onClose={() => setShowUserPanel(false)}
        />
      )}
    </>
  );
};

export default Navbar;