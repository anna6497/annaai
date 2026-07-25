interface HanziCharacterData {
  strokes: string[];
  medians: number[][][];
  radStrokes?: number[];
}

export type HanziDataLoader = (
  character: string,
  onComplete: (
    data: HanziCharacterData,
  ) => void,
  onError: (
    error: unknown,
  ) => void,
) => void;

export const loadHanziData: HanziDataLoader = (
  character,
  onComplete,
  onError,
) => {
  import(
    `hanzi-writer-data/${character}.json`
  )
    .then((module) => {
      const data =
        "default" in module
          ? module.default
          : module;

      onComplete(
        data as HanziCharacterData,
      );
    })
    .catch((error: unknown) => {
      onError(error);
    });
};