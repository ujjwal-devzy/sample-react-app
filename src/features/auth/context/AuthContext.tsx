/**
 * Auth Context
 * Global authentication state management
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { User, UserRole } from '../../../core/types';
import { STORAGE_KEYS } from '../../../core/constants';
import { getFromStorage, setInStorage, removeFromStorage } from '../../../core/utils/storage';
import type {
  AuthState,
  AuthContextValue,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  UpdateProfileData,
  TwoFactorSetupData,
  TwoFactorVerifyData,
  TwoFactorSetupResponse,
} from '../types';
import { authService } from '../services/authService';

// ============================================
// INITIAL STATE
// ============================================

const initialState: AuthState = {
  status: 'idle',
  user: null,
  tokens: null,
  error: null,
  isInitialized: false,
};

// ============================================
// ACTION TYPES
// ============================================

type AuthAction =
  | { type: 'INIT_START' }
  | { type: 'INIT_SUCCESS'; payload: { user: User | null; tokens: typeof initialState.tokens } }
  | { type: 'INIT_FAILURE' }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: NonNullable<typeof initialState.tokens> } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'UPDATE_TOKENS'; payload: NonNullable<typeof initialState.tokens> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// ============================================
// REDUCER
// ============================================

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INIT_START':
      return { ...state, status: 'loading' };

    case 'INIT_SUCCESS':
      return {
        ...state,
        status: action.payload.user ? 'authenticated' : 'unauthenticated',
        user: action.payload.user,
        tokens: action.payload.tokens,
        isInitialized: true,
        error: null,
      };

    case 'INIT_FAILURE':
      return {
        ...state,
        status: 'unauthenticated',
        user: null,
        tokens: null,
        isInitialized: true,
        error: null,
      };

    case 'LOGIN_START':
      return { ...state, status: 'loading', error: null };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        status: 'authenticated',
        user: action.payload.user,
        tokens: action.payload.tokens,
        error: null,
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        status: 'unauthenticated',
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        status: 'unauthenticated',
        user: null,
        tokens: null,
        error: null,
      };

    case 'UPDATE_USER':
      return { ...state, user: action.payload };

    case 'UPDATE_TOKENS':
      return { ...state, tokens: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: 'INIT_START' });

      try {
        const storedUser = getFromStorage<User>(STORAGE_KEYS.USER);
        const storedAccessToken = getFromStorage<string>(STORAGE_KEYS.ACCESS_TOKEN);
        const storedRefreshToken = getFromStorage<string>(STORAGE_KEYS.REFRESH_TOKEN);

        if (storedUser && storedAccessToken) {
          // Verify token is still valid
          try {
            const user = await authService.getCurrentUser();
            dispatch({
              type: 'INIT_SUCCESS',
              payload: {
                user,
                tokens: {
                  accessToken: storedAccessToken,
                  refreshToken: storedRefreshToken || '',
                  expiresIn: 3600,
                  tokenType: 'Bearer',
                },
              },
            });
          } catch {
            // Token invalid, try refresh
            if (storedRefreshToken) {
              try {
                const tokens = await authService.refreshTokens(storedRefreshToken);
                const user = await authService.getCurrentUser();
                
                setInStorage(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
                setInStorage(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
                setInStorage(STORAGE_KEYS.USER, user);

                dispatch({
                  type: 'INIT_SUCCESS',
                  payload: { user, tokens },
                });
              } catch {
                // Refresh failed, clear everything
                removeFromStorage(STORAGE_KEYS.ACCESS_TOKEN);
                removeFromStorage(STORAGE_KEYS.REFRESH_TOKEN);
                removeFromStorage(STORAGE_KEYS.USER);
                dispatch({ type: 'INIT_FAILURE' });
              }
            } else {
              dispatch({ type: 'INIT_FAILURE' });
            }
          }
        } else {
          dispatch({ type: 'INIT_SUCCESS', payload: { user: null, tokens: null } });
        }
      } catch {
        dispatch({ type: 'INIT_FAILURE' });
      }
    };

    initAuth();
  }, []);

  // Login
  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const { user, tokens } = await authService.login(credentials);

      setInStorage(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      if (credentials.rememberMe) {
        setInStorage(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      }
      setInStorage(STORAGE_KEYS.USER, user);

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, tokens } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      removeFromStorage(STORAGE_KEYS.ACCESS_TOKEN);
      removeFromStorage(STORAGE_KEYS.REFRESH_TOKEN);
      removeFromStorage(STORAGE_KEYS.USER);
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Register
  const register = useCallback(async (data: RegisterData) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const { user, tokens } = await authService.register(data);

      setInStorage(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      setInStorage(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      setInStorage(STORAGE_KEYS.USER, user);

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, tokens } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      throw error;
    }
  }, []);

  // Forgot password
  const forgotPassword = useCallback(async (data: ForgotPasswordData) => {
    await authService.forgotPassword(data.email);
  }, []);

  // Reset password
  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    await authService.resetPassword(data.token, data.password);
  }, []);

  // Change password
  const changePassword = useCallback(async (data: ChangePasswordData) => {
    await authService.changePassword(data.currentPassword, data.newPassword);
  }, []);

  // Update profile
  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    const updatedUser = await authService.updateProfile(data);
    setInStorage(STORAGE_KEYS.USER, updatedUser);
    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
  }, []);

  // Refresh tokens
  const refreshTokens = useCallback(async () => {
    const storedRefreshToken = getFromStorage<string>(STORAGE_KEYS.REFRESH_TOKEN);
    if (!storedRefreshToken) {
      throw new Error('No refresh token available');
    }

    const tokens = await authService.refreshTokens(storedRefreshToken);
    
    setInStorage(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    setInStorage(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

    dispatch({ type: 'UPDATE_TOKENS', payload: tokens });
  }, []);

  // Verify email
  const verifyEmail = useCallback(async (token: string) => {
    await authService.verifyEmail(token);
    if (state.user) {
      const updatedUser = { ...state.user, emailVerified: true };
      setInStorage(STORAGE_KEYS.USER, updatedUser);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    }
  }, [state.user]);

  // Resend verification
  const resendVerification = useCallback(async () => {
    await authService.resendVerification();
  }, []);

  // Two-factor setup
  const setupTwoFactor = useCallback(async (data: TwoFactorSetupData): Promise<TwoFactorSetupResponse> => {
    return authService.setupTwoFactor(data.method);
  }, []);

  // Verify two-factor
  const verifyTwoFactor = useCallback(async (data: TwoFactorVerifyData) => {
    await authService.verifyTwoFactor(data.code, data.method);
    if (state.user) {
      const updatedUser = { ...state.user, twoFactorEnabled: true };
      setInStorage(STORAGE_KEYS.USER, updatedUser);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    }
  }, [state.user]);

  // Disable two-factor
  const disableTwoFactor = useCallback(async (code: string) => {
    await authService.disableTwoFactor(code);
    if (state.user) {
      const updatedUser = { ...state.user, twoFactorEnabled: false };
      setInStorage(STORAGE_KEYS.USER, updatedUser);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    }
  }, [state.user]);

  // Check permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.user) return false;
    
    // Admin has all permissions
    if (state.user.role === 'admin') return true;

    // Define role-based permissions
    const rolePermissions: Record<UserRole, string[]> = {
      admin: ['*'],
      manager: [
        'project:create', 'project:read', 'project:update',
        'task:create', 'task:read', 'task:update', 'task:delete', 'task:assign',
        'comment:create', 'comment:read', 'comment:update', 'comment:delete',
        'team:read', 'team:update',
      ],
      member: [
        'project:read',
        'task:create', 'task:read', 'task:update', 'task:assign',
        'comment:create', 'comment:read', 'comment:update',
      ],
      viewer: [
        'project:read',
        'task:read',
        'comment:read',
      ],
      guest: [
        'project:read',
        'task:read',
      ],
    };

    const permissions = rolePermissions[state.user.role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  }, [state.user]);

  // Check role
  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!state.user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(state.user.role);
  }, [state.user]);

  // Context value
  const value: AuthContextValue = useMemo(
    () => ({
      state,
      login,
      logout,
      register,
      forgotPassword,
      resetPassword,
      changePassword,
      updateProfile,
      refreshTokens,
      verifyEmail,
      resendVerification,
      setupTwoFactor,
      verifyTwoFactor,
      disableTwoFactor,
      hasPermission,
      hasRole,
      isAuthenticated: state.status === 'authenticated',
      isLoading: state.status === 'loading',
    }),
    [
      state,
      login,
      logout,
      register,
      forgotPassword,
      resetPassword,
      changePassword,
      updateProfile,
      refreshTokens,
      verifyEmail,
      resendVerification,
      setupTwoFactor,
      verifyTwoFactor,
      disableTwoFactor,
      hasPermission,
      hasRole,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// HOOK
// ============================================

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================
// HOC FOR PROTECTED ROUTES
// ============================================

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { requiredRole?: UserRole | UserRole[] }
): React.FC<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, hasRole } = useAuth();

    if (isLoading) {
      return (
        <div className="auth-loading">
          <div className="loading-spinner" />
          <span>Loading...</span>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return null;
    }

    if (options?.requiredRole && !hasRole(options.requiredRole)) {
      // Redirect to unauthorized
      window.location.href = '/403';
      return null;
    }

    return <Component {...props} />;
  };
}

