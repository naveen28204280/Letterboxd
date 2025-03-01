"use client";
import '../globals.css';
import Navbar from './Navbar';
import About from './About';
import Carousel from './Carousel';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Home() {
    const router = useRouter();
    const [movies, setMovies] = useState([]);
    useEffect(() => {
        async function fetchMovies() {
            try {
                const response = await fetch("http://127.0.0.1:5000/api/top-rated-movies");
                const data = await response.json();
                setMovies(data);
            } catch (error) {
                console.error("Error fetching movies:", error);   
            }
        }
        fetchMovies();
    }, []);
    
    function goToMovie(id) {
        router.push(`/movie/${id}`);
    }

    return (
        <div className='Home'>
            <Navbar />
            <Carousel />
            <h1 style={{ color: "#FF9800" }}>Top Rated Movies</h1>
            <div className='movie-container'>
                <div className='movie-posters'>
                    {movies.map((movie) => (
                        movie.poster_url && (
                            <Image
                                key={movie.id}
                                src={movie.poster_url}
                                alt={movie.title}
                                onClick={() => goToMovie(movie.id)}
                                className='movie-slide'
                                width={500}
                                height={300}
                            />
                        )
                    ))}
                </div>
            </div>
            <About />
        </div>
    );
}