import React, { useEffect, useState } from "react";
import SongCard from "../components/SongCard";

const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "https://rutvik-music-server.onrender.com";

export default function Home({
    tracks: initialTracks = [],
    currentId,
    onPlay,
    onAddToPlaylist,
    onRemoveFromPlaylist,
    playlist = [],
}) {
    const [tracks, setTracks] = useState(Array.isArray(initialTracks) ? initialTracks : []);

    // 🔹 Load tracks from backend if none are provided
    useEffect(() => {
        if (!initialTracks.length) {
            fetch(`${BACKEND_URL}/google/songs`)
                .then((res) => res.json())
                .then((data) => {
                    // ✅ Ensure it's an array
                    if (Array.isArray(data)) {
                        setTracks(data);
                    } else if (Array.isArray(data?.tracks)) {
                        setTracks(data.tracks);
                    } else {
                        console.error("Unexpected data format:", data);
                        setTracks([]); // fallback
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch tracks:", err);
                    setTracks([]);
                });
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
                        playlist={playlist}
                    />
                ))}
            </div>
        </div>
    );
}
