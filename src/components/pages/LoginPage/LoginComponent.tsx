'use client';
import { loginHandler } from "@/service/auth/login-service";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    summary: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let tempErrors = {
      username: '',
      password: '',
      summary: ''
    };
    let isValid = true;

    if (!formData.username) {
      tempErrors.username = 'Username is required';
      isValid = false;
    } else if (formData.username.length < 3) {
      tempErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
        ...prev,
        summary: '' // Clear summary error as well
    }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        summary: '' // Clear summary error as well
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await loginHandler(formData.username, formData.password);
      console.log('Login successful:', response);
      localStorage.setItem("token", response.result.accessToken)
      setTokenCookie(response.result.accessToken);
      router.push(callbackUrl); // Redirect to callback URL after successful login
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        summary: error instanceof Error ? error.message : 'Login failed. Please try again.'
      }));
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const setTokenCookie = (token: string) => {
      // max-age: 7 ngày, path=/, SameSite=Lax
      document.cookie = `token=${token}; max-age=${60 * 60 * 24 * 7}; path=/; samesite=lax`;
  };

  return (
    <div className="min-w-dvw min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="text-center">
          {errors.summary && (
              <p className="mt-1 text-sm text-red-500">{errors.summary}</p>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
       
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              placeholder="Enter your username"
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="Enter your password"
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
