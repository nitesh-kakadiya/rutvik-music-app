import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Playlist from "../components/Playlist";


export default function MyPlaylistDetail({
    playlists,
    currentId,
    onPlay,
    onRemove,
    setActivePlaylist,
    allSongs,
    onAddToPlaylist
}) {
    const { name } = useParams();
    const playlistName = decodeURIComponent(name);
    const playlist = playlists[playlistName] || [];
    const names = Object.keys(playlists);
    const navigate = useNavigate();
    const [selectedIds, setSelectedIds] = useState([]);


    const availableSongs = allSongs.filter(
        t => !playlist.some(p => p.id === t.id)
    );

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const addSelectedSongs = () => {
        selectedIds.forEach(id => {
            const song = allSongs.find(s => s.id === id);
            if (song) {
                onAddToPlaylist(song, playlistName);
            }
        });
        setSelectedIds([]);
    };




    useEffect(() => {
        setActivePlaylist(playlistName);
    }, [playlistName]);

    return (
        <div className="page">
            <div className="row between">
                <button
                    className="btn ghost"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>


                <h2> {playlistName} ({playlist.length})</h2>

                <button
                    className="btn primary"
                    onClick={() => {
                        const songNames = availableSongs
                            .map((s, i) => `${i + 1}. ${s.title}`)
                            .join("\n");

                        const choice = prompt(
                            "Select song number to add:\n\n" + songNames
                        );

                        const index = Number(choice) - 1;
                        const song = availableSongs[index];

                        if (song) {
                            onAddToPlaylist(song);
                            alert(`Added "${song.title}"`);
                        }
                    }}
                >
                    +
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
