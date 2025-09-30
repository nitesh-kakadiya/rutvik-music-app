import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
    const [query, setQuery] = useState("");

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        onSearch?.(value); // 👈 call search instantly
    };

    const handleClear = () => {
        setQuery("");
        onSearch?.(""); // optional: trigger search reset
    };

    return (
        <form className="search">
            <div className="search-input-wrapper">
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}   // 👈 direct search
                    placeholder="Search songs or artists..."
                    aria-label="Search songs or artists"
                />

                {query && (
                    <button
                        type="button"
                        className="btn clear-btn"
                        onClick={handleClear}
                        aria-label="Clear search"
                    >
                        ✖
                    </button>
                )}
            </div>
        </form>
    );
}
