declare module "hanzi-writer-data/*.json" {
  /**
   * A single coordinate point used by Hanzi Writer.
   *
   * Example:
   * [120, 450]
   */
  export type HanziPoint = [number, number];

  /**
   * Median points describing the center line of one stroke.
   */
  export type HanziMedian = HanziPoint[];

  /**
   * Character stroke data used by Hanzi Writer.
   */
  export interface HanziCharacterData {
    /**
     * SVG path strings.
     * Each array item represents one stroke.
     */
    strokes: string[];

    /**
     * Median coordinate data for each stroke.
     */
    medians: HanziMedian[];

    /**
     * Indexes of strokes that belong to the radical.
     */
    radStrokes?: number[];
  }

  const characterData: HanziCharacterData;

  export default characterData;
}

declare module "hanzi-writer-data/*" {
  /**
   * A single coordinate point used by Hanzi Writer.
   */
  export type HanziPoint = [number, number];

  /**
   * Median points describing the center line of one stroke.
   */
  export type HanziMedian = HanziPoint[];

  /**
   * Character stroke data used by Hanzi Writer.
   */
  export interface HanziCharacterData {
    strokes: string[];
    medians: HanziMedian[];
    radStrokes?: number[];
  }

  const characterData: HanziCharacterData;

  export default characterData;
}