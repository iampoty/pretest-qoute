'use client';

import { useState, useEffect } from 'react';

type User = {
    id: string;
    name: string;
};

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // ตรวจสอบ session/login
    useEffect(() => {
        const userData = localStorage.getItem('user');
        // console.log("useEffect", userData)
        if (userData) setUser(JSON.parse(userData));
    }, []);

    const handleLogin = (user: User) => {
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setShowLoginModal(false);
    };

    const handleCreateClick = () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        // logic สร้างโพสต์ใหม่...
        alert('Create Post');
    };

    const handleVoteClick = () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        // logic โหวต...
        alert('Voted!');
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Home Page</h1>
                <button
                    onClick={handleCreateClick}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Create
                </button>
            </div>

            <div className="border p-4 rounded bg-white dark:bg-gray-800">
                <h2 className="text-xl font-semibold">“Quote Example”</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">by Anonymous</p>
                <button
                    onClick={handleVoteClick}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                >
                    Vote
                </button>
            </div>

            {showLoginModal && <LoginModal onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />}
        </div>
    );
}

function LoginModal({ onLogin, onClose }: { onLogin: (user: any) => void; onClose: () => void }) {
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin({ id: '123', name: username });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md dark:bg-gray-900">
                <h2 className="text-xl font-bold mb-4">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        className="w-full border border-gray-300 px-3 py-2 rounded"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
