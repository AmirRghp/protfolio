export type DetailLayout = {
  direction: "row" | "column";
  panelW: number;
  panelH: number;
  panelLeft: number;
  panelTop: number;
  mediaW: number;
  mediaH: number;
  copyPadding: number;
  copyGap: number;
};

/**
 * Compute the centered detail-view bounding box and its media/copy split
 * for a given viewport. Switches from a two-column horizontal card on
 * desktop to a stacked vertical sheet on narrow viewports.
 */
export function getDetailLayout(vw: number, vh: number): DetailLayout {
  const compact = vw < 768;

  if (compact) {
    const panelW = Math.round(Math.min(vw - 24, 480));
    const panelH = Math.round(Math.min(vh - 24, 748));
    const mediaH = Math.round(Math.min(panelH * 0.23, 165));
    return {
      direction: "column",
      panelW,
      panelH,
      panelLeft: Math.round((vw - panelW) / 2),
      panelTop: Math.round((vh - panelH) / 2),
      mediaW: panelW,
      mediaH,
      copyPadding: 15,
      copyGap: 7,
    };
  }

  const panelW = Math.round(Math.min(1020, vw - 64));
  const panelH = Math.round(Math.min(620, vh - 64));
  const mediaW = Math.round(panelW * 0.42);

  return {
    direction: "row",
    panelW,
    panelH,
    panelLeft: Math.round((vw - panelW) / 2),
    panelTop: Math.round((vh - panelH) / 2),
    mediaW,
    mediaH: panelH,
    copyPadding: 28,
    copyGap: 12,
  };
}
