import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      if (!formData.username) {
        setError('Nazwa użytkownika jest wymagana');
        setLoading(false);
        return;
      }
      result = await register(formData.username, formData.email, formData.password);
    }

    setLoading(false);

    if (result.success) {
      onClose();
      setFormData({ username: '', email: '', password: '' });
    } else {
      setError(result.error);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ username: '', email: '', password: '' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>{isLogin ? 'Zaloguj się' : 'Zarejestruj się'}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Nazwa użytkownika</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required={!isLogin}
                placeholder="Twoja nazwa"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="twoj@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Hasło</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              minLength="6"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Ładowanie...' : (isLogin ? 'Zaloguj' : 'Zarejestruj')}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? 'Nie masz konta?' : 'Masz już konto?'}
          {' '}
          <button onClick={switchMode} className="btn-switch">
            {isLogin ? 'Zarejestruj się' : 'Zaloguj się'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;