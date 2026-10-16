import { portfolioContent } from "./content";

export type RoomDestination = "room" | "monitor" | "board" | "arcade";

export type RoomNavigationState = {
  destination: RoomDestination;
  selectedProjectId: string | null;
};

export type RoomNavigationAction =
  | { type: "navigate"; destination: RoomDestination }
  | { type: "select-project"; projectId: string | null };

export const initialRoomNavigation: RoomNavigationState = {
  destination: "room",
  selectedProjectId: null,
};

const projectIds = new Set(portfolioContent.projects.map(({ id }) => id));

export function roomNavigationReducer(
  state: RoomNavigationState,
  action: RoomNavigationAction,
): RoomNavigationState {
  if (action.type === "navigate") {
    if (action.destination === state.destination) return state;
    return { destination: action.destination, selectedProjectId: null };
  }

  if (state.destination !== "board" || (action.projectId !== null && !projectIds.has(action.projectId))) {
    return state;
  }

  return { ...state, selectedProjectId: action.projectId };
}
