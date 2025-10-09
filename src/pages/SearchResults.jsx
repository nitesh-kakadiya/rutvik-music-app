import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SongCard from "../components/SongCard";
import SearchBar from "../components/SearchBar";

export default function SearchResults({
    tracks,
    currentId,
    onPlay,
    onAddToPlaylist,
    onRemoveFromPlaylist,
    playlist = [],
}) {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get("q") || "";

    const results = tracks.filter(
        (t) =>
            t.title.toLowerCase().includes(query.toLowerCase()) ||
            t.artist.toLowerCase().includes(query.toLowerCase())
    );

    // when user types in searchbar
    const handleSearch = (q) => {
        navigate(`/search?q=${encodeURIComponent(q)}`);
    };

    return (
        <div className="page">
            <SearchBar onSearch={handleSearch} />
            <h2>Search Results for "{query}"</h2>
            {results.length > 0 ? (
                <div className="song-list">
                    {results.map((track) => (
                        <SongCard
                            key={track.id}
                            track={track}
                            isActive={currentId === track.id}
                            onPlay={() => onPlay?.(track.id, true)}
                            onAddToPlaylist={() => onAddToPlaylist?.(track)}
                            onRemoveFromPlaylist={() => onRemoveFromPlaylist?.(track.id)}
                            playlist={playlist}   /* 👈 pass playlist here */
                        />
                    ))}
                </div>
            ) : (
                <p>No results found.</p>
            )}
        </div>
    );
}
