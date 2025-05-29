// components/auth/SignupForm.tsx
import React, { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/LoginInput';
import { Button } from '../ui/LoginButton';
import { navigateToDomainSelector } from '../../utils/navigation';
import { useNavigate } from 'react-router-dom';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      setError('Security protocols do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Security protocol must be at least 6 characters');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Invalid neural link address format');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      const success = await signup(formData.username, formData.email, formData.password);
      if (success) {
        navigateToDomainSelector(navigate);
      } else {
        setError('Identity already exists in the network');
      }
    } catch (err) {
      setError('Network registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-purple-400 mr-2 animate-pulse" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Identity Registry
          </h2>
        </div>
        <p className="text-gray-400">Create your neural identity</p>
      </div>

      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <Input
          type="text"
          name="username"
          placeholder="Choose Identity Codename"
          value={formData.username}
          onChange={handleInputChange}
          icon={<User size={20} />}
          required
        />

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

        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          placeholder="Confirm Security Protocol"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          icon={<Lock size={20} />}
          required
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        <Button type="button" disabled={isLoading} onClick={() => handleSubmit()}>
          {isLoading ? 'Registering Identity...' : 'Initialize Neural Matrix'}
        </Button>

        <div className="text-center pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Already in the Network?</p>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 hover:from-pink-400 hover:to-purple-400 transition-all duration-300 font-medium"
          >
            Access Existing Identity
          </button>
        </div>
      </div>
    </div>
  );
};