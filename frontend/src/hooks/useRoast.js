import { useState, useCallback, useRef, useEffect } from "react";
import { streamRoast, fetchPreviewUrl } from "../api";

export function useRoast() {
  const [view, setView] = useState("pick"); // "pick" | "streaming" | "report"
  const [severity, setSeverity] = useState("medium");
  const [roastData, setRoastData] = useState(null);
  const [error, setError] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [streamingText, setStreamingText] = useState("");
  const accumulatorRef = useRef("");
  const abortRef = useRef(null);

  // Scroll to top on view transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  const abort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setView("pick");
    setStreamingText("");
    accumulatorRef.current = "";
  }, []);

  const startRoast = useCallback(async ({ artist, title, lyrics, previewUrl }) => {
    // Abort any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setCurrentSong({ artist, title, previewUrl: previewUrl || null });
    setStreamingText("");

    // Fetch preview URL in parallel if not provided (searched songs)
    if (!previewUrl) {
      fetchPreviewUrl(artist, title).then((url) => {
        if (!controller.signal.aborted) {
          setCurrentSong((prev) => prev && { ...prev, previewUrl: url });
        }
      });
    }
    accumulatorRef.current = "";
    setView("streaming");

    try {
      await streamRoast({
        artist,
        title,
        severity,
        lyrics,
        signal: controller.signal,
        onToken(text) {
          accumulatorRef.current += text;
          setStreamingText(accumulatorRef.current);
        },
        onDone(data) {
          setRoastData(data);
          setView("report");
        },
        onError(msg) {
          setError(msg);
          setView("pick");
        },
      });
    } catch (e) {
      if (e.name === "AbortError") return;
      setError(e.message);
      setView("pick");
    }
  }, [severity]);

  const reRoast = useCallback(async (newSeverity) => {
    if (!currentSong) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSeverity(newSeverity);
    setError(null);
    setStreamingText("");
    accumulatorRef.current = "";
    setView("streaming");

    try {
      await streamRoast({
        artist: currentSong.artist,
        title: currentSong.title,
        severity: newSeverity,
        signal: controller.signal,
        onToken(text) {
          accumulatorRef.current += text;
          setStreamingText(accumulatorRef.current);
        },
        onDone(data) {
          setRoastData(data);
          setView("report");
        },
        onError(msg) {
          setError(msg);
          setView("report");
        },
      });
    } catch (e) {
      if (e.name === "AbortError") return;
      setError(e.message);
      setView("report");
    }
  }, [currentSong]);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = null;
    setView("pick");
    setRoastData(null);
    setError(null);
    setCurrentSong(null);
    setStreamingText("");
    accumulatorRef.current = "";
  }, []);

  return {
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
  };
}
