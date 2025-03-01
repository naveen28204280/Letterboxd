"use client"
import '../../globals.css';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../home/Navbar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ReviewCard from './reviews';

export default function movie() {
    const { id } = useParams();
    const [movie, setMovie] = useState({});
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [inWatchlist, setInWatchlist] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loggedInUser = localStorage.getItem('userData');
        if (loggedInUser) {
            setUser(JSON.parse(loggedInUser));
        }

        async function fetchMovieDetails() {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/movie/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch movie details');
                }
                const data = await response.json();
                setMovie(data);
                console.log(movie, "movie")
            } catch (error) {
                console.error("Error fetching movie:", error);
            }
        }

        fetchMovieDetails();
    }, [id]);

    useEffect(() => {
        const checkWatchlistStatus = async () => {
            if (!user || !movie.id) return;

            try {
                const response = await fetch('http://127.0.0.1:5000/api/watchlist/check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: user.username,
                        movieId: movie.id
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setInWatchlist(data.inWatchlist);
                }
            } catch (error) {
                console.error('Error checking watchlist status:', error);
            }
        };

        checkWatchlistStatus();
    }, [user, movie.id]);

    const handleWatchlistAction = async () => {
        if (!user) {
            setMessage('Please login to use watchlist features');
            setTimeout(() => {
                router.push('/login');
            }, 5000);
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = inWatchlist ?
                'http://127.0.0.1:5000/api/watchlist/remove' :
                'http://127.0.0.1:5000/api/watchlist/add';

            const payload = { username: user.username, movieId: movie.id };
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setInWatchlist(!inWatchlist);
                setMessage(inWatchlist ? 'Removed from watchlist!' : 'Added to watchlist!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(data.error || 'Action failed');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error updating watchlist:', error);
            setMessage('An error occurred');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='movie'>
            <Navbar />
            <div className="movie-content">
                <div className="movie-main">
                    <div className="movie-poster" style={{ borderRadius: '20px' }}>
                        {movie.poster_url ? (
                            <Image
                                key={movie.id}
                                src={movie.poster_url}
                                alt={movie?.title || "No Title"}
                                onClick={() => router.push(`/movie/${movie.id}`)}
                                width={500}
                                height={300}
                                style={{ borderRadius: '20px' }}
                                unoptimized
                                priority
                            />
                        ) : (
                            <div>No poster available</div>
                        )}
                        {message && (
                            <div className="notification" style={{
                                padding: '10px',
                                backgroundColor: message.includes('error') ? '#ffdddd' : '#ddffdd',
                                margin: '10px 0',
                                borderRadius: '5px',
                                textAlign: 'center'
                            }}>
                                {message}
                            </div>
                        )}
                        <button
                            className='add-to-list'
                            onClick={handleWatchlistAction}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        </button>
                    </div>
                    <div className="movie-details">
                        <h2 style={{ fontSize: "25px" }}>{movie.title}</h2>
                        <div className="description-card">
                            <h3>Description</h3>
                            <div className="divider-line"></div>
                            <p>{movie.overview}</p>
                        </div>
                    </div>
                </div>
                <ReviewCard />
            </div>
        </div>
    );
}