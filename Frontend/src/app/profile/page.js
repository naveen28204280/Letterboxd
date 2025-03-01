"use client";
import { useRouter } from 'next/navigation';
import '../globals.css';
import Navbar from '../home/Navbar.js';
import { useState, useEffect } from 'react';

function Profile() {
    const router = useRouter();
    const [userData , setUserData] = useState(null);
    const [formData, setFormData] = useState({
        newusername: userData?.username || '',
        newname: userData?.name || '',
        newpassword: '',
        password: ''
    });
    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            const parsedData = JSON.parse(storedUserData);
            setUserData(parsedData);
            setFormData(prevData => ({
                ...prevData,
                newusername: parsedData.username,
                newname: parsedData.name
            }));
        } else {
            router.push('/login');
        }
    }, []);

    function goToLogin(e) {
        e.preventDefault();
        localStorage.removeItem('userData');
        router.push('/login');
    }

    async function ChangeDetails(e) {
        e.preventDefault();
        const response = await fetch('http://127.0.0.1:5000/api/profile/page', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                newusername: formData.newusername,
                newname: formData.newname,
                password: formData.password,
                newpassword: formData.newpassword
            }),
        });

        try {
            if (response.ok) {
                localStorage.setItem('userData', JSON.stringify({
                    username: formData.newusername || userData.username,
                    name: formData.newname || userData.name
                }));
                alert("Profile updated successfully!");
                location.reload();
            } else {
                const data = await response.json();
                alert(data.error);
            }
        }
        catch (error) {
            alert("Couldn't update User details");
        }
    }

    return (
        <div className="profile">
            <Navbar />
            <div className="profile-container">
                <div className="profile-section">
                    <div className="profile-image">DP</div>
                    <form className="profile-form" onSubmit={ChangeDetails}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={formData.newusername}
                                onChange={(e) => setFormData({ ...formData, newusername: e.target.value })}
                                placeholder="Enter your username"
                            />
                        </div>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={formData.newname}
                                onChange={(e) => setFormData({ ...formData, newname: e.target.value })}
                                placeholder="Enter your new Name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Enter your current password"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                placeholder="Enter your new password"
                                value={formData.newpassword}
                                onChange={(e) => setFormData({ ...formData, newpassword: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="save-button">Save Changes</button>
                    </form>
                </div>
                <div className="content-section">
                    <div className="user-info">
                        <h1 className="name">{userData?.name || 'Name'}</h1>
                        <p className="username">{userData?.username || 'username'}</p>
                        <button className="logout-button" onClick={goToLogin}>Logout</button>
                    </div>
                    <div className="movies-section">
                        <h2>Favourites</h2>
                        <div className="favourite-movies"></div>
                        <h2>Previously Watched</h2>
                        <div className="history-movies"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Profile;