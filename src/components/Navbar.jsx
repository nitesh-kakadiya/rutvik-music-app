import React from "react";
import { NavLink } from "react-router-dom";
import SearchBar from "./SearchBar";

export default function Navbar({ onSearch }) {
    return (
        <header className="navbar">
            {/* Brand / Logo */}
            <div className="brand">
                <NavLink to="/">MyMusic</NavLink>
            </div>

            {/* Navigation Links */}

            <nav className="links">
                <NavLink to="/" end className="nav-link"> Home</NavLink>
                <NavLink to="/all-songs" className="nav-link">All Songs</NavLink>
                <NavLink to="/myplaylist" className="nav-link">My Playlist</NavLink>
            </nav>

            {/* Search Bar */}
            <SearchBar onSearch={onSearch} />
        </header>
    );
}
