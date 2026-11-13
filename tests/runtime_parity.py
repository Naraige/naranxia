"""Compare deterministic simulation and audio output from two standalone HTML builds.

Usage (Windows): dist/qa-venv/Scripts/python.exe tests/runtime_parity.py BEFORE.html AFTER.html
The two paths can be anywhere; local Three.js and fonts are served from this checkout.
The audio PCM digests are diagnostic; Chromium's offline audio output is not bitwise stable
across repeated renders, so parity uses the exact peak/RMS summaries returned by audioBench.
"""

import argparse
import json
import statistics
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
AUDIO_SCENARIOS = ("launch", "cal", "battle", "calm", "night", "boss")
UNIT_TYPES = (
    "cannon", "peasant", "knight", "archer", "zombie", "bannerman", "captain", "runner", "husk", "brute",
    "king", "guard", "bomber", "acid", "miner", "scout", "engineer", "envoy", "spearman", "gunner", "gunner2",
)
STRUCTURE_TYPES = (
    "wall", "tower", "gate", "castle", "barracks", "farm", "storage", "house", "academy", "market", "forester",
    "observatory", "beacon", "forge", "embassy", "warroom", "sappers", "orchard", "granary", "bell", "sanctuary",
    "guild", "torch", "keep", "ballista", "trebuchet",
)
MODEL_INVENTORY = {
    "unit_types": list(UNIT_TYPES),
    "unit_cases": len(UNIT_TYPES) * 2,
    "structure_types": list(STRUCTURE_TYPES),
    "structure_cases": len(STRUCTURE_TYPES) * 4,
    "total_cases": len(UNIT_TYPES) * 2 + len(STRUCTURE_TYPES) * 4,
}
DET_SOURCE = (ROOT / "tests" / "det.js").read_text(encoding="utf-8")


def progress(message):
    print(message, file=sys.stderr, flush=True)

INIT_SCRIPT = r"""
(() => {
  const fixedNow = 1735689600000;
  const NativeDate = Date;
  class FixedDate extends NativeDate {
    constructor(...args) { super(...(args.length ? args : [fixedNow])); }
    static now() { return fixedNow; }
  }
  Object.setPrototypeOf(FixedDate, NativeDate);
  window.Date = FixedDate;

  let seed = 0;
  Math.random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  window.__resetParityRandom = value => { seed = value >>> 0; };
  window.__resetParityRandom(0x4e415258);

  const nativeRequest = window.requestAnimationFrame.bind(window);
  const nativeCancel = window.cancelAnimationFrame.bind(window);
  const pendingFrames = new Set();
  let framesStopped = false;
  window.requestAnimationFrame = callback => {
    if (framesStopped) return 0;
    let id = 0;
    id = nativeRequest(timestamp => {
      pendingFrames.delete(id);
      callback(timestamp);
    });
    pendingFrames.add(id);
    return id;
  };
  window.cancelAnimationFrame = id => {
    pendingFrames.delete(id);
    nativeCancel(id);
  };
  window.__stopParityFrames = () => {
    framesStopped = true;
    for (const id of pendingFrames) nativeCancel(id);
    pendingFrames.clear();
    window.requestAnimationFrame = () => 0;
  };
})();
"""

CAPTURE_PCM = r"""
(() => {
  const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!Offline || !Offline.prototype.startRendering || !crypto.subtle) {
    throw new Error('OfflineAudioContext PCM hashing is unavailable in this browser');
  }
  const original = Offline.prototype.startRendering;
  window.__parityPcm = [];
  Offline.prototype.startRendering = function(...args) {
    return original.apply(this, args).then(async buffer => {
      const channels = [];
      let total = 0;
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        const samples = buffer.getChannelData(i);
        const bytes = new Uint8Array(samples.buffer, samples.byteOffset, samples.byteLength);
        channels.push(bytes.slice());
        total += bytes.byteLength;
      }
      const pcm = new Uint8Array(total);
      let offset = 0;
      for (const bytes of channels) {
        pcm.set(bytes, offset);
        offset += bytes.byteLength;
      }
      const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', pcm));
      const sha256 = Array.from(digest, byte => byte.toString(16).padStart(2, '0')).join('');
      window.__parityPcm.push({
        sha256,
        channels: buffer.numberOfChannels,
        samples: buffer.length,
        sampleRate: buffer.sampleRate
      });
      return buffer;
    });
  };
})();
"""

CAPTURE_MODELS = r"""
async () => {
  const hex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  const hash = async value => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)))));
  const hashBytes = async value => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', value)));
  const textureCache = new WeakMap();
  const vector = value => value ? [value.x, value.y, value.z].map(n => Number(n)) : null;
  const attribute = value => {
    if (!value) return null;
    const array = value.array || value.data?.array;
    return {
      type: array?.constructor?.name || null,
      itemSize: value.itemSize,
      normalized: !!value.normalized,
      stride: value.data?.stride ?? null,
      offset: value.offset ?? null,
      values: array ? Array.from(array) : null
    };
  };
  const geometryData = geometry => ({
    attributes: Object.fromEntries(Object.keys(geometry.attributes).sort().map(key => [key, attribute(geometry.attributes[key])])),
    index: attribute(geometry.index),
    morphAttributes: Object.fromEntries(Object.keys(geometry.morphAttributes).sort().map(key => [key, geometry.morphAttributes[key].map(attribute)])),
    morphTargetsRelative: !!geometry.morphTargetsRelative,
    groups: geometry.groups.map(group => [group.start, group.count, group.materialIndex]),
    drawRange: [geometry.drawRange.start, geometry.drawRange.count]
  });
  const imagePixels = async image => {
    if (!image) return null;
    if (Array.isArray(image)) return Promise.all(image.map(imagePixels));
    const width = image.width || image.videoWidth || 0;
    const height = image.height || image.videoHeight || 0;
    if (ArrayBuffer.isView(image.data)) {
      const data = new Uint8Array(image.data.buffer, image.data.byteOffset, image.data.byteLength);
      return { width, height, sha256: await hashBytes(data) };
    }
    if (!width || !height) return { width, height, source: image.currentSrc || image.src || null };
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height).data;
      return { width, height, sha256: await hashBytes(new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength)) };
    } catch {
      return { width, height, unreadable: true, source: image.currentSrc || image.src || null };
    }
  };
  const texture = async value => {
    if (!value) return null;
    if (textureCache.has(value)) return textureCache.get(value);
    const result = (async () => ({
      type: value.type,
      format: value.format,
      colorSpace: value.colorSpace,
      flipY: value.flipY,
      wrap: [value.wrapS, value.wrapT],
      repeat: vector(value.repeat),
      offset: vector(value.offset),
      rotation: value.rotation,
      image: await imagePixels(value.image || value.source?.data)
    }))();
    textureCache.set(value, result);
    return result;
  };
  const color = value => value ? [Number(value.r), Number(value.g), Number(value.b)] : null;
  const materialData = async material => {
    if (Array.isArray(material)) return Promise.all(material.map(materialData));
    const data = {
      type: material.type,
      color: color(material.color),
      emissive: color(material.emissive),
      emissiveIntensity: material.emissiveIntensity,
      opacity: material.opacity,
      transparent: material.transparent,
      alphaTest: material.alphaTest,
      side: material.side,
      vertexColors: material.vertexColors,
      roughness: material.roughness,
      metalness: material.metalness,
      flatShading: material.flatShading,
      depthWrite: material.depthWrite,
      depthTest: material.depthTest,
      toneMapped: material.toneMapped,
      maps: {}
    };
    for (const name of ['map', 'alphaMap', 'emissiveMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'lightMap', 'bumpMap', 'displacementMap']) {
      if (material[name]) data.maps[name] = await texture(material[name]);
    }
    return data;
  };
  const transform = object => ({
    type: object.type,
    visible: object.visible,
    position: vector(object.position),
    rotation: [object.rotation.x, object.rotation.y, object.rotation.z, object.rotation.order],
    quaternion: [object.quaternion.x, object.quaternion.y, object.quaternion.z, object.quaternion.w],
    scale: vector(object.scale),
    matrixAutoUpdate: object.matrixAutoUpdate
  });
  const unitSignature = async (type, team) => {
    window.__resetParityRandom(0x4d4f444c);
    const needsModelOnlyRule = !Object.prototype.hasOwnProperty.call(T, type);
    if (needsModelOnlyRule) T[type] = { hp: 1 };
    let group;
    try {
      group = icoUnit(type, team);
    } finally {
      if (needsModelOnlyRule) delete T[type];
    }
    if (!group?.traverse) throw new Error(`icoUnit returned no group for ${type}, team ${team}`);
    const geometry = [];
    const materials = [];
    const layout = [];
    let vertices = 0;
    group.traverse(object => {
      layout.push(transform(object));
      if (object.isMesh) {
        const position = object.geometry?.attributes?.position;
        if (!position?.count) throw new Error(`unit ${type}, team ${team} contains empty mesh geometry`);
        vertices += position.count;
        geometry.push(geometryData(object.geometry));
        materials.push(materialData(object.material));
        if (object.isSkinnedMesh) {
          layout[layout.length - 1].bindMatrix = Array.from(object.bindMatrix.elements);
          layout[layout.length - 1].boneInverses = object.skeleton.boneInverses.map(matrix => Array.from(matrix.elements));
        }
      }
    });
    if (!geometry.length || !vertices) throw new Error(`unit ${type}, team ${team} produced no mesh geometry`);
    return {
      geometry: await hash(geometry),
      material: await hash(await Promise.all(materials)),
      layout: await hash(layout),
      meshes: geometry.length,
      vertices
    };
  };
  const structureSignature = async (type, tier, team) => {
    window.__resetParityRandom(0x4d4f444c);
    const structure = {
      type,
      t: team,
      tier,
      sz: type === 'castle' ? 5 : 2,
      tiles: [],
      tx: 0,
      ty: 0,
      pl: team,
      hm: 0,
      rot: 0
    };
    const geometry = sGeo(structure, 0);
    const vertices = geometry?.attributes?.position?.count || 0;
    if (!vertices) throw new Error(`sGeo returned empty geometry for ${type}, tier ${tier}, team ${team}`);
    return {
      geometry: await hash(geometryData(geometry)),
      material: await hash(await materialData(matV)),
      layout: await hash({ type: 'Mesh', visible: true, position: [0, 0, 0], rotation: [0, 0, 0, 'XYZ'], scale: [1, 1, 1] }),
      vertices
    };
  };
  const models = {};
  for (const type of __UNIT_TYPES__) for (const team of [0, 1]) {
    models[`unit:${type}:team${team}`] = await unitSignature(type, team);
  }
  for (const type of __STRUCTURE_TYPES__) for (const tier of [0, 1]) for (const team of [0, 1]) {
    models[`structure:${type}:tier${tier}:team${team}`] = await structureSignature(type, tier, team);
  }
  return models;
}
"""


