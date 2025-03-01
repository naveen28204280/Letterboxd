import '../../globals.css';
import Navbar from '../../home/Navbar.js';
import Poster from 'next/image';

export default function movie() {
    return (
        <div className='movie'>
            <Navbar />
            <div className="movie-content">
                <div className="movie-main">
                    <div className="movie-poster">
                        <Poster src={require('./Interstellar.jpeg')} alt="Interstellar" />
                    </div>
                    <div className="movie-details">
                        <h2 className="movie-title">John Wick</h2>
                        <div className="description-card">
                            <h3>Description</h3>
                            <div className="divider-line"></div>
                            <p style={{margin: 0}}>When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.</p>
                        </div>
                    </div>
                </div>
                <div className="comments-section">
                    <h3>Comments</h3>
                    <div className="review-card">
                        <h4>Reviewer</h4>
                        <div className="divider-line"></div>
                        <input type='text' placeholder="Write your review here..."></input>
                        <button className="submit-btn">Submit Review</button>
                    </div>
                </div>
            </div>
        </div>
    );
}