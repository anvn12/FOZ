import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FeedType = "for-you" | "latest";

type FeedState = {
  activeTab: FeedType;
  setActiveTab: (tab: FeedType) => void;
};

export const useFeedStore = create<FeedState>()(
  persist(
    (set) => ({
      activeTab: "latest",
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "foz-feed-tab",
    },
  ),
);
