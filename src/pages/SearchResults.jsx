// src/pages/SearchResults.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import SongCard from "../components/SongCard";

export default function SearchResults({ tracks, currentId, onPlay, onAddToPlaylist, onRemoveFromPlaylist, playlist }) {
    const location = useLocation();
    const query = new URLSearchParams(location.search).get("q") || "";

    const results = tracks.filter(
        (t) =>
            t.title.toLowerCase().includes(query.toLowerCase()) ||
            t.artist.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="page">
            <h2>Search Results for "{query}"</h2>
            {results.length > 0 ? (
                <div className="grid">
                    {results.map((track) => (
                        <SongCard
                            key={track.id}
                            track={track}
                            isActive={currentId === track.id}
                            onPlay={() => onPlay(track.id)}
                            onAddToPlaylist={() => onAddToPlaylist(track)}
                            onRemoveFromPlaylist={() => onRemoveFromPlaylist(track.id)}
                            playlist={playlist}
                        />
                    ))}
                </div>
            ) : (
                <p>No results found.</p>
            )}
        </div>
    );
}
