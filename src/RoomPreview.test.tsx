import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RoomPreview from "./RoomPreview";
import type { RoomNavigationState } from "./roomNavigation";

describe("RoomPreview component", () => {
  it("renders the room header with status, read portfolio link, and destination buttons in overview", () => {
    const navigation: RoomNavigationState = {
      destination: "room",
      selectedProjectId: null,
    };

    const html = renderToStaticMarkup(
      <RoomPreview
        navigation={navigation}
        onNavigate={() => {}}
        onSelectProject={() => {}}
      />,
    );

    expect(html).toContain("Read portfolio");
    expect(html).toContain('id="destination-monitor"');
    expect(html).toContain('id="destination-board"');
    expect(html).toContain('id="destination-arcade"');
    expect(html).toContain("Monitor");
    expect(html).toContain("Project board");
    expect(html).toContain("Arcade");
    expect(html).toContain("Study room overview");
    expect(html).not.toContain("Go Back (ESC)");
  });

  it("renders the Go Back button when focused on a destination", () => {
    const navigation: RoomNavigationState = {
      destination: "monitor",
      selectedProjectId: null,
    };

    const html = renderToStaticMarkup(
      <RoomPreview
        navigation={navigation}
        onNavigate={() => {}}
        onSelectProject={() => {}}
      />,
    );

    expect(html).toContain("Go Back (ESC)");
    expect(html).not.toContain('id="destination-monitor"');
  });

  it("renders the arcade panel and safe external link when focused on arcade", () => {
    const navigation: RoomNavigationState = {
      destination: "arcade",
      selectedProjectId: null,
    };

    const html = renderToStaticMarkup(
      <RoomPreview
        navigation={navigation}
        onNavigate={() => {}}
        onSelectProject={() => {}}
      />,
    );

    expect(html).toContain("Crash Bandicoot arcade screen");
    expect(html).toContain("Play game");
    expect(html).toContain("Hosted by PS1FUN");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Go Back (ESC)");
  });

  it("renders the project board modal when navigation destination is board", () => {
    const navigation: RoomNavigationState = {
      destination: "board",
      selectedProjectId: null,
    };

    const html = renderToStaticMarkup(
      <RoomPreview
        navigation={navigation}
        onNavigate={() => {}}
        onSelectProject={() => {}}
      />,
    );

    expect(html).toContain("Project board");
    expect(html).toContain("Close board · Back to room");
    expect(html).toContain("Go Back (ESC)");
  });
});
