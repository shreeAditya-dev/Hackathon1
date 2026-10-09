import { useEffect, useRef, useMemo, useState } from "react";

const CANVAS_SIZE = 512;
const WEB_MERCATOR_LIMIT = 85.05112878;
const EARTH_RADIUS = 6378137;
const WEB_MERCATOR_HALF_WORLD = Math.PI * EARTH_RADIUS;

function projectPoint({ lat, lng }) {
  const boundedLatitude = Math.max(
    -WEB_MERCATOR_LIMIT,
    Math.min(WEB_MERCATOR_LIMIT, Number(lat))
  );
  const latitudeRadians = (boundedLatitude * Math.PI) / 180;

  return {
    x: (Number(lng) * WEB_MERCATOR_HALF_WORLD) / 180,
    y: EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2)),
  };
}

function generateNoise2D(width, height, seed = 1) {
  const noise = new Array(width * height);
  let x = seed;
  const random = () => {
    x = (x * 1664525 + 1013904223) % 4294967296;
    return x / 4294967296;
  };

  const gradients = new Array(256);
  for (let i = 0; i < 256; i++) {
    const angle = random() * Math.PI * 2;
    gradients[i] = [Math.cos(angle), Math.sin(angle)];
  }

  const perm = new Array(512);
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];

  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(a, b, t) {
    return a + t * (b - a);
  }

  function grad(hash, x, y) {
    const g = gradients[hash & 255];
    return g[0] * x + g[1] * y;
  }

  function perlin2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);

    const A = perm[X] + Y;
    const B = perm[X + 1] + Y;

    return lerp(
      lerp(grad(perm[A], x, y), grad(perm[B], x - 1, y), u),
      lerp(grad(perm[A + 1], x, y - 1), grad(perm[B + 1], x - 1, y - 1), u),
      v
    );
  }

  function fbm(x, y, octaves = 4, lacunarity = 2.0, gain = 0.5) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      value += amplitude * perlin2D(x * frequency, y * frequency);
      maxValue += amplitude;
      amplitude *= gain;
      frequency *= lacunarity;
    }
    return value / maxValue;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x / width * 4;
      const ny = y / height * 4;
      noise[y * width + x] = fbm(nx, ny, 4);
    }
  }

  return noise;
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > point[1]) !== (yj > point[1])) &&
      (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function distanceToPolygonEdge(point, polygon) {
  let minDist = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const x1 = polygon[i][0], y1 = polygon[i][1];
    const x2 = polygon[j][0], y2 = polygon[j][1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) continue;
    const t = Math.max(0, Math.min(1, ((point[0] - x1) * dx + (point[1] - y1) * dy) / (length * length)));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    const dist = Math.sqrt((point[0] - projX) ** 2 + (point[1] - projY) ** 2);
    minDist = Math.min(minDist, dist);
  }
  return minDist;
}

// Generate multiple noise layers for realistic moisture simulation
function generateMoistureLayers(width, height) {
  // Different noise layers for different physical processes
  const elevationNoise = generateNoise2D(width, height, 42);        // Base topography
  const soilTextureNoise = generateNoise2D(width, height, 123);     // Soil type variation (sand/clay)
  const drainageNoise = generateNoise2D(width, height, 456);        // Drainage patterns
  const microNoise = generateNoise2D(width, height, 789);           // Micro-scale variation
  const organicNoise = generateNoise2D(width, height, 999);         // Organic matter / vegetation
  
  // Large-scale regional trend (subtle gradient across field)
  const regionalNoise = generateNoise2D(width, height, 111);
  
  return { elevationNoise, soilTextureNoise, drainageNoise, microNoise, organicNoise, regionalNoise };
}

function LocalMoistureMap({ region, bounds, className = "" }) {
  const canvasRef = useRef(null);
  const imageUrlRef = useRef(null);

  const polygonPoints = useMemo(() => {
    return region.map(p => {
      const projected = projectPoint(p);
      return [
        ((projected.x - bounds.minX) / (bounds.maxX - bounds.minX)) * CANVAS_SIZE,
        ((bounds.maxY - projected.y) / (bounds.maxY - bounds.minY)) * CANVAS_SIZE
      ];
    });
  }, [region, bounds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    const layers = generateMoistureLayers(CANVAS_SIZE, CANVAS_SIZE);
    
    const imageData = ctx.createImageData(CANVAS_SIZE, CANVAS_SIZE);
    const data = imageData.data;

    const MOISTURE_R = 0;
    const MOISTURE_G = 180;
    const MOISTURE_B = 255;

    for (let y = 0; y < CANVAS_SIZE; y++) {
      for (let x = 0; x < CANVAS_SIZE; x++) {
        const idx = (y * CANVAS_SIZE + x) * 4;
        const point = [x, y];

        if (!pointInPolygon(point, polygonPoints)) {
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 0;
          continue;
        }

        // Sample all noise layers
        const elevation = layers.elevationNoise[y * CANVAS_SIZE + x];
        const soilTexture = layers.soilTextureNoise[y * CANVAS_SIZE + x];
        const drainage = layers.drainageNoise[y * CANVAS_SIZE + x];
        const micro = layers.microNoise[y * CANVAS_SIZE + x];
        const organic = layers.organicNoise[y * CANVAS_SIZE + x];
        const regional = layers.regionalNoise[y * CANVAS_SIZE + x];

        // === PURE NOISE-DRIVEN MOISTURE (NO CENTER BIAS) ===
        
        // 1. TOPOGRAPHIC WETNESS INDEX - low areas collect water
        // elevation 0=low/valley(wet), 1=high/ridge(dry)
        const twiFactor = 0.35 + 0.65 * (1.0 - elevation);
        
        // 2. SOIL TEXTURE - clay holds water, sand drains fast
        // soilTexture: 0=sandy (dry), 1=clay (wet)
        const soilFactor = 0.2 + 0.8 * soilTexture;
        
        // 3. DRAINAGE PATTERNS - creates connected wet/dry channels
        const drainageFactor = 0.4 + 0.6 * drainage;
        
        // 4. REGIONAL TREND - large-scale gradient (subtle)
        const regionalFactor = 0.8 + 0.4 * (regional - 0.5);
        
        // 5. MICRO-TOPOGRAPHY - small depressions/mounds
        const microTopo = 0.9 + 0.2 * (micro - 0.5);
        
        // 6. ORGANIC/VEGETATION - more organic = more retention
        const organicFactor = 0.85 + 0.3 * organic;

        // 7. ADDITIONAL HIGH-FREQUENCY DETAIL NOISE
        // Generate extra detail at render time for more variation
        const detailSeed = (x * 73856093) ^ (y * 19349663) ^ 12345;
        const detailRandom = () => {
          let s = detailSeed;
          s = (s * 1664525 + 1013904223) % 4294967296;
          return s / 4294967296;
        };
        const detailNoise = detailRandom() - 0.5;

        // COMBINE - purely multiplicative, no position-based bias
        let moisture = 0.3; // Base
        
        moisture *= twiFactor;           // Topography (strongest driver)
        moisture *= soilFactor;          // Soil texture (very strong)
        moisture *= drainageFactor;      // Drainage paths
        moisture *= regionalFactor;      // Regional trend
        moisture *= microTopo;           // Micro features
        moisture *= organicFactor;       // Organic matter
        moisture += detailNoise * 0.12;  // High-freq detail

        // Clamp to realistic range
        moisture = Math.max(0.02, Math.min(0.99, moisture));

        // Non-linear soil moisture curve (saturation effect)
        moisture = Math.pow(moisture, 0.8);

        // Skyblue color with opacity based on moisture
        data[idx] = MOISTURE_R;
        data[idx + 1] = MOISTURE_G;
        data[idx + 2] = MOISTURE_B;
        
        // Opacity: dry=8%, medium=35%, wet=75%
        const opacity = 0.08 + 0.67 * moisture;
        data[idx + 3] = Math.round(255 * opacity);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 3;
    ctx.beginPath();
    polygonPoints.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt[0], pt[1]);
      else ctx.lineTo(pt[0], pt[1]);
    });
    ctx.closePath();
    ctx.stroke();

    imageUrlRef.current = canvas.toDataURL("image/png");
    canvas.dispatchEvent(new CustomEvent("moisture-ready", { detail: imageUrlRef.current }));
  }, [polygonPoints]);

  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = (e) => setImageUrl(e.detail);
    canvas.addEventListener("moisture-ready", handler);
    if (imageUrlRef.current) setImageUrl(imageUrlRef.current);
    return () => canvas.removeEventListener("moisture-ready", handler);
  }, []);

  if (!imageUrl) {
    return (
      <canvas
        ref={canvasRef}
        className={`aspect-8/5 w-full rounded-xl bg-[#071711] ${className}`}
        style={{ display: "none" }}
      />
    );
  }

  return (
    <img
      src={imageUrl}
      alt="Local soil moisture variation map"
      className={`aspect-8/5 w-full rounded-xl object-cover ${className}`}
    />
  );
}

export default LocalMoistureMap;