import { create } from "zustand";
import type { Category } from "../lib/mockData";

export type FeedFilter = Category | "All";

type FeedFilterState = {
  filter: FeedFilter;
  setFilter: (filter: FeedFilter) => void;
};

// Shared across the Feed screen (chip bar) and any future screen/widget
// that needs to know or change the active category — that's why it's
// global state rather than useState local to one component.
export const useFeedFilterStore = create<FeedFilterState>((set) => ({
  filter: "All",
  setFilter: (filter) => set({ filter }),
}));
