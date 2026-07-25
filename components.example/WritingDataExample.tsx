"use client";

import { useEffect, useState } from "react";
import { loadVocabulary } from "@/lib/hsk/client-vocabulary";
import type { HskLevel } from "@/types/hsk-vocabulary";

export default function WritingDataExample({
  level,
}: {
  level: HskLevel;
}) {
  const [characters, setCharacters] = useState<string[]>([]);

  useEffect(() => {
    loadVocabulary(level).then((words) => {
      const unique = new Set<string>();

      for (const word of words) {
        for (const character of Array.from(word.hanzi)) {
          if (/[\u3400-\u9fff]/u.test(character)) {
            unique.add(character);
          }
        }
      }

      setCharacters([...unique]);
    });
  }, [level]);

  return (
    <section>
      <h1>HSK {level} Writing Characters</h1>
      <p>{characters.length} unique characters</p>

      <div>
        {characters.slice(0, 100).map((character) => (
          <button key={character}>{character}</button>
        ))}
      </div>
    </section>
  );
}
