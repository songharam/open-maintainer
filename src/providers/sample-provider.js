import { sampleRepositoryData } from "../sample-data.js";

export async function getRepositorySnapshot() {
  return structuredClone(sampleRepositoryData);
}
