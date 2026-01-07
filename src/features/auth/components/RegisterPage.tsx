import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../core/constants';
import { RegisterForm } from './RegisterForm';

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <RegisterForm
        onSuccess={() => navigate(ROUTES.TASKS)}
        onLogin={() => navigate(ROUTES.LOGIN)}
      />
    </div>
  );
}


