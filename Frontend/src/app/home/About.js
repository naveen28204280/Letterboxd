import '../globals.css';

function About() {
    return (
        <div className="links">
            <div className="content"><h3>Letterboxd</h3><p>Meet like minded people</p></div>
            <div className="content">
                <h3>Quick Links</h3>
                <ul>
                    <li><p>Home</p></li>
                    <li><p>Tips & Tricks (Blog)</p></li>
                    <li><p>Contact Us</p></li>
                </ul>
            </div>
            <div className="content">
                <h3>Need Help?</h3>
                <ul>
                    <li><p>Customer Support</p></li>
                    <li><p>Terms & Conditions</p></li>
                    <li><p>Privacy Policy</p></li>
                </ul>
            </div>
            <div className="content">
                <h3>Stay Connected</h3>
                <div className="social-links">
                    <p><i className="fab fa-facebook"></i></p>
                    <p><i className="fab fa-instagram"></i></p>
                    <p><i className="fab fa-twitter"></i></p>
                    <p><i className="fab fa-linkedin"></i></p>
                </div>
            </div>
        </div>
    );
}

export default About;