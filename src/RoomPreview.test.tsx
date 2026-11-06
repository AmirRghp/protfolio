import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RoomPreview from "./RoomPreview";
import type { RoomNavigationState } from "./roomNavigation";

describe("RoomPreview component", () => {
  it("renders the room header with role and read portfolio link without destination buttons in overview", () => {
    const navigation: RoomNavigationState = {
      destination: "room",
    };

    const html = renderToStaticMarkup(
      <RoomPreview
        navigation={navigation}
        onNavigate={() => {}}
      />,
    );

    expect(html).toContain("Read portfolio");
    expect(html).toContain("Study room overview");
    expect(html).not.toContain('id="destination-monitor"');
    expect(html).not.toContain('id="destination-board"');
    expect(html).not.toContain('id="destination-arcade"');
    expect(html).not.toContain("Project board");
    expect(html).not.toContain("Go Back (ESC)");
    expect(html).toContain("Study overview · Select the monitor or arcade in the room.");
  });

  it("renders the Go Back button when focused on a destination", () => {
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
    expect(html).toContain("Focused on Monitor.");
    expect(html).not.toContain("Oiia Cat music controls");
  });

  it("renders Oiia Cat HUD controls in room overview and reflects audio state", async () => {
    const { oiiaAudio } = await import("./oiiaAudio");
    oiiaAudio.reset();

    const overviewNav: RoomNavigationState = { destination: "room" };
    let html = renderToStaticMarkup(
      <RoomPreview navigation={overviewNav} onNavigate={() => {}} />
    );

    expect(html).toContain("Oiia Cat music controls");
    expect(html).toContain("Oiia Cat: Dance");
    expect(html).toContain("Start Oiia Cat musical dance");
    expect(html).not.toContain("Oiia Cat: Dancing");
    expect(html).not.toContain("Mute Oiia Cat audio");

    // Start playing
    await oiiaAudio.play();
    html = renderToStaticMarkup(
      <RoomPreview navigation={overviewNav} onNavigate={() => {}} />
    );

    expect(html).toContain("Oiia Cat: Dancing 🎵");
    expect(html).toContain("Pause Oiia Cat dance");
    expect(html).toContain("Mute Oiia Cat audio");

    // Reset audio back to clean state
    oiiaAudio.reset();
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
    expect(html).toContain("Focused on Arcade.");
  });
});
