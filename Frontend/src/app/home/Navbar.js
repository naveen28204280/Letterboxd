"use client";
import '../globals.css'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function Navbar() {
    const router = useRouter();
    function goToProfile(e) {
        e.preventDefault()
        router.push('/profile')
    }
    function goToSearch(e) {
        e.preventDefault()
        router.push('/search')
    }

    return (
        <div className='Navbar'>
            <h1 color='#8ECAE6'>Letterboxd</h1>
            <Link href='/home' className="home">
                <h2>Home</h2>
            </Link>
            <Link href='/watchlist' className="watchlists">
                <h2>My Lists</h2>
            </Link>

            <div className='Icons'>
                <div onClick={goToSearch}><Image className='Search' src={require('./search.png')} alt='Search Icon' width={50} style={{ cursor: "pointer" }} /></div>
                <Image className='Settings' src={require('./settings.png')} alt='Settings Icon' width={50} />
                <Image className='Notifications' src={require('./notifications.png')} alt='Notifications Icon' width={50} />
                <div onClick={goToProfile}><Image className='Profile' src={require('./profile.png')} alt='Profile Icon' width={50} style={{ cursor: "pointer" }} /></div>
            </div>
        </div>
    );
}

export default Navbar;