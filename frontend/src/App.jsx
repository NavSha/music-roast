import { useEffect } from "react";
import Header from "./components/Header";
import SongPicker from "./components/SongPicker";
import StreamingView from "./components/StreamingView";
import RoastReport from "./components/RoastReport";
import ErrorDisplay from "./components/ErrorDisplay";
import { useRoast } from "./hooks/useRoast";
import { checkHealth } from "./api";

export default function App() {
  const {
    view,
    severity,
    setSeverity,
    roastData,
    error,
    setError,
    currentSong,
    streamingText,
    startRoast,
    reRoast,
    reset,
    abort,
  } = useRoast();

  useEffect(() => {
    checkHealth().then((data) => {
      if (!data.api_key_configured) {
        setError("Backend API key not configured. Set ANTHROPIC_API_KEY in backend/.env");
      }
    }).catch(() => {
      setError("Cannot reach backend. Make sure Flask is running on port 5000.");
    });
  }, [setError]);

  return (
    <div className="min-h-screen">
      <Header compact={view !== "pick"} onGoHome={view !== "pick" ? reset : undefined} />

      <ErrorDisplay message={error} onDismiss={() => setError(null)} />

      {view === "pick" && (
        <SongPicker
          severity={severity}
          onSeverityChange={setSeverity}
          onSelectSong={(song) => startRoast({ artist: song.artist, title: song.title, previewUrl: song.previewUrl })}
        />
      )}

      {view === "streaming" && (
        <StreamingView streamingText={streamingText} song={currentSong} onAbort={abort} />
      )}

      {view === "report" && (
        <RoastReport
          data={roastData}
          previewUrl={currentSong?.previewUrl}
          onReRoast={reRoast}
          onReset={reset}
        />
      )}
    </div>
  );
}
