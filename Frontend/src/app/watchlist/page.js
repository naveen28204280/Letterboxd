'use client'
import '../globals.css';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../home/Navbar';
import Image from 'next/image';
import About from '../home/About'


export default function Watchlist() {
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [movies, setMovies] = useState([]);
    const allMovieDetails = [];
    let watchlistResponse = [];
    async function fetchWatchlist(username) {
        try {
            const watchlistResponse = await fetch(`http://127.0.0.1:5000/api/watchlist/${username}`);
            const movieIdsString = await watchlistResponse.json();
            const movieIds = JSON.parse(movieIdsString);

            if (!Array.isArray(movieIds)) {
                console.error("Invalid movie IDs format:", movieIds);
                return;
            }

            const allMovieDetails = [];
            for (let movieId of movieIds) {
                try {
                    const moviesResponse = await fetch(`http://127.0.0.1:5000/api/movie/${movieId}`, {
                        method: "GET",
                        headers: { "Content-Type": "application/json" }
                    });
                    console.log(moviesResponse)
                    const movieDetails = await moviesResponse.json();
                    allMovieDetails.push(movieDetails);
                    console.log(movieDetails);
                } catch (error) {
                    console.error(`Error fetching movie details for ID ${movieId}:`, error);
                }
            }

            setMovies(allMovieDetails);
        } catch (error) {
            console.error("Error fetching watchlist or movies:", error);
        }
    }
    useEffect(() => {
        console.log("Movies state:", movies);
    }, [movies]);

    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            const parsedData = JSON.parse(storedUserData);
            setUserData(parsedData);
            fetchWatchlist(parsedData.username);
        } else {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className='watchlist'>
            <Navbar />
            <div>
                <h2 style={{ fontSize: '40px', marginBottom: '20px' }}>Watchlist</h2>
                <div className='movie-container'>
                    {movies && movies.length > 0 ? (
                        <div className="movie-posters">
                            {movies.map(movie => (
                                <div key={movie.id}>
                                    {movie.poster_url && (
                                        <Image
                                            src={movie.poster_url}
                                            alt={movie.title}
                                            onClick={() => router.push(`/movie/${movie.id}`)}
                                            width={100}
                                            height={200}
                                            priority
                                            className='movie-slide'
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No movies found</p>
                    )}
                </div>
                <About style={{ bottom: "0" }} />
                </div>
        </div>
    );
}