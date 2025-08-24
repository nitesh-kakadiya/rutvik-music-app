import React, { useEffect, useState } from "react";
import SongCard from "../components/SongCard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://rutvik-music-server.onrender.com";

export default function Home({
    tracks: initialTracks = [],
    currentId,
    onPlay,
    onAddToPlaylist,
    onRemoveFromPlaylist,
    playlist = [],
}) {
    const [tracks, setTracks] = useState(initialTracks);

    // 🔹 Load tracks from backend if none are provided
    useEffect(() => {
        if (!initialTracks.length) {
            fetch(`${BACKEND_URL}/api/tracks`)
                .then((res) => res.json())
                .then((data) => setTracks(data))
                .catch((err) => console.error("Failed to fetch tracks:", err));
        }
    }, [initialTracks]);

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
