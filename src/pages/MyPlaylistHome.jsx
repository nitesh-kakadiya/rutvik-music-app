import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";


export default function MyPlaylistHome({
    playlists,
    onCreate,
    onDelete
}) {

    const navigate = useNavigate();
    const names = Object.keys(playlists);

    return (
        <div className="page">
            <div className="row between">
                <h2>My Playlists ({names.length})</h2>

                <button
                    className="btn primary"
                    onClick={() => {
                        const name = prompt("Playlist name?");
                        if (name) onCreate(name.trim());
                    }}
                >
                    +
                </button>
            </div>

            <div className="playlist">
                {names.map(name => (
                    <div
                        key={name}
                        className="playlist-item"
                        onClick={() =>
                            navigate(`/myplaylist/${encodeURIComponent(name)}`)
                        }
                    >
                        <div className="playlist-info">
                            <div className="title">{name}</div>
                            <div className="artist">
                                {playlists[name].length} songs
                            </div>
                        </div>

                        <div className="playlist-actions">
                            {name !== "Liked Songs" && (
                                <button
                                    type="button"
                                    className="btn ghost playlist-delete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Delete "${name}" playlist?`)) {
                                            onDelete(name);
                                        }
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            )}
                            <span className="arrow">›</span>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
