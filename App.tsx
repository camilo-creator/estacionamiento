import { useAuth } from "./useAuth";
import LoginForm from "./LoginForm";
import Dashboard from "./Dashboard";

export default function App() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <div style={{ padding: 16 }}>Cargando...</div>;

  if (!user) {
    return <LoginForm onLogin={login} />;
  }

  return <Dashboard uid={user.uid} email={user.email || ""} onLogout={logout} />;
}
