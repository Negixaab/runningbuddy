import React from 'react';
import { Sun, Moon } from 'lucide-react';

const Header = React.memo(({ user, onNavigate, activePage, isDarkMode, toggleDarkMode, onLogout }) => (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <img src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${user.username}`} alt="User Avatar" className="w-12 h-12 rounded-full border-2 border-orange-500" />
                <div>
                    <h1 className="text-xl font-bold text-orange-500">RunSphere</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Welcome, {user.username}!</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
                <nav className="hidden sm:flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-full">
                    <NavItem text="Dashboard" onClick={() => onNavigate('dashboard')} isActive={activePage === 'dashboard'} />
                    <NavItem text="Tracks" onClick={() => onNavigate('tracks')} isActive={activePage === 'tracks'} />
                    <NavItem text="Challenges" onClick={() => onNavigate('challenges')} isActive={activePage === 'challenges'} />
                </nav>
                <button onClick={onLogout} className="hidden sm:block ml-2 px-4 py-2 text-sm font-semibold rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">Logout</button>
            </div>
        </div>
    </header>
));

const NavItem = React.memo(({ text, onClick, isActive }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${isActive ? 'bg-orange-500 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{text}</button>
));

export default Header;

