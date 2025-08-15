import PQueue from 'p-queue'

const queues = {}

const apiConfigs = {
  'ip-api': {
    concurrency: 1,
    intervalCap: 45,
    interval: 60 * 1000,
    carryoverConcurrencyCount: true,
  },
  'weather': {
    concurrency: 1,
    intervalCap: 600,
    interval: 60 * 1000,
    carryoverConcurrencyCount: true,
  },
  'nominatim': {
    concurrency: 1,
    intervalCap: 1,
    interval: 1000,
    carryoverConcurrencyCount: true,
  },
  'default': {
    concurrency: 1,
    intervalCap: 1,
    interval: 1000,
    carryoverConcurrencyCount: true,
  },
}

function getQueue(key) {
    if (!queues[key]) {
        const config = apiConfigs[key] || apiConfigs['default']
        queues[key] = new PQueue(config)
    }
    return queues[key]
}

export async function rateLimitedFetch(key, url, options = {}) {
    const queue = getQueue(key)
    return await queue.add(() => fetch(url, options))
}