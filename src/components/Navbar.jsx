import React from "react";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";

export default function Navbar({ onSearch }) {
    return (
        <header className="navbar">
            {/* Brand / Logo */}
            <div className="brand">
                <Link to="/">MyMusic</Link>
            </div>

            {/* Navigation Links */}
            <nav className="links">
                <Link to="/">Home</Link>
                <Link to="/all-songs">All Songs</Link>
                <Link to="/myplaylist">My Playlist</Link>
            </nav>

            {/* Search Bar */}
            <SearchBar onSearch={onSearch} />
        </header>
    );
}
