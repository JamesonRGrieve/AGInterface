// lib/runtimeConfig.js
import getConfig from 'next/config';

export function getRuntime(key = null) {
  const { publicRuntimeConfig = {}, serverRuntimeConfig = {} } = getConfig() || {};
  const isClient = typeof window !== 'undefined';

  const config = {
    ...publicRuntimeConfig,
    ...(!isClient ? serverRuntimeConfig : {}),
  };

  return key ? config[key] : config;
}
