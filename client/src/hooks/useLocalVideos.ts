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

  const saveVideosToStorage = (videosToSave: LocalVideo[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videosToSave));
    } catch (error) {
      console.error("Failed to save videos to localStorage:", error);
    }
  };

  const addVideo = useCallback((video: Omit<LocalVideo, "id" | "createdAt">) => {
    const newVideo = {
      ...video,
      id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };

    setVideos((prev) => {
      let updatedVideos = [...prev];
      if (updatedVideos.length >= MAX_VIDEOS) {
        const oldestPendingIndex = updatedVideos.findIndex((v) => v.status === "pending");
        const indexToRemove = oldestPendingIndex !== -1 ? oldestPendingIndex : 0;
        updatedVideos.splice(indexToRemove, 1);
      }
      const finalVideos = [...updatedVideos, newVideo];
      saveVideosToStorage(finalVideos); // Save synchronously
      return finalVideos;
    });
  }, []);

  const updateVideo = useCallback((requestId: string, updates: Partial<LocalVideo>) => {
    setVideos((prev) => {
      const updatedVideos = prev.map((v) => (v.requestId === requestId ? { ...v, ...updates } : v));
      saveVideosToStorage(updatedVideos); // Save synchronously
      return updatedVideos;
    });
  }, []);

  const deleteVideo = useCallback((id: string) => {
    setVideos((prev) => {
      const updatedVideos = prev.filter((v) => v.id !== id);
      saveVideosToStorage(updatedVideos); // Save synchronously
      return updatedVideos;
    });
  }, []);

  const getVideo = useCallback(
    (requestId: string) => {
      // Read directly from localStorage for immediate consistency
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LocalVideo[];
        return parsed.find((v) => v.requestId === requestId);
      }
      return undefined;
    },
    []
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
