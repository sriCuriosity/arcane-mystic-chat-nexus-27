// components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/LoginInput';
import { Button } from '../ui/LoginButton';
import { navigateToDomainSelector } from '../../utils/navigation';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigateToDomainSelector(navigate);
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-cyan-400 mr-2 animate-pulse" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Access Terminal
          </h2>
        </div>
        <p className="text-gray-400">Enter your credentials to proceed</p>
      </div>

      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <Input
          type="email"
          name="email"
          placeholder="Neural Link Address"
          value={formData.email}
          onChange={handleInputChange}
          icon={<Mail size={20} />}
          required
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Security Protocol"
          value={formData.password}
          onChange={handleInputChange}
          icon={<Lock size={20} />}
          required
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <Button type="button" disabled={isLoading} onClick={handleSubmit}>
          {isLoading ? 'Authenticating...' : 'Initialize Connection'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            className="text-sm text-cyan-400 hover:text-purple-400 transition-colors duration-300"
          >
            Recovery Protocol Needed?
          </button>
        </div>

        <div className="text-center pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-2">New to the Neural Network?</p>
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-purple-400 hover:to-pink-400 transition-all duration-300 font-medium"
          >
            Register New Identity
          </button>
        </div>
      </div>
    </div>
  );
};