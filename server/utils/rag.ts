
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { promisify } from 'node:util';
import OpenAI from 'openai';
import { globalState } from './state';

const gunzip = promisify(zlib.gunzip);

// Types
type Vector = number[];
type Corpus = string[];
interface IndexData {
  vectors: Vector[];
  corpus: Corpus;
}

// In-Memory Store
const indexes: Record<string, IndexData> = {};
let isLoaded = false;

// Configuration
const DATA_DIR = path.resolve(process.cwd(), 'server/data/indexes');

// Similarity function (Cosine Similarity)
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

// Load Data
async function loadData(name: string, corpusName: string) {
  try {
    const vectorPath = path.join(DATA_DIR, `vectors_${name}.json.gz`);
    const corpusPath = path.join(DATA_DIR, `faiss_${corpusName}_corpus.json.gz`);
    
    // Check if files exist
    try {
        await fs.access(vectorPath);
        await fs.access(corpusPath);
    } catch {
        // Fallback to non-gzipped if exists (for local dev)
        const vectorPathJson = path.join(DATA_DIR, `vectors_${name}.json`);
        const corpusPathJson = path.join(DATA_DIR, `faiss_${corpusName}_corpus.json`);
        try {
            await fs.access(vectorPathJson);
            await fs.access(corpusPathJson);
            const vectorsRaw = await fs.readFile(vectorPathJson, 'utf-8');
            const corpusRaw = await fs.readFile(corpusPathJson, 'utf-8');
            return { vectors: JSON.parse(vectorsRaw) as Vector[], corpus: JSON.parse(corpusRaw) as Corpus };
        } catch {
            console.warn(`[RAG] Files not found for ${name} (.gz or .json), skipping.`);
            return { vectors: [], corpus: [] };
        }
    }

    const vectorsBuffer = await fs.readFile(vectorPath);
    const corpusBuffer = await fs.readFile(corpusPath);

    const vectorsDecompressed = await gunzip(vectorsBuffer);
    const corpusDecompressed = await gunzip(corpusBuffer);

    const vectors = JSON.parse(vectorsDecompressed.toString()) as Vector[];
    const corpus = JSON.parse(corpusDecompressed.toString()) as Corpus;

    console.log(`[RAG] Loaded ${name} (compressed): ${vectors.length} vectors`);
    return { vectors, corpus };
  } catch (e) {
    console.error(`[RAG] Error loading ${name}:`, e);
    return { vectors: [], corpus: [] };
  }
}

export async function initRAG() {
  if (isLoaded) return;
  
  console.log('[RAG] Initializing indexes...');
  const datasets = [
    ['empathy_user', 'empathy_user'],
    ['empathy_agent', 'empathy_agent'],
    ['counsel_user', 'counsel_user'],
    ['counsel_agent', 'counsel_agent']
  ];

  for (const [name, corpusName] of datasets) {
    indexes[name] = await loadData(name, corpusName);
  }
  
  isLoaded = true;
  console.log('[RAG] Initialization complete.');
}

// Embed Query using Nvidia API
// Embed Query using Nvidia API (Using native fetch to bypass SDK limitations)
async function getEmbedding(text: string, client: OpenAI) {
  try {
     const apiKey = client.apiKey; 
     const response = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
         method: 'POST',
         headers: {
             'Authorization': `Bearer ${apiKey}`,
             'Content-Type': 'application/json'
         },
         body: JSON.stringify({
             input: text,
             model: "nvidia/llama-3.2-nv-embedqa-1b-v2",
             input_type: "query",
             encoding_format: "float",
             truncate: "NONE"
         })
     });

     if (!response.ok) {
         const errText = await response.text();
         console.error('[RAG] Embedding Native Fetch Error:', response.status, errText);
         return null;
     }

     const data = await response.json();
     return data.data[0].embedding;
  } catch (e) {
    console.error('[RAG] Embedding failed:', e);
    return null;
  }
}

// Retrieve Context
export async function retrieveContext(
  indexName: string, 
  query: string, 
  client: OpenAI, 
  k: number = 3
): Promise<string> {
  if (!query || !query.trim()) return "";
  
  // Ensure loaded
  if (!isLoaded) await initRAG();

  const indexData = indexes[indexName];
  if (!indexData || indexData.vectors.length === 0) return "";

  // Get Query Embedding
  const queryVec = await getEmbedding(query.substring(0, 4000), client);
  if (!queryVec) return "";

  // Search
  // Map vectors to scores
  const scores = indexData.vectors.map((vec, idx) => ({
    idx,
    score: cosineSimilarity(queryVec, vec)
  }));

  // Sort descending
  scores.sort((a, b) => b.score - a.score);

  // Top K
  const topK = scores.slice(0, k);
  
  // Retrieve text
  const context = topK.map(item => indexData.corpus[item.idx]).join("\n\n");
  
  return context;
}
