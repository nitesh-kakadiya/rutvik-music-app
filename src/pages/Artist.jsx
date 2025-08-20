import React from "react";
import { useParams } from "react-router-dom";
import SongCard from "../components/SongCard";

export default function Artist({
    tracks,
    currentId,
    onPlay,
    onAddToPlaylist,
    onRemoveFromPlaylist,
    playlist = [],
}) {
    const { name } = useParams();

    const results = tracks.filter(
        (t) => t.artist.toLowerCase() === decodeURIComponent(name).toLowerCase()
    );

    return (
        <div className="page">
            <h2>Artist: {decodeURIComponent(name)}</h2>
            {results.length > 0 ? (
                <div className="song-list">
                    {results.map((track) => (
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
            ) : (
                <p>No songs found for this artist.</p>
            )}
        </div>
    );
}
