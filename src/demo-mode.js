export const DATA_MODES = Object.freeze({
  live: "live",
  sample: "sample"
});

export function resolveInitialDataMode(search) {
  const params =
    search instanceof URLSearchParams
      ? search
      : new URLSearchParams(String(search || "").replace(/^\?/, ""));

  if (params.get("demo") === DATA_MODES.sample || params.get("mode") === DATA_MODES.sample) {
    return DATA_MODES.sample;
  }

  return DATA_MODES.live;
}

export function modeButtonLabel(mode) {
  return mode === DATA_MODES.sample ? "Sample demo" : "Live GitHub";
}
