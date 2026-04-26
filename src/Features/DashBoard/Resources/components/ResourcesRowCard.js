import React from "react";
import { Trash, File, Link as LinkIcon } from "phosphor-react";

const formatCreatedAt = (created_at) => {
  if (!created_at) return "—";
  const date = new Date(created_at);
  date.setHours(date.getHours() + 1);
  return date.toLocaleString("en-EG", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

export const ResourcesRowCard = ({ resource, onDelete, contentId }) => {
  if (!resource) return null;

  const { id, file_url, file_name, file_type, file_size, created_at } = resource;
  const isLink = file_type === "link";

  return (
    <div className="user-card resources-row-card">
      <div className="user-card-body">
        <div className="user-card-header user-card-header--icon-only">
          <div className="user-card-avatar user-card-avatar-placeholder">
            {isLink ? <LinkIcon size={28} weight="bold" /> : <File size={28} weight="bold" />}
          </div>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">File URL</span>
          {file_url ? (
            <a
              href={file_url}
              target="_blank"
              rel="noreferrer"
              className="user-card-value user-card-value-wrap text-break"
            >
              {file_url}
            </a>
          ) : (
            <span className="user-card-value">—</span>
          )}
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">File Name</span>
          <span className="user-card-value">{isLink ? "External Link" : file_name || "—"}</span>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">File Type</span>
          <span className="user-card-value">{isLink ? "Link" : file_type || "—"}</span>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">File Size</span>
          <span className="user-card-value">{file_size || "—"}</span>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Created At</span>
          <span className="user-card-value">{formatCreatedAt(created_at)}</span>
        </div>
        <div className="user-card-actions">
          <button
            type="button"
            className="btn btn-sm user-card-btn user-card-btn-delete"
            onClick={() => onDelete(contentId, id)}
            aria-label="Delete resource"
          >
            <Trash size={20} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
