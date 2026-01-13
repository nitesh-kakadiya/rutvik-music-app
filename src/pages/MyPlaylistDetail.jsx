import { useNavigate, useParams } from "react-router-dom";
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
    const navigate = useNavigate();

    useEffect(() => {
        setActivePlaylist(playlistName);
    }, [playlistName, setActivePlaylist]);

    return (
        <div className="page">
            <div className="row between">
                <button
                    className="btn create"
                    onClick={() => navigate(-1)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path fill="yellow" d="m7.825 13l5.6 5.6L12 20l-8-8l8-8l1.425 1.4l-5.6 5.6H20v2z" /></svg>
                </button>


                <h2> {playlistName} ({playlist.length})</h2>

                <button
                    className="btn create"
                    onClick={() =>
                        navigate("/all-songs", {
                            state: {
                                excludeIds: playlist.map(s => s.id),
                                playlistName
                            }
                        })
                    }
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path fill="yellow" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" /></svg>
                </button>

            </div>

            <Playlist
                playlist={playlist}
                currentId={currentId}
                onPlay={onPlay}
                onRemove={onRemove}
            />
        </div>
    );
}
