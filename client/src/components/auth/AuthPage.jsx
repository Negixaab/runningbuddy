import React, { useState } from 'react';
import { Sun, Moon, Zap, LogIn, UserPlus } from 'lucide-react';
import apiClient from '../../api/apiClient';

const AuthPage = ({ setToken, isDarkMode, toggleDarkMode }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [error, setError] = useState('');

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4">
            <div className="absolute top-4 right-4">
                <button onClick={toggleDarkMode} className="p-2 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Zap className="mx-auto text-orange-500" size={48} />
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mt-2">RunSphere</h1>
                    <p className="text-gray-500 dark:text-gray-400">Your Gamified Running Companion</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl">
                    {error && <p className="bg-red-500/20 text-red-500 text-sm font-semibold p-3 rounded-lg mb-4 text-center">{error}</p>}
                    {isLoginView
                        ? <LoginForm onLoginSuccess={(data) => setToken(data.token)} setError={setError} />
                        : <RegisterForm onRegisterSuccess={(data) => setToken(data.token)} setError={setError} />
                    }
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => { setIsLoginView(!isLoginView); setError('') }} className="font-semibold text-orange-500 hover:underline ml-1">
                            {isLoginView ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

const LoginForm = ({ onLoginSuccess, setError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await apiClient.post('/users/login', { email, password });
            onLoginSuccess(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Welcome Back!</h2>
            <div><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required /></div>
            <div><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required /></div>
            <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"><LogIn className="mr-2" size={18} />Log In</button>
        </form>
    );
};

const RegisterForm = ({ onRegisterSuccess, setError }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await apiClient.post('/users/register', { username, email, password });
            onRegisterSuccess(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Create Account</h2>
            <div><input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required /></div>
            <div><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required /></div>
            <div><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required /></div>
            <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"><UserPlus className="mr-2" size={18} />Sign Up</button>
        </form>
    );
};

export default AuthPage;

