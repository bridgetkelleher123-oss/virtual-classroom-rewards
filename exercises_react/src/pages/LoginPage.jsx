import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const response = await fetch('/teachers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const teacher = await response.json();
        localStorage.setItem('teacher', JSON.stringify(teacher));  // remember who is signed in
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError("Can't reach the server. Check that it is running.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <h1>Teacher Sign In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" disabled={busy}>Sign In</button>
      </form>
    </div>
  );
}

export default LoginPage;