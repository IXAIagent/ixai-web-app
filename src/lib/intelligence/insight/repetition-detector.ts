const STOP_WORDS = new Set([
  "市場",
  "觀察",
  "本週",
  "今天",
  "資金",
  "風險",
  "證據",
  "需要",
  "是否",
  "AI",
  "IXAI",
]);

function normalize(value: string) {
  return value
    .replace(/[，。！？、：:；;,.!?()\[\]【】]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function keywords(value: string) {
  return normalize(value)
    .split(/\s+|(?=[A-Za-z])|(?<=[A-Za-z])/)
    .flatMap((part) => part.split(/(?=[\u4e00-\u9fff]{2,})/))
    .map((part) => part.trim())
    .filter((part) => part.length >= 2 && !STOP_WORDS.has(part))
    .slice(0, 16);
}

export function narrativeSimilarity(a: string, b: string) {
  const aSet = new Set(keywords(a));
  const bSet = new Set(keywords(b));

  if (!aSet.size || !bSet.size) return 0;

  let intersection = 0;
  for (const item of aSet) {
    if (bSet.has(item)) intersection += 1;
  }

  return intersection / Math.min(aSet.size, bSet.size);
}

export function detectRepeatedNarrative(values: string[], threshold = 0.72) {
  const repeatedPairs: { first: number; second: number; similarity: number }[] = [];

  for (let i = 0; i < values.length; i += 1) {
    for (let j = i + 1; j < values.length; j += 1) {
      const score = narrativeSimilarity(values[i] ?? "", values[j] ?? "");
      if (score >= threshold) {
        repeatedPairs.push({ first: i, second: j, similarity: score });
      }
    }
  }

  return {
    hasRepetition: repeatedPairs.length > 0,
    repeatedPairs,
  };
}

export function ensureDistinctNarratives(values: string[], fallbacks: string[]) {
  const output: string[] = [];

  values.forEach((value, index) => {
    const existing = detectRepeatedNarrative([...output, value]);
    if (!value || existing.hasRepetition) {
      output.push(fallbacks[index] ?? value);
    } else {
      output.push(value);
    }
  });

  return output;
}

export function detectCrossPeriodSimilarity(
  dailySlides: string[],
  weeklySlides: string[],
  threshold = 0.68,
) {
  const comparedIndexes = [0, 1, 4];
  const matches = comparedIndexes
    .map((index) => ({
      dailySlide: index + 1,
      similarity: narrativeSimilarity(dailySlides[index] ?? "", weeklySlides[index] ?? ""),
      weeklySlide: index + 1,
    }))
    .filter((match) => match.similarity >= threshold);

  return {
    hasCrossPeriodOverlap: matches.length > 0,
    matches,
  };
}
