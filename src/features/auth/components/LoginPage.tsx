import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../core/constants';
import { LoginForm } from './LoginForm';

interface LocationState {
  from?: {
    pathname: string;
  };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = useMemo(() => {
    const state = location.state as LocationState | null;
    return state?.from?.pathname || ROUTES.TASKS;
  }, [location.state]);

  return (
    <div className="auth-page">
      <LoginForm
        onSuccess={() => navigate(redirectPath, { replace: true })}
        onForgotPassword={() => navigate(ROUTES.FORGOT_PASSWORD)}
        onRegister={() => navigate(ROUTES.REGISTER)}
      />
    </div>
  );
}


