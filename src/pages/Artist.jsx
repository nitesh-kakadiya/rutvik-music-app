// src/pages/Artist.jsx
import React from "react";
import { useParams } from "react-router-dom";
import SongCard from "../components/SongCard";

export default function Artist({ tracks, currentId, onPlay, onAddToPlaylist, onRemoveFromPlaylist, playlist }) {
    const { name } = useParams();
    const results = tracks.filter((t) => t.artist.toLowerCase() === decodeURIComponent(name).toLowerCase());

    return (
        <div className="page">
            <h2>Artist: {name}</h2>
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
        </div>
    );
}
