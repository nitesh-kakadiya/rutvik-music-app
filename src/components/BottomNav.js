import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaMusic, FaList, FaSearch } from "react-icons/fa";

export default function BottomNav() {
    return (
        <nav className="bottom-nav">
            <NavLink to="/" end className="nav-link">
                <FaHome size={22} />
            </NavLink>

            <NavLink to="/search" end className="nav-link">
                <FaSearch size={22} />
            </NavLink>

            <NavLink to="/all-songs" className="nav-link">
                <FaMusic size={22} />
            </NavLink>

            <NavLink to="/myplaylist" className="nav-link">
                <FaList size={22} />
            </NavLink>
        </nav>
    );
}
