import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SongCard from "../components/SongCard";

export default function AllSongs({
    tracks,
    currentId,
    onPlay,
    onAddToPlaylist,
    onRemoveFromPlaylist,
    playlist = [],
    setActivePlaylist
}) {

    const location = useLocation();

    const excludeIds = location.state?.excludeIds || [];
    const playlistName = location.state?.playlistName;

    useEffect(() => {
        if (playlistName) {
            setActivePlaylist(playlistName);
        }
    }, [playlistName, setActivePlaylist]);

    const filteredTracks = tracks.filter(
        t => !excludeIds.includes(t.id)
    );
    return (
        <div className="page">
            <h2>All Songs
                {playlistName && (
                    <span className="muted"> → Add to {playlistName}</span>
                )}
            </h2>
            <p>Total Songs: {filteredTracks.length}</p>

            <div className="song-list">
                {filteredTracks.map(track => (
                    <SongCard
                        key={track.id}
                        track={track}
                        isActive={currentId === track.id}
                        onPlay={() => onPlay(track.id, true)}
                        onAddToPlaylist={() => {
                            if (playlistName) {
                                // 🔥 Direct add (no asking)
                                onAddToPlaylist(track, playlistName);
                            } else {
                                // 🟡 Normal flow (ask user)
                                onAddToPlaylist(track);
                            }
                        }}

                        onRemoveFromPlaylist={() => onRemoveFromPlaylist?.(track.id)}
                        playlist={playlist}

                    />
                ))}
            </div>
        </div>
    );
}

