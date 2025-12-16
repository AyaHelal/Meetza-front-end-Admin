import React from "react";
import { Trash } from "phosphor-react";

const formatDate = (dateStr) => {
    if (!dateStr) return '—';

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Invalid Date';

    const iso = d.toISOString().replace('T', ' ').substring(0, 19);

    const hour = parseInt(iso.substring(11, 13), 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';

    return `${iso} ${ampm}`;
};





export const ResourcesRow = ({ resource, onDelete, contentId }) => {
    if (!resource) return null;

    const { id, file_url, file_name, file_type, file_size, created_at } = resource;

    // Check if this is a link resource (no file_name, file_type, file_size)
    const isLink = file_type === "link";

    return (
        <>
            <style>{`
                .break-word {
                    white-space: normal !important;
                    word-break: break-all !important;
                    max-width: 350px;
                    display: block;
                }
            `}</style>

            <tr className="align-middle">
                <td className="px-3">
                    <a
                        href={file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="break-word"
                    >
                        {file_url}
                    </a>
                </td>

                <td className="px-4">{isLink ? "External Link" : file_name}</td>
                <td className="px-3">{isLink ? "Link" : file_type}</td>
                <td className="px-4">{file_size}</td>
                <td className="px-5">{formatDate(created_at)}</td>

                <td className="px-5">
                    <button
                        className="btn btn-sm btn-outline-danger"
                        style={{
                            backgroundColor: "#FF0000",
                            borderRadius: 12,
                            color: "#fff",
                        }}
                        onClick={() => onDelete(contentId, id)}
                        title="Delete"
                    >
                        <Trash size={18} />
                    </button>
                </td>
            </tr>
        </>
    );
};

export default ResourcesRow;
