import React from "react";

export default function PlaylistPicker({
    playlists,
    onSelect,
    onClose
}) {
    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>Add to playlist</h3>

                {Object.keys(playlists).map((name) => (
                    <button
                        key={name}
                        className="playlist-option"
                        onClick={() => {
                            onSelect(name);
                            onClose();
                        }}
                    >
                        {name} ({playlists[name].length})
                    </button>
                ))}

                <button className="btn ghost" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
}
