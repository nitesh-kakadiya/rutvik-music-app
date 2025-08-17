import React from "react";
import SongCard from "./SongCard";

export default function Playlist({ playlist, onPlay, onRemove }) {
    if (!playlist || playlist.length === 0) {
        return <div className="muted">No songs in playlist yet.</div>;
    }

    return (
        <div className="playlist">Playlist.jsx
            {playlist.map((track) => (
                <SongCard
                    key={track.id}
                    track={track}
                    isActive={false} // Playlist doesn't know which is currently playing (can be enhanced later)
                    inPlaylist={true} // Always true inside playlist
                    // ✅ Pass track to onPlay (autoplay handle in App.jsx)
                    onPlay={() => onPlay?.(track)}
                    // ✅ Remove by id instead of index (same as MyPlaylist fix)
                    onRemoveFromPlaylist={() => onRemove?.(track.id)}
                />
            ))}
        </div>
    );
}
