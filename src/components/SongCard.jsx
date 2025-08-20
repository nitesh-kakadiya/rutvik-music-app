import React from "react";
import { Link } from "react-router-dom";

export default function SongCard({
    track,
    isActive = false,
    onPlay,                  // () => void        (already bound by parent)
    onAddToPlaylist,         // () => void        (already bound by parent)
    onRemoveFromPlaylist,    // () => void        (already bound by parent)
    playlist = [],
    inPlaylist,              // optional override: true/false. If undefined, auto-detect via playlist
}) {
    if (!track) return null;

    // Decide if this track is in playlist
    const isInPlaylist =
        typeof inPlaylist === "boolean"
            ? inPlaylist
            : Array.isArray(playlist) && playlist.some((t) => t.id === track.id);

    return (
        <div className={`songcard ${isActive ? "active" : ""}`}>
            {/* Info */}
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
                    onClick={onPlay}
                    aria-label={isActive ? "Now Playing" : "Play this song"}
                    title={isActive ? "Now Playing" : "Play"}
                >
                    {isActive ? "🎵" : "▶"}
                </button>

                {isInPlaylist ? (
                    <button
                        className="btn danger"
                        onClick={onRemoveFromPlaylist}
                        aria-label="Remove from Playlist"
                        title="Remove from Playlist"
                    >
                        {/* minus icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19 13H5v-2h14z" />
                        </svg>
                    </button>
                ) : (
                    <button
                        className="btn"
                        onClick={onAddToPlaylist}
                        aria-label="Add to Playlist"
                        title="Add to Playlist"
                    >
                        {/* plus icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
