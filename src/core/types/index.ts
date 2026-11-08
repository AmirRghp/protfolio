/**
 * Core domain types and common interfaces.
 */

/**
 * 2D coordinate point {x, y} in pixel or screen space.
 */
export type Point = {
  x: number;
  y: number;
};

/**
 * 2D dimensions {width, height} in pixels or units.
 */
export type Dimensions = {
  width: number;
  height: number;
};

/**
 * Viewport dimensions in CSS pixels.
 */
export type ViewportSize = {
  width: number;
  height: number;
};
