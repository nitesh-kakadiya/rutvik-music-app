import { useNavigate } from "react-router-dom";

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
                    className="btn create"
                    onClick={() => {
                        const name = prompt("Playlist name?");
                        if (name) onCreate(name.trim());
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path fill="yellow" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" /></svg>
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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="yellow" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z" /></svg>
                                </button>
                            )}
                            <span className="arrow">
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 12 24"><path fill="yellow" fill-rule="evenodd" d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414" /></svg>
                            </span>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
