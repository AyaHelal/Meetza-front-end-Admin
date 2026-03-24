/**
 * Utility to handle authenticated video downloads in meetza-admin.
 * Fetches the video file as a blob using the authToken and triggers a browser download.
 */
export async function downloadVideo(videoUrl, title, onStart, onEnd, onError) {
    if (!videoUrl) {
        if (onError) onError(new Error("Video URL is missing"));
        return;
    }

    try {
        if (onStart) onStart();

        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        const headers = {
            "ngrok-skip-browser-warning": "true",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(videoUrl, {
            method: "GET",
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        
        // Use the title or a timestamp-based filename
        const safeTitle = (title || "video").replace(/[^a-z0-9]/gi, "_").toLowerCase();
        a.download = `${safeTitle}.mp4`;
        
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        if (onEnd) onEnd();
    } catch (error) {
        console.error("Download failed:", error);
        if (onError) onError(error);
    }
}
