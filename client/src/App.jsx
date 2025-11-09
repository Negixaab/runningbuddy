import React, { useState, useEffect, useCallback } from 'react';
import apiClient from './api/apiClient.js';
import AuthPage from './components/auth/AuthPage.jsx';
import MainAppLayout from './components/layout/MainAppLayout.jsx';

const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const handleLogout = useCallback(() => {
        setToken(null);
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            apiClient.get('/users/profile')
                .then(response => setUser(response.data))
                .catch(error => {
                    console.error("Authentication Error:", error);
                    handleLogout();
                });
        } else {
            localStorage.removeItem('token');
            delete apiClient.defaults.headers.common['Authorization'];
            setUser(null);
        }
    }, [token, handleLogout]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    if (!user) {
        return <AuthPage setToken={setToken} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />;
    }

    return <MainAppLayout user={user} onLogout={handleLogout} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />;
};

export default App;

