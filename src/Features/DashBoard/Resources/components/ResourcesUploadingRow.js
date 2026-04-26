import React from "react";
import { File } from "phosphor-react";

/**
 * Shown as the first row in Group Content Resources while a file is uploading;
 * link column shows loading until the server returns the file URL.
 */
export function ResourcesTableRowUploading({ fileName }) {
  return (
    <tr className="align-middle resources-row--uploading bg-light" role="status" aria-live="polite" aria-busy="true">
      <td className="px-3 text-muted small">
        <div className="d-flex align-items-center gap-2 min-w-0">
          <div className="spinner-border spinner-border-sm text-primary flex-shrink-0" role="presentation" />
          <span className="text-break">Link loading...will appear here when the upload is complete</span>
        </div>
      </td>
      <td className="px-4 fw-medium">{fileName || "—"}</td>
      <td className="px-3">
        <span className="badge rounded-pill text-bg-warning text-dark">In progress</span>
      </td>
      <td className="px-4 text-muted">—</td>
      <td className="px-5 text-muted">—</td>
      <td className="px-5 text-muted small">—</td>
    </tr>
  );
}

export function ResourcesCardUploading({ fileName }) {
  return (
    <div className="user-card resources-row-card border border-warning border-2" role="status" aria-live="polite" aria-busy="true">
      <div className="user-card-body">
        <div className="user-card-header">
          <div className="user-card-avatar user-card-avatar-placeholder d-flex align-items-center justify-content-center">
            <File size={28} weight="bold" className="text-primary" />
          </div>
          <div className="user-card-title-wrap min-w-0">
            <span className="user-card-name text-truncate d-block" title={fileName}>
              {fileName || "—"}
            </span>
            <span className="user-card-role d-flex align-items-center gap-1 flex-wrap">
              <span className="badge rounded-pill text-bg-warning text-dark">In progress</span>
            </span>
          </div>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">URL</span>
          <div className="user-card-value d-flex align-items-center gap-2 text-muted small">
            <div className="spinner-border spinner-border-sm text-primary" role="presentation" />
            <span>جاري تحميل الرابط…</span>
          </div>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Size</span>
          <span className="user-card-value text-muted">—</span>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Created</span>
          <span className="user-card-value text-muted">—</span>
        </div>
      </div>
    </div>
  );
}
