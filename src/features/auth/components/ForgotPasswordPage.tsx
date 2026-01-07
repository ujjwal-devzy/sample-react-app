import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../core/constants';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <ForgotPasswordForm
        onSuccess={() => undefined}
        onBack={() => navigate(ROUTES.LOGIN)}
      />
    </div>
  );
}


