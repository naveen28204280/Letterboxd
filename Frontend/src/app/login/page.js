"use client";
import '../globals.css';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    function goToRegister(e) {
        e.preventDefault();
        router.push('/register');
    }

    async function UserExists(e) {
        e.preventDefault();

        const response = await fetch('http://127.0.0.1:5000/api/login/page', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: formData.username,
                password: formData.password
            }),
        });

        console.log(response);

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('userData', JSON.stringify({
                username: data.username,
                name: data.name
            }));
            router.push('/home');
        } else {
            alert(data.error);
        }
    }

    return (
        <div className='form-wrap'>
            <form name='Login-form' onSubmit={UserExists}>
                <h1 className='form-title'>Letterboxd</h1>
                <h2 className='form-name'>Login</h2>
                <p>Username</p>
                <input
                    type='text'
                    placeholder='Enter your username'
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                />
                <p>Password</p>
                <input
                    type='password'
                    placeholder='Enter your password'
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
                <button type="submit">Login</button>
                <div className="divider">
                    <span>or</span>
                </div>
                <button type="button" onClick={goToRegister}>Register</button>
            </form>
        </div>
    );
}