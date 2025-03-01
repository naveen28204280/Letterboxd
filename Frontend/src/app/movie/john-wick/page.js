import '../../globals.css';
import Navbar from '../../home/Navbar.js';
import Poster from 'next/image';

export default function movie(){
    return (
        <div className='movie'>
            <Navbar />
            <div className="movie-content">
                <div className="movie-main">
                    <div className="movie-poster" style={{ borderRadius: '20px' }}>
                        <Poster src={require('./John-Wick.jpeg')} alt="John Wick" style={{ borderRadius:'20px'}} />
                        <button className='add-to-list'>Add to Watchlist</button>
                    </div>
                    <div className="movie-details">
                        <h2 className="movie-title">John Wick</h2>
                        <div className="description-card">
                            <h3>Description</h3>
                            <div className="divider-line"></div>
                            <p>An ex-hitman comes out of retirement to track down the gangsters who killed his dog and took his car.</p>
                        </div>
                    </div>
                </div>
                <div className="comments-section">
                    <h3 style={{marginTop:'100px'}}>Comments</h3>
                    <div className="review-card">
                        <h4>Reviewes</h4>
                        <div className='previous-reviews'>
                            <h3 className='reviewer-name'></h3>
                            <p className="review"></p>
                        </div>
                        <div className="divider-line"></div>
                        <input type='text' placeholder="Write your review here..."></input>
                        <button className="submit-btn">Submit Review</button>
                    </div>
                </div>
            </div>
        </div>
    );
}