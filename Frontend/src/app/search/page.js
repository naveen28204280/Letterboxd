"use client";
import '../globals.css';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Search() {
    const router = useRouter();
    const [formData, setFormData] = useState({ keyword: '' });
    const [searchResults, setSearchResults] = useState([]);
    function goToProfile(e) {
        e.preventDefault();
        router.push('/profile');
    }
    function goToHome(e) {
        e.preventDefault();
        router.push('/home');
    }

    async function displaySearch(e) {
        e.preventDefault();

        if (!formData.keyword) {
            console.error("No search query provided");
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/search?query=${encodeURI(formData.keyword)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    }
    return (
        <div className='search-page'>
            <div className='Navbar-search'>
                <h1>Letterboxd</h1>
                <div className="nav-links-search">
                    <Link href='/home' className="home">
                        <h2>Home</h2>
                    </Link>
                    <Link href='/watchlist' className="watchlists">
                        <h2>My Lists</h2>
                    </Link>
                </div>
                <div className="search-container">
                    <form onSubmit={displaySearch}>
                        <input
                            id="search-bar"
                            placeholder='Search for movies'
                            value={formData.keyword}
                            onChange={(e) => setFormData({ keyword: e.target.value })}
                        />
                        <button type="submit" className="search-button">Search</button>
                    </form>
                </div>
                <div className='Icons-search'>
                    <div onClick={goToHome}>
                        <Image
                            className='Settings'
                            src={require('../home/settings.png')}
                            alt='Settings Icon'
                            width={30}
                            height={30}
                        />
                    </div>
                    <Image
                        className='Notifications'
                        src={require('../home/notifications.png')}
                        alt='Notifications Icon'
                        width={30}
                        height={30}
                    />
                    <div onClick={goToProfile}>
                        <Image
                            className='Profile'
                            src={require('../home/profile.png')}
                            alt='Profile Icon'
                            width={30}
                            height={30}
                            style={{ cursor: "pointer" }}
                        />
                    </div>
                </div>
            </div>
            <h2 className="results">Search Results</h2>
            <div className='movie-container-search'>
                <div className='movie-posters-search'>
                    {searchResults.length > 0 ? (
                        searchResults.map((movie) => (
                            movie.poster_url && (
                                <Image
                                    key={movie.id}
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    onClick={() => router.push(`/movie/${movie.id}`)}
                                    className='movie-slide'
                                    width={500}
                                    height={300}
                                />
                            )
                        ))
                    ) : (
                        <p>No Results Found</p>
                    )}
                </div>
            </div>
        </div>
    );
}