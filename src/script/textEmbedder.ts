// textEmbedding.js - A module for generating embeddings locally using TensorFlow.js

import * as tf from "@tensorflow/tfjs";
// Import the Universal Sentence Encoder (USE) model
import * as use from "@tensorflow-models/universal-sentence-encoder";

/**
 * TextEmbedder - A class to handle local text embedding using TensorFlow.js
 * This allows for semantic search capabilities without external API dependencies
 */
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
    this.embeddingCache = new Map(); // Cache to avoid re-embedding the same text
    this.embeddingDimension = 512; // USE model dimension
  }

  /**
   * Initializes the Universal Sentence Encoder model
   * @param {Object} options Configuration options
   * @param {boolean} options.useCache Whether to use embedding cache (default: true)
   * @param {Function} options.onProgress Callback for loading progress updates
   * @returns {Promise<void>} Resolves when model is loaded
   */
  async initialize(options: any) {
    const { useCache = true, onProgress } = options;

    try {
      // Report loading started
      if (onProgress) onProgress({ status: "loading", progress: 0 });

      // Set up TensorFlow.js - use WebGL backend if available for better performance
      await tf.ready();
      const backendName = tf.getBackend() || "cpu";
      console.log(`Using TensorFlow.js backend: ${backendName}`);

      // Load the model
      if (onProgress) onProgress({ status: "loading", progress: 0.3 });

      // We'll use the smaller 'lite' version of the USE model for better performance
      // For higher accuracy but slower speed, remove the 'lite' from the URL
      this.model = await use.load();

      if (onProgress) onProgress({ status: "loading", progress: 1 });

      this.isLoading = false;
      this.isLoaded = true;
      this.useCache = useCache;

      console.log("Text embedding model loaded successfully");
      return this.model;
    } catch (error) {
      this.isLoading = false;
      console.error("Failed to load text embedding model:", error);
      throw error;
    }
  }

  /**
   * Generates embeddings for a batch of texts
   * @param {string[]} texts Array of texts to embed
   * @param {Object} options Configuration options
   * @param {boolean} options.normalize Whether to normalize vectors (default: true)
   * @returns {Promise<Float32Array[]>} Array of embedding vectors
   */
  async embedBatch(texts: any[], options: any = {}) {
    const { normalize = true } = options;

    if (!this.isLoaded) {
      throw new Error("Model not loaded. Call initialize() first.");
    }

    if (!texts || texts.length === 0) {
      return [];
    }

    // Filter out empty texts
    const validTexts = texts.filter(
      (text: { trim: () => { (): any; new (): any; length: number } }) =>
        text && text.trim().length > 0
    );
    if (validTexts.length === 0) {
      return [];
    }

    // Check cache for existing embeddings
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

    // If all embeddings were in cache, return them
    if (textsToEmbed.length === 0) {
      return cacheResults;
    }

    try {
      // Generate embeddings for texts not in cache
      const embeddings = await this.model.embed(textsToEmbed);

      // Get the embedding values as arrays
      const embeddingArrays = await embeddings.array();

      // Apply normalization if requested
      const processedEmbeddings = normalize
        ? embeddingArrays.map(this._normalizeVector)
        : embeddingArrays;

      // Store results in cache
      if (this.useCache) {
        for (let i = 0; i < textsToEmbed.length; i++) {
          const cacheKey = this._getCacheKey(textsToEmbed[i]);
          this.embeddingCache.set(cacheKey, processedEmbeddings[i]);
        }
      }

      // Merge cache results with new embeddings
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

  /**
   * Generates embedding for a single text
   * @param {string} text Text to embed
   * @param {Object} options Configuration options
   * @returns {Promise<Float32Array>} Embedding vector
   */
  async embedText(text: string, options = {}) {
    if (!text || text.trim().length === 0) {
      // Return zero vector for empty text
      return new Float32Array(this.embeddingDimension);
    }

    const results = await this.embedBatch([text], options);
    return results[0];
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {number[]|Float32Array} vecA First vector
   * @param {number[]|Float32Array} vecB Second vector
   * @returns {number} Similarity score between 0 and 1
   */
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

  /**
   * Calculate semantic similarity between two texts
   * @param {string} textA First text
   * @param {string} textB Second text
   * @returns {Promise<number>} Similarity score between 0 and 1
   */
  async calculateSimilarity(textA: any, textB: any) {
    const [embeddingA, embeddingB] = await this.embedBatch([textA, textB]);
    return this.cosineSimilarity(embeddingA, embeddingB);
  }

  /**
   * Find most similar texts to a query text
   * @param {string} queryText Text to compare against
   * @param {string[]} candidates Array of candidate texts to search
   * @param {Object} options Search options
   * @param {number} options.topK Number of results to return (default: 5)
   * @param {number} options.threshold Minimum similarity threshold (default: 0.5)
   * @returns {Promise<Array<{text: string, score: number, index: number}>>} Ranked results
   */
  async findSimilarTexts(queryText: any, candidates: any[], options: any = {}) {
    const { topK = 5, threshold = 0.5 } = options;

    if (!queryText || !candidates || candidates.length === 0) {
      return [];
    }

    // Generate embeddings for query and all candidates
    const queryEmbedding = await this.embedText(queryText);
    const candidateEmbeddings = await this.embedBatch(candidates);

    // Calculate similarities and rank
    const results = candidateEmbeddings.map((embedding, index) => {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      return {
        text: candidates[index],
        score: similarity,
        index,
      };
    });

    // Filter by threshold and sort by score (descending)
    return results
      .filter((item) => item.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Clear the embedding cache
   */
  clearCache() {
    this.embeddingCache.clear();
  }

  /**
   * Get the size of the embedding cache
   * @returns {number} Number of cached embeddings
   */
  getCacheSize() {
    return this.embeddingCache.size;
  }

  /**
   * Check if the model is loaded
   * @returns {boolean} Whether the model is loaded
   */
  isModelLoaded() {
    return this.isLoaded;
  }

  /**
   * Normalize a vector to unit length
   * @param {number[]|Float32Array} vector Vector to normalize
   * @returns {Float32Array} Normalized vector
   * @private
   */
  _normalizeVector(vector: any[]) {
    const magnitude = Math.sqrt(
      vector.reduce((sum: number, val: number) => sum + val * val, 0)
    );

    if (magnitude === 0) {
      return vector;
    }

    return vector.map((val: number) => val / magnitude);
  }

  /**
   * Generate a cache key for a text
   * @param {string} text Text to generate key for
   * @returns {string} Cache key
   * @private
   */
  _getCacheKey(text: string) {
    // Simple cache key generation - could be improved with a proper hash function
    return text.trim().toLowerCase().substring(0, 100);
  }
}

// Export a singleton instance
const textEmbedder = new TextEmbedder();
export default textEmbedder;

// Also export the class for those who need multiple instances
export { TextEmbedder };
