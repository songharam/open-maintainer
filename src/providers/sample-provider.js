import { sampleRepositoryData } from "../sample-data.js";

export async function getRepositorySnapshot() {
  return {
    provider: "sample",
    status: {
      kind: "sample",
      message: "Using built-in sample data."
    },
    ...structuredClone(sampleRepositoryData)
  };
}
