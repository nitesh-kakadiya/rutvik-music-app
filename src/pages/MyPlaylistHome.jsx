import { useNavigate } from "react-router-dom";

export default function MyPlaylistHome({ playlists, onCreate }) {
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
                        <div>
                            <div className="title">{name}</div>
                            <div className="artist">
                                {playlists[name].length} songs
                            </div>
                        </div>
                        <span>›</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
