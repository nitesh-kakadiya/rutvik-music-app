import React from "react";
import SongCard from "../components/SongCard";

export default function MyPlaylist({ playlist, onPlay, onRemove, currentId }) {
    return (
        <div className="page">
            <h2>My Playlist ({playlist.length})</h2>

            {playlist.length === 0 ? (
                <p className="muted">No songs in playlist yet.</p>
            ) : (
                <div className="song-list">
                    {playlist.map((track) => (
                        <SongCard
                            key={track.id}
                            track={track}
                            // ✅ Show 🎵 only here in MyPlaylist
                            isActive={currentId === track.id}
                            // play current item (parent will do playById(track.id, true))
                            onPlay={() => onPlay?.(track)}
                            // always show "-" here and remove by id
                            onRemoveFromPlaylist={() => onRemove?.(track.id)}
                            inPlaylist={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
