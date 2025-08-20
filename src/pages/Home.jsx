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
        <div className="page">
            <h2>Welcome to MyMusic</h2>
            <p>Total Songs: {tracks.length}</p>

            <div className="song-list">
                {tracks.map((track) => (
                    <SongCard
                        key={track.id}
                        track={track}
                        isActive={currentId === track.id}
                        onPlay={() => onPlay?.(track.id, true)}
                        onAddToPlaylist={() => onAddToPlaylist?.(track)}
                        onRemoveFromPlaylist={() => onRemoveFromPlaylist?.(track.id)}
                        playlist={playlist}   /* 👈 pass full playlist */
                    />
                ))}
            </div>
        </div>
    );
}
