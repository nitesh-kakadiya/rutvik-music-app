import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaMusic, FaList } from "react-icons/fa";
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
                <NavLink to="/" end className="nav-link">
                    <FaHome size={22} />
                </NavLink>
                <NavLink to="/all-songs" className="nav-link">
                    <FaMusic size={22} />
                </NavLink>
                <NavLink to="/myplaylist" className="nav-link">
                    <FaList size={22} />
                </NavLink>
            </nav>

            {/* Search Bar */}
            <SearchBar onSearch={onSearch} />
        </header>
    );
}
