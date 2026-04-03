import { useState, useEffect, useCallback } from "react";

export interface LocalVideo {
  id: string;
  requestId: string;
  type: "text-to-video" | "image-to-video";
  prompt: string;
  imageUrl?: string;
  videoUrl?: string;
  status: "pending" | "processing" | "done" | "failed" | "expired";
  duration: number;
  aspectRatio: string;
  resolution: string;
  errorMessage?: string;
  createdAt: number;
  completedAt?: number;
}

const STORAGE_KEY = "ai_video_generator_videos";
const MAX_VIDEOS = 10;

export function useLocalVideos() {
  const [videos, setVideos] = useState<LocalVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load videos from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LocalVideo[];
        setVideos(parsed);
      }
    } catch (error) {
      console.error("Failed to load videos from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save videos to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
      } catch (error) {
        console.error("Failed to save videos to localStorage:", error);
      }
    }
  }, [videos, isLoading]);

  const addVideo = useCallback((video: Omit<LocalVideo, "id" | "createdAt">) => {
    setVideos((prev) => {
      // Check if we've reached the max videos limit
      if (prev.length >= MAX_VIDEOS) {
        // Remove oldest pending video or oldest video overall
        const oldestPendingIndex = prev.findIndex((v) => v.status === "pending");
        const indexToRemove = oldestPendingIndex !== -1 ? oldestPendingIndex : 0;
        const newVideos = [...prev];
        newVideos.splice(indexToRemove, 1);
        return [
          ...newVideos,
          {
            ...video,
            id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
          },
        ];
      }

      return [
        ...prev,
        {
          ...video,
          id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
        },
      ];
    });
  }, []);

  const updateVideo = useCallback((requestId: string, updates: Partial<LocalVideo>) => {
    setVideos((prev) =>
      prev.map((v) => (v.requestId === requestId ? { ...v, ...updates } : v))
    );
  }, []);

  const deleteVideo = useCallback((id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const getVideo = useCallback(
    (requestId: string) => {
      return videos.find((v) => v.requestId === requestId);
    },
    [videos]
  );

  return {
    videos,
    isLoading,
    addVideo,
    updateVideo,
    deleteVideo,
    getVideo,
  };
}
