'use client'
import '../globals.css'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        password: '',
        confirmPassword: ''
    });

    async function handleSubmit(e) {
        e.preventDefault();
        

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/api/register/page', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    name: formData.name,
                    password: formData.password
                }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('userData', JSON.stringify({
                    username: formData.username,
                    name: formData.name
                }));
                router.push('/home');
            } else {
                const data = await response.json();
                alert(data.error);
            }
        } catch (error) {
            alert('Registration failed');
        }
    }

    return (
        <div className="form-wrap">
            <form name="register" method='POST' onSubmit={handleSubmit}>
                <h1 className='form-title'>Letterboxd</h1>
                <h2 className='form-name'>Register</h2>
                <p>Username</p>
                <input type='text' placeholder='Enter your username' value={formData.username} onChange={(e) => setFormData({ ...formData,username: e.target.value })} required />
                <p>Enter Name</p>
                <input type='text' placeholder='Enter your name' value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <p>Password</p>
                <input type='password' placeholder='Enter your password' value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                <p>Confirm Password</p>
                <input type='password' placeholder='Confirm your password' value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;