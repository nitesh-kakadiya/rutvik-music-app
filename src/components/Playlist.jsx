import React from "react";
import SongCard from "./SongCard";

export default function Playlist({ playlist, onPlay, onRemove, currentId }) {
    if (!playlist || playlist.length === 0) {
        return <div className="muted">No songs in playlist yet.</div>;
    }

    return (
        <div className="song-list">
            {playlist.map((track) => (
                <SongCard
                    key={track.id}
                    track={track}
                    isActive={currentId === track.id}   // ✅ highlight current song
                    inPlaylist={true}                  // show "-" button
                    onPlay={() => onPlay?.(track)}
                    onRemoveFromPlaylist={() => onRemove?.(track.id)}
                />
            ))}
        </div>
    );
}
