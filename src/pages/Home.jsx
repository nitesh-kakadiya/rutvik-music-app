// src/pages/Home.jsx
import React from "react";
import SongCard from "../components/SongCard";

export default function Home({
    tracks,
    currentId,
    onPlay,
    onAddToPlaylist,
    onRemoveFromPlaylist,
    playlist = [],
}) {
    return (
        <div className="page">Home.jsx
            <h2>Welcome to MyMusic</h2>
            <p>Total Songs: {tracks.length}</p>

            <div className="song-list">
                {tracks.map((track) => {
                    const inPlaylist = playlist.some((t) => t.id === track.id);

                    return (
                        <SongCard
                            key={track.id}
                            track={track}
                            isActive={currentId === track.id}
                            inPlaylist={inPlaylist}
                            onPlay={() => onPlay?.(track.id)}
                            onAddToPlaylist={() => onAddToPlaylist?.(track)}
                            onRemoveFromPlaylist={() => onRemoveFromPlaylist?.(track.id)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
