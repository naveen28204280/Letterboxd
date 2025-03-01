"use client"
import '../../globals.css'
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function ReviewCard() {
    const { id } = useParams();
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');

    useEffect(() => {
        const loggedInUser = localStorage.getItem('userData');
        if (loggedInUser) {
            setUserData(JSON.parse(loggedInUser));
        }

        async function fetchReviews(id) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/reviews/${id}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch previous reviews')
                }
                const data = await response.json();
                setReviews(data);
                console.log(data, "reviews");
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        }

        fetchReviews(id);
    }, [id]);

    const handleSubmitReview = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/reviews/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: userData.username,
                    movieId: id,
                    review: newReview
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }
            const refreshResponse = await fetch(`http://127.0.0.1:5000/api/reviews/${id}`);
            const refreshData = await refreshResponse.json();
            setReviews(refreshData);
            setNewReview('');
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    };
    const parsedReviews = reviews.map(reviewJson => {
        try {
            const reviewObj = JSON.parse(reviewJson);
            const username = Object.keys(reviewObj)[0];
            const review = reviewObj[username];
            return { username, review };
        } catch (e) {
            console.error("Error parsing review:", e);
            return null;
        }
    }).filter(review => review !== null);


    return (
        <div className="review-section">
            <h3 style={{ marginTop: '100px' }}>Comments</h3>
            <div className='previous-reviews'>
                {parsedReviews.length > 0 ? (
                    parsedReviews.map((review, index) => (
                        <div key={index}>
                            <h5 className='reviewer-name'>{review.username}</h5>
                            <div className="divider-line"></div>
                            <p className="review">{review.review}</p>
                        </div>
                    ))
                ) : (
                    <p>No reviews yet. Be the first to review!</p>
                )}
            </div>
            <div className="review-card">
                <h1 className="reviews-title">Review</h1>
                <div className="divider-line"></div>
                <input
                    type='text'
                    placeholder="Write your review here..."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                ></input>
                <button
                    className="submit-btn"
                    onClick={handleSubmitReview}

                >
                    Submit Review
                </button>
            </div>
        </div>
    );
}