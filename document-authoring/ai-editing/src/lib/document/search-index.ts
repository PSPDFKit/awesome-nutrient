import type { ElementKind } from "@/lib/tools/contracts";

const BM25_K1 = 1.2;
const BM25_B = 0.75;
const PHRASE_MATCH_BOOST = 6;
const PROXIMITY_BOOST = 3;
const EPSILON = 1e-9;

export type SearchMode = "exact_phrase" | "keyword" | "hybrid";

export type SearchableElement = {
  id: string;
  kind: ElementKind;
  path: number[];
  preview: string;
  searchText: string;
};

export type SearchScoreBreakdown = {
  bm25: number;
  phrase: number;
  proximity: number;
  kindPrior: number;
  positionPrior: number;
  final: number;
};

export type RankedElementMatch = {
  elementId: string;
  score: number;
  scoreBreakdown: SearchScoreBreakdown;
};

type SearchCorpus = {
  normalizedText: string;
  terms: string[];
  termFrequency: Map<string, number>;
  termPositions: Map<string, number[]>;
  docLength: number;
};

export const normalizeSearchText = (value: string): string =>
  value.trim().toLowerCase();

export const tokenizeSearchText = (value: string): string[] =>
  normalizeSearchText(value).match(/[a-z0-9]+/g) ?? [];

const comparePaths = (left: number[], right: number[]): number => {
  const maxLength = Math.max(left.length, right.length);
  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = left[index] ?? -1;
    const rightValue = right[index] ?? -1;
    if (leftValue < rightValue) {
      return -1;
    }
    if (leftValue > rightValue) {
      return 1;
    }
  }
  return 0;
};

const computeTermFrequency = (terms: string[]): Map<string, number> => {
  const frequency = new Map<string, number>();
  terms.forEach((term) => {
    frequency.set(term, (frequency.get(term) ?? 0) + 1);
  });
  return frequency;
};

const computeTermPositions = (terms: string[]): Map<string, number[]> => {
  const positions = new Map<string, number[]>();
  terms.forEach((term, index) => {
    const existing = positions.get(term);
    if (existing) {
      existing.push(index);
      return;
    }
    positions.set(term, [index]);
  });
  return positions;
};

export class ElementSearchIndex {
  private elements: SearchableElement[] = [];
  private elementsById = new Map<string, SearchableElement>();
  private corpusById = new Map<string, SearchCorpus>();
  private documentFrequency = new Map<string, number>();
  private averageDocLength = 0;

  rebuild(elements: SearchableElement[]): void {
    this.elements = elements;
    this.elementsById = new Map(
      elements.map((element) => [element.id, element]),
    );
    this.corpusById = new Map();
    this.documentFrequency = new Map();

    let totalDocLength = 0;
    this.elements.forEach((element) => {
      const corpus = this.buildCorpus(element);
      this.corpusById.set(element.id, corpus);
      totalDocLength += corpus.docLength;

      const uniqueTerms = new Set(corpus.terms);
      uniqueTerms.forEach((term) => {
        this.documentFrequency.set(
          term,
          (this.documentFrequency.get(term) ?? 0) + 1,
        );
      });
    });

    this.averageDocLength =
      this.elements.length > 0 ? totalDocLength / this.elements.length : 0;
  }

