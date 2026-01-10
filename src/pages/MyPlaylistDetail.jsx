import { useParams } from "react-router-dom";
import { useEffect } from "react";
import Playlist from "../components/Playlist";

export default function MyPlaylistDetail({
    playlists,
    currentId,
    onPlay,
    onRemove,
    setActivePlaylist
}) {
    const { name } = useParams();
    const playlistName = decodeURIComponent(name);
    const playlist = playlists[playlistName] || [];

    useEffect(() => {
        setActivePlaylist(playlistName);
    }, [playlistName]);

    return (
        <div className="page">
            <h2>
                {playlistName} ({playlist.length})
            </h2>

            <Playlist
                playlist={playlist}
                currentId={currentId}
                onPlay={onPlay}
                onRemove={onRemove}
            />
        </div>
    );
}
