import React from "react";
import { Link } from "react-router-dom";

export default function SongCard({
    track,
    isActive = false,
    inPlaylist = false,
    onPlay,
    onAddToPlaylist,
    onRemoveFromPlaylist,
}) {
    if (!track) return null; // Safety guard

    return (
        <div className={`songcard ${isActive ? "active" : ""}`}>SongCard.jsx
            {/* Track Info */}
            <div className="info">
                <div className="title">{track.title}</div>
                <div className="artist">
                    by{" "}
                    <Link to={`/artist/${encodeURIComponent(track.artist)}`}>
                        {track.artist}
                    </Link>
                </div>
            </div>

            {/* Actions */}
            <div className="actions">
                <button
                    className="btn primary"
                    onClick={() => onPlay?.(track.id)}
                    aria-label={isActive ? "Now Playing" : "Play this song"}
                >
                    {isActive ? "🎵 " : "▶"}
                </button>

                {inPlaylist ? (
                    <button
                        className="btn danger"
                        onClick={() => onRemoveFromPlaylist?.(track.id)}
                        aria-label="Remove from Playlist"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="red" d="M19 12.998H5v-2h14z" /></svg>
                    </button>
                ) : (
                    <button
                        className="btn"
                        onClick={() => onAddToPlaylist?.(track)}
                        aria-label="Add to Playlist"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="green" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" /></svg>                    </button>
                )}
            </div>
        </div>
    );
}