  search(input: {
    query: string;
    mode: SearchMode;
    kinds: ElementKind[];
    maxResults: number;
    minScore: number;
  }): RankedElementMatch[] {
    const normalizedQuery = normalizeSearchText(input.query);
    const queryTerms = tokenizeSearchText(input.query);
    const allowedKinds = new Set(input.kinds);
    const effectiveMinScore = Math.max(input.minScore, EPSILON);

    return this.elements
      .filter((element) => allowedKinds.has(element.kind))
      .map((element) => {
        const scoreBreakdown = this.scoreElement(
          element,
          input.mode,
          normalizedQuery,
          queryTerms,
        );
        return {
          elementId: element.id,
          score: scoreBreakdown.final,
          scoreBreakdown,
        };
      })
      .filter((entry) => entry.score >= effectiveMinScore)
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }
        const leftElement = this.elementsById.get(left.elementId);
        const rightElement = this.elementsById.get(right.elementId);
        if (!leftElement || !rightElement) {
          return 0;
        }
        return comparePaths(leftElement.path, rightElement.path);
      })
      .slice(0, input.maxResults);
  }

  private buildCorpus(element: SearchableElement): SearchCorpus {
    const normalizedText = normalizeSearchText(
      `${element.preview} ${element.searchText}`,
    );
    const terms = tokenizeSearchText(normalizedText);
    return {
      normalizedText,
      terms,
      termFrequency: computeTermFrequency(terms),
      termPositions: computeTermPositions(terms),
      docLength: terms.length,
    };
  }

  private getCorpus(elementId: string): SearchCorpus {
    const corpus = this.corpusById.get(elementId);
    if (!corpus) {
      throw new Error(`Search corpus not found for element ${elementId}.`);
    }
    return corpus;
  }

  private computeBm25Score(corpus: SearchCorpus, queryTerms: string[]): number {
    if (queryTerms.length === 0 || corpus.docLength === 0) {
      return 0;
    }

    const totalDocs = this.elements.length;
    const avgDocLength = Math.max(this.averageDocLength, 1);
    return queryTerms.reduce((total, term) => {
      const termFrequency = corpus.termFrequency.get(term) ?? 0;
      if (termFrequency === 0) {
        return total;
      }

      const docFrequency = this.documentFrequency.get(term) ?? 0;
      const idf = Math.log(
        1 + (totalDocs - docFrequency + 0.5) / (docFrequency + 0.5),
      );
      const denominator =
        termFrequency +
        BM25_K1 * (1 - BM25_B + BM25_B * (corpus.docLength / avgDocLength));
      const score =
        idf *
        ((termFrequency * (BM25_K1 + 1)) / Math.max(denominator, EPSILON));
      return total + score;
    }, 0);
  }

  private computePhraseScore(
    corpus: SearchCorpus,
    normalizedQuery: string,
  ): number {
    if (normalizedQuery.length === 0) {
      return 0;
    }
    return corpus.normalizedText.includes(normalizedQuery)
      ? PHRASE_MATCH_BOOST
      : 0;
  }

  private computeProximityScore(
    corpus: SearchCorpus,
    queryTerms: string[],
  ): number {
    const uniqueTerms = [...new Set(queryTerms)];
    if (uniqueTerms.length < 2) {
      return 0;
    }

    const positionLists = uniqueTerms
      .map((term) => corpus.termPositions.get(term))
      .filter(
        (positions): positions is number[] =>
          Array.isArray(positions) && positions.length > 0,
      );

    if (positionLists.length < 2) {
      return 0;
    }

    let minDistance = Number.POSITIVE_INFINITY;
    for (let leftIndex = 0; leftIndex < positionLists.length; leftIndex += 1) {
      const left = positionLists[leftIndex]!;
      for (
        let rightIndex = leftIndex + 1;
        rightIndex < positionLists.length;
        rightIndex += 1
      ) {
        const right = positionLists[rightIndex]!;
        left.forEach((leftPosition) => {
          right.forEach((rightPosition) => {
            const distance = Math.abs(leftPosition - rightPosition);
            if (distance < minDistance) {
              minDistance = distance;
            }
          });
        });
      }
    }

    if (!Number.isFinite(minDistance)) {
      return 0;
    }

    return (1 / (1 + minDistance)) * PROXIMITY_BOOST;
  }

  private computeKindPrior(): number {
    return 1;
  }

  private computePositionPrior(path: number[]): number {
    const sectionIndex = path[0] ?? 0;
    const blockIndex = path[1] ?? 0;
    const linearIndex = sectionIndex * 1000 + blockIndex;
    return 1 / (1 + linearIndex * 0.005);
  }

  private scoreElement(
    element: SearchableElement,
    mode: SearchMode,
    normalizedQuery: string,
    queryTerms: string[],
  ): SearchScoreBreakdown {
    const corpus = this.getCorpus(element.id);
    const bm25 = this.computeBm25Score(corpus, queryTerms);
    const phrase = this.computePhraseScore(corpus, normalizedQuery);
    const proximity = this.computeProximityScore(corpus, queryTerms);
    const kindPrior = this.computeKindPrior();
    const positionPrior = this.computePositionPrior(element.path);

    const keywordComponent = bm25;
    const phraseComponent = phrase;
    const hybridBase = keywordComponent + phraseComponent + proximity;

    const baseScore =
      mode === "exact_phrase"
        ? phraseComponent
        : mode === "keyword"
          ? keywordComponent
          : hybridBase;
    const final = baseScore * kindPrior * positionPrior;

    return {
      bm25,
      phrase,
      proximity,
      kindPrior,
      positionPrior,
      final,
    };
  }
}
