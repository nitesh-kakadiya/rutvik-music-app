import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!query.trim()) return; // ignore empty search
        onSearch?.(query);
    };

    const handleClear = () => {
        setQuery("");
        onSearch?.(""); // optional: trigger search reset
    };

    return (
        <form className="search" onSubmit={handleSubmit}>
            <div className="search-input-wrapper">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
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

            <button className="btn" type="submit">
                Search
            </button>
        </form>
    );
}
