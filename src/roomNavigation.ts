export type RoomDestination = "room" | "monitor" | "arcade";

export type RoomNavigationState = {
  destination: RoomDestination;
};

export type RoomNavigationAction =
  | { type: "navigate"; destination: RoomDestination };

export const initialRoomNavigation: RoomNavigationState = {
  destination: "room",
};

export function roomNavigationReducer(
  state: RoomNavigationState,
  action: RoomNavigationAction,
): RoomNavigationState {
  if (action.type === "navigate") {
    if (action.destination === state.destination) return state;
    return { destination: action.destination };
  }

  return state;
}
