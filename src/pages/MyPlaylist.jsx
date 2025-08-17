// src/pages/MyPlaylist.jsx
import React from "react";

export default function MyPlaylist({ playlist, onPlay, onRemove }) {
    return (
        <div className="page">
            <h2>My Playlist MyPlaylist.jsx({playlist.length})</h2>

            {playlist.length === 0 ? (
                <p className="muted">No songs in playlist yet.</p>
            ) : (
                <div className="playlist">
                    {playlist.map((track) => (
                        <div key={track.id} className="playlist-item">
                            <div className="meta">
                                <div className="title">{track.title}</div>
                                <div className="artist">{track.artist}</div>
                            </div>
                            <div className="actions">
                                <button className="btn" onClick={() => onPlay(track)}>▶</button>
                                <button className="btn ghost" onClick={() => onRemove(track.id)}><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 20 20"><path fill="red" d="M19 12.998H5v-2h14z" /></svg></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
