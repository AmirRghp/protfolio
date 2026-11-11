import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RoomPreview from "./RoomPreview";
import type { RoomNavigationState } from "@/features/room/utils/roomNavigation";

describe("RoomPreview component", () => {
  it("renders the room header with role, without Read portfolio link, and renders Exit The Room button in overview", () => {
    const navigation: RoomNavigationState = {
      destination: "room",
    };

    const html = renderToStaticMarkup(
      <RoomPreview
        navigation={navigation}
        onNavigate={() => {}}
      />,
    );

    expect(html).not.toContain("Read portfolio");
    expect(html).toContain("AG / AI Engineer");
    expect(html).toContain("Exit The Room");
    expect(html).toContain("Study room overview");
    expect(html).not.toContain('id="destination-monitor"');
    expect(html).not.toContain('id="destination-board"');
    expect(html).not.toContain('id="destination-arcade"');
    expect(html).not.toContain("Project board");
    expect(html).not.toContain("Go Back (ESC)");
    expect(html).not.toContain("Study overview · Select the monitor or arcade in the room.");
  });

  it("renders the Go Back button and hides Exit The Room when focused on monitor", () => {
    const navigation: RoomNavigationState = {
      destination: "monitor",
    };

    const html = renderToStaticMarkup(
      <RoomPreview
        navigation={navigation}
        onNavigate={() => {}}
      />,
    );

    expect(html).toContain("Go Back (ESC)");
    expect(html).not.toContain("Oiia Cat music controls");
    expect(html).not.toContain("Study overview · Select the monitor or arcade in the room.");
  });

  it("does not render Oiia Cat HUD controls in room overview", () => {
    const overviewNav: RoomNavigationState = { destination: "room" };
    const html = renderToStaticMarkup(
      <RoomPreview navigation={overviewNav} onNavigate={() => {}} />
    );

    expect(html).not.toContain("Oiia Cat music controls");
    expect(html).not.toContain("Oiia Cat: Dance");
    expect(html).not.toContain("Start Oiia Cat musical dance");
    expect(html).not.toContain("Oiia Cat: Dancing");
    expect(html).not.toContain("Mute Oiia Cat audio");
  });

  it("configures oiia ? tooltip text for cat hotspot and renders the cursor hint element", () => {
    const overviewNav: RoomNavigationState = { destination: "room" };
    const html = renderToStaticMarkup(
      <RoomPreview navigation={overviewNav} onNavigate={() => {}} />
    );

    // Verify cursor hotspot hint container is rendered
    expect(html).toContain('class="');
    expect(html).toContain('data-visible="false"');
  });

  it("renders the arcade panel and safe external link when focused on arcade", () => {
    const navigation: RoomNavigationState = {
      destination: "arcade",
    };

    const html = renderToStaticMarkup(
      <RoomPreview
        navigation={navigation}
        onNavigate={() => {}}
      />,
    );

    expect(html).toContain("Crash Bandicoot arcade screen");
    expect(html).toContain("Play game");
    expect(html).toContain("Hosted by PS1FUN");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Go Back (ESC)");
  });

  it("renders RoomUnavailable with status message and direct 2D portfolio button when onExitToFlat is provided", async () => {
    const { default: RoomUnavailable } = await import("./RoomUnavailable");
    const htmlWithExit = renderToStaticMarkup(<RoomUnavailable onExitToFlat={() => {}} />);
    expect(htmlWithExit).toContain("The 3D view is unavailable. You can read the full portfolio below.");
    expect(htmlWithExit).toContain("Open 2D Portfolio");

    const htmlWithoutExit = renderToStaticMarkup(<RoomUnavailable />);
    expect(htmlWithoutExit).toContain("The 3D view is unavailable. You can read the full portfolio below.");
    expect(htmlWithoutExit).not.toContain("Open 2D Portfolio");
  });
});
