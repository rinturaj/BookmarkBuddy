import * as tf from "@tensorflow/tfjs";
import * as use from "@tensorflow-models/universal-sentence-encoder";

class TextEmbedder {
  model: any;
  isLoading: boolean;
  isLoaded: boolean;
  embeddingCache: Map<any, any>;
  embeddingDimension: number;
  useCache: any;
  constructor() {
    this.model = null;
    this.isLoading = true;
    this.isLoaded = false;
    this.embeddingCache = new Map();
    this.embeddingDimension = 512;
  }

  async detailsEmbeddeding(bookmarkDetails: any) {
    try {
      const query = `title: ${bookmarkDetails.title} , category: ${
        bookmarkDetails.details
      } , category: ${bookmarkDetails.category} , url: ${
        bookmarkDetails.url
      } , createdAt: ${new Date(bookmarkDetails.dateAdded).toISOString()}`;
      bookmarkDetails.embedding = await this.embedText(query);
    } catch (error) {
      console.error("Error generating embedding:", error);
    }
    return bookmarkDetails;
  }

  async initialize(options: any) {
    const { useCache = true, onProgress } = options;

    try {
      if (onProgress) onProgress({ status: "loading", progress: 0 });

      await tf.ready();
      const backendName = tf.getBackend() || "cpu";

      if (onProgress) onProgress({ status: "loading", progress: 0.3 });

      this.model = await use.load();

      if (onProgress) onProgress({ status: "loading", progress: 1 });

      this.isLoading = false;
      this.isLoaded = true;
      this.useCache = useCache;

      return this.model;
    } catch (error) {
      this.isLoading = false;
      console.error("Failed to load text embedding model:", error);
      throw error;
    }
  }

  async embedBatch(texts: any[], options: any = {}) {
    const { normalize = true } = options;

    if (!this.isLoaded) {
      throw new Error("Model not loaded. Call initialize() first.");
    }

    if (!texts || texts.length === 0) {
      return [];
    }

    const validTexts = texts.filter(
      (text: { trim: () => { (): any; new (): any; length: number } }) =>
        text && text.trim().length > 0
    );
    if (validTexts.length === 0) {
      return [];
    }

    let cacheResults = [];
    let textsToEmbed = [];
    let indexMapping = [];

    if (this.useCache) {
      for (let i = 0; i < validTexts.length; i++) {
        const text = validTexts[i];
        const cacheKey = this._getCacheKey(text);

        if (this.embeddingCache.has(cacheKey)) {
          cacheResults[i] = this.embeddingCache.get(cacheKey);
        } else {
          textsToEmbed.push(text);
          indexMapping.push(i);
        }
      }
    } else {
      textsToEmbed.push(...validTexts);
      indexMapping = validTexts.map((_: any, i: any) => i);
    }

    if (textsToEmbed.length === 0) {
      return cacheResults;
    }

    try {
      const embeddings = await this.model.embed(textsToEmbed);

      const embeddingArrays = await embeddings.array();

      const processedEmbeddings = normalize
        ? embeddingArrays.map(this._normalizeVector)
        : embeddingArrays;

      if (this.useCache) {
        for (let i = 0; i < textsToEmbed.length; i++) {
          const cacheKey = this._getCacheKey(textsToEmbed[i]);
          this.embeddingCache.set(cacheKey, processedEmbeddings[i]);
        }
      }

      const results = [...cacheResults];
      for (let i = 0; i < indexMapping.length; i++) {
        results[indexMapping[i]] = processedEmbeddings[i];
      }

      return results;
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw error;
    }
  }

  async embedText(text: string, options = {}) {
    if (!text || text.trim().length === 0) {
      return new Float32Array(this.embeddingDimension);
    }

    const results = await this.embedBatch([text], options);
    return results[0];
  }

  cosineSimilarity(vecA: any[], vecB: any[]) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }

    const dotProduct = tf.tensor1d(vecA).dot(tf.tensor1d(vecB)).dataSync()[0];
    const magnitudeA = Math.sqrt(
      vecA.reduce((sum: number, val: number) => sum + val * val, 0)
    );
    const magnitudeB = Math.sqrt(
      vecB.reduce((sum: number, val: number) => sum + val * val, 0)
    );

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  async calculateSimilarity(textA: any, textB: any) {
    const [embeddingA, embeddingB] = await this.embedBatch([textA, textB]);
    return this.cosineSimilarity(embeddingA, embeddingB);
  }

  async findSimilarTexts(queryText: any, candidates: any[], options: any = {}) {
    const { topK = 5, threshold = 0.5 } = options;

    if (!queryText || !candidates || candidates.length === 0) {
      return [];
    }

    const queryEmbedding = await this.embedText(queryText);
    const candidateEmbeddings = await this.embedBatch(candidates);

    const results = candidateEmbeddings.map((embedding, index) => {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      return {
        text: candidates[index],
        score: similarity,
        index,
      };
    });

    return results
      .filter((item) => item.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  clearCache() {
    this.embeddingCache.clear();
  }

  getCacheSize() {
    return this.embeddingCache.size;
  }

  isModelLoaded() {
    return this.isLoaded;
  }

  _normalizeVector(vector: any[]) {
    const magnitude = Math.sqrt(
      vector.reduce((sum: number, val: number) => sum + val * val, 0)
    );

    if (magnitude === 0) {
      return vector;
    }

    return vector.map((val: number) => val / magnitude);
  }

  _getCacheKey(text: string) {
    return text.trim().toLowerCase().substring(0, 100);
  }
}

const textEmbedder = new TextEmbedder();
export default textEmbedder;

export { TextEmbedder };
