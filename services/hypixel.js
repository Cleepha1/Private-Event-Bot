import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = JSON.parse(readFileSync(join(dirname(__dirname), 'config.json'), 'utf-8'));

const CACHE_DURATION = 60000;
const cache = new Map();

function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function fetchSkyBlockData() {
  const cacheKey = 'skyblock_data';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `https://api.hypixel.net/v2/resources/skyblock/election`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'API-Key': config.hypixelApiKey
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch SkyBlock data:', error);
    throw error;
  }
}

export async function fetchCurrentMayor() {
  const cacheKey = 'current_mayor';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `https://api.hypixel.net/v2/resources/skyblock/election`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'API-Key': config.hypixelApiKey
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch mayor data:', error);
    throw error;
  }
}
