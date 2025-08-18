// src/pages/AllSongs.jsx
import React from "react";
import SongCard from "../components/SongCard";

export default function AllSongs({ tracks, currentId, onPlay, onAddToPlaylist, onRemoveFromPlaylist, playlist }) {
    return (
        <div className="page">
            <h2>All Songs</h2>
            <div className="grid">
                {tracks.map((track) => (
                    <SongCard
                        key={track.id}
                        track={track}
                        isActive={currentId === track.id}
                        onPlay={() => onPlay(track.id, true)}
                        onAddToPlaylist={() => onAddToPlaylist(track)}
                        onRemoveFromPlaylist={() => onRemoveFromPlaylist(track.id)}
                        playlist={playlist}
                    />
                ))}
            </div>
        </div>
    );
}