def read_profile_result(value):
    if not isinstance(value, str):
        raise RuntimeError(f"determinism profile returned {value!r}, expected JSON text")
    result = json.loads(value)
    if not isinstance(result.get("ms"), (int, float)) or not result.get("h"):
        raise RuntimeError(f"determinism profile returned an incomplete result: {value[:300]}")
    return result


def model_capture_source():
    return (
        CAPTURE_MODELS.replace("__UNIT_TYPES__", json.dumps(UNIT_TYPES))
        .replace("__STRUCTURE_TYPES__", json.dumps(STRUCTURE_TYPES))
    )


def measure_artifact(browser, artifact, models_only=False):
    progress(f"Loading {artifact}")
    context = browser.new_context(viewport={"width": 1280, "height": 720}, reduced_motion="reduce")
    context.add_init_script(script=INIT_SCRIPT)
    page = context.new_page()
    page_errors = []
    page.on("pageerror", lambda error: page_errors.append(str(error)[:500]))

    def route_three(route):
        route.fulfill(
            path=str(ROOT / "node_modules" / "three" / "build" / "three.min.js"),
            content_type="application/javascript",
        )

    page.route("**/three.min.js", route_three)
    sys.path.insert(0, str(ROOT / "tools"))
    import fontroute

    fontroute.setup(page)
    try:
        page.goto(artifact.as_uri(), timeout=180000)
        page.wait_for_timeout(3500)
        page.evaluate("() => window.__stopParityFrames()")
        progress(f"  booted {artifact.name}; rendering offline audio")
        if page_errors:
            raise RuntimeError(f"{artifact.name} raised page errors during startup: {page_errors[:4]}")

        if models_only:
            progress("  hashing unit and structure model data")
            models = page.evaluate(model_capture_source())
            if len(models) != MODEL_INVENTORY["total_cases"]:
                raise RuntimeError(
                    f"{artifact.name} yielded {len(models)} model cases, expected "
                    f"{MODEL_INVENTORY['total_cases']} from the declared inventory"
                )
            if page_errors:
                raise RuntimeError(f"{artifact.name} raised page errors during model capture: {page_errors[:4]}")
            return {"artifact": str(artifact), "models": models, "page_errors": page_errors}

        has_audio = page.evaluate("() => typeof window.__abench === 'function'")
        if not has_audio:
            raise RuntimeError(f"{artifact.name} did not expose the audio benchmark hook")
        page.evaluate(CAPTURE_PCM)
        audio = {}
        for scenario in AUDIO_SCENARIOS:
            progress(f"  audio {scenario}")
            result = page.evaluate(
                "async name => { window.__resetParityRandom(0x41554449); "
                "const metrics = await window.__abench(name, 12); "
                "return {metrics, pcm: window.__parityPcm.at(-1)}; }",
                scenario,
            )
            if not result["pcm"]:
                raise RuntimeError(f"{artifact.name} produced no PCM capture for {scenario}")
            audio[scenario] = result

        progress("  hashing unit and structure model data")
        models = page.evaluate(model_capture_source())
        page.evaluate("() => { window.__NX_PROFILE_DET__ = true; }")
        profiles = []
        for _ in range(3):
            profiles.append(read_profile_result(page.evaluate(DET_SOURCE)))
        if any(profile["h"] != profiles[0]["h"] for profile in profiles[1:]):
            raise RuntimeError(f"{artifact.name} produced inconsistent 6000-tick hashes across profile runs")
        progress(f"  6000-tick samples: {[profile['ms'] for profile in profiles]} ms")
        if page_errors:
            raise RuntimeError(f"{artifact.name} raised page errors: {page_errors[:4]}")
        return {
            "artifact": str(artifact),
            "audio": audio,
            "models": models,
            "det": profiles[0]["h"],
            "det_times_ms": [profile["ms"] for profile in profiles],
            "page_errors": page_errors,
        }
    finally:
        context.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("before", type=Path, help="baseline standalone HTML artifact")
    parser.add_argument("after", type=Path, help="candidate standalone HTML artifact")
    parser.add_argument(
        "--models-only",
        action="store_true",
        help="compare model geometry, material, and transform hashes without audio or simulation timings",
    )
    args = parser.parse_args()
    before, after = args.before.resolve(), args.after.resolve()
    for artifact in (before, after):
        if not artifact.is_file():
            parser.error(f"HTML artifact does not exist: {artifact}")

    started = time.perf_counter()
    with sync_playwright() as playwright:
        progress("Launching Playwright Chromium")
        browser = playwright.chromium.launch(
            args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"]
        )
        try:
            left = measure_artifact(browser, before, args.models_only)
            right = measure_artifact(browser, after, args.models_only)
        finally:
            browser.close()

    if args.models_only:
        all_models = sorted(set(left["models"]) | set(right["models"]))
        model_differences = [
            {"model": key, "before": left["models"].get(key), "after": right["models"].get(key)}
            for key in all_models
            if left["models"].get(key) != right["models"].get(key)
        ]
        summary = {
            "model_parity": not model_differences,
            "model_count": min(len(left["models"]), len(right["models"])),
            "model_inventory": MODEL_INVENTORY,
            "model_differences": model_differences,
            "elapsed_seconds": round(time.perf_counter() - started, 1),
            "before": left,
            "after": right,
        }
        print(json.dumps(summary, indent=2))
        return 0 if summary["model_parity"] else 1

    audio_differences = [
        scenario
        for scenario in AUDIO_SCENARIOS
        if left["audio"][scenario]["metrics"] != right["audio"][scenario]["metrics"]
    ]
    pcm_hash_changes = [
        scenario
        for scenario in AUDIO_SCENARIOS
        if left["audio"][scenario]["pcm"]["sha256"] != right["audio"][scenario]["pcm"]["sha256"]
    ]
    model_differences = [
        key for key in sorted(set(left["models"]) | set(right["models"]))
        if left["models"].get(key) != right["models"].get(key)
    ]
    det_equal = left["det"] == right["det"]
    summary = {
        "parity": not audio_differences and not model_differences and det_equal,
        "audio_differences": audio_differences,
        "pcm_hash_changes": pcm_hash_changes,
        "model_differences": model_differences,
        "model_inventory": MODEL_INVENTORY,
        "det_equal": det_equal,
        "before_det_median_ms": statistics.median(left["det_times_ms"]),
        "after_det_median_ms": statistics.median(right["det_times_ms"]),
        "elapsed_seconds": round(time.perf_counter() - started, 1),
        "before": left,
        "after": right,
    }
    print(json.dumps(summary, indent=2))
    return 0 if summary["parity"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
