import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import johnWickImage from './John-Wick.jpeg';
import interstellarImage from './Interstellar.jpeg';

const Carousel = () => {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
        
        {
            src: johnWickImage,
            alt: 'John Wick',
            path: '/movie/john-wick'
        },
        {
            src: interstellarImage,
            alt: 'Interstellar',
            path: '/movie/interstellar'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const handlePrevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const handleNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const handleImageClick = () => {
        router.push(slides[currentSlide].path);
    };

    return (
        <div className="carousel-outer-container">
            <button className="nav-button prev" onClick={handlePrevSlide}>
                <ChevronLeft />
            </button>
            <div className="carousel-container">
                <div className="carousel-wrapper">
                    <div onClick={handleImageClick} style={{ cursor: 'pointer', width: '100%', height: '100%', position: 'relative' }}>
                        <Image
                            src={slides[currentSlide].src}
                            alt={slides[currentSlide].alt}
                            className="carousel-image"
                            fill
                            priority
                        />
                    </div>
                    <div className="carousel-dots">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`dot ${currentSlide === index ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <button className="nav-button next" onClick={handleNextSlide}>
                <ChevronRight />
            </button>
        </div>
    );
};

export default Carousel;