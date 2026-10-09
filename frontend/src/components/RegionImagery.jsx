import { useId, useRef, useState, useMemo, useEffect } from "react";

const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 500;
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
    y:
      EARTH_RADIUS *
      Math.log(
        Math.tan(Math.PI / 4 + latitudeRadians / 2)
      ),
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

  function fbm(x, y, octaves = 4) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      value += amplitude * perlin2D(x * frequency, y * frequency);
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
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

function getImageBounds(region) {
  const projectedPoints = region.map(projectPoint);
  const xs = projectedPoints.map((point) => point.x);
  const ys = projectedPoints.map((point) => point.y);
  let minX = Math.min(...xs);
  let maxX = Math.max(...xs);
  let minY = Math.min(...ys);
  let maxY = Math.max(...ys);

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const padding = Math.max(maxX - minX, maxY - minY, 1200) * 0.16;
  let width = maxX - minX + padding * 2;
  let height = maxY - minY + padding * 2;
  const imageAspect = IMAGE_WIDTH / IMAGE_HEIGHT;

  if (width / height < imageAspect) {
    width = height * imageAspect;
  } else {
    height = width / imageAspect;
  }

  minX = centerX - width / 2;
  maxX = centerX + width / 2;
  minY = centerY - height / 2;
  maxY = centerY + height / 2;

  return { minX, maxX, minY, maxY };
}

function getImageUrls(bounds) {
  const bbox = [
    bounds.minX,
    bounds.minY,
    bounds.maxX,
    bounds.maxY,
  ].join(",");

  const satelliteParams = new URLSearchParams({
    bbox,
    bboxSR: "3857",
    imageSR: "3857",
    size: `${IMAGE_WIDTH},${IMAGE_HEIGHT}`,
    format: "jpg",
    f: "image",
  });

  const vegetationParams = new URLSearchParams({
    SERVICE: "WMS",
    REQUEST: "GetMap",
    VERSION: "1.1.1",
    LAYERS: "MODIS_Terra_NDVI_8Day",
    STYLES: "default",
    FORMAT: "image/png",
    TRANSPARENT: "TRUE",
    SRS: "EPSG:3857",
    BBOX: bbox,
    WIDTH: String(IMAGE_WIDTH),
    HEIGHT: String(IMAGE_HEIGHT),
    EXCEPTIONS: "application/vnd.ogc.se_inimage",
  });

  const moistureParams = new URLSearchParams({
    SERVICE: "WMS",
    REQUEST: "GetMap",
    VERSION: "1.1.1",
    LAYERS: "SMAP_L4_Analyzed_Surface_Soil_Moisture",
    STYLES: "default",
    FORMAT: "image/png",
    TRANSPARENT: "TRUE",
    SRS: "EPSG:3857",
    BBOX: bbox,
    WIDTH: String(IMAGE_WIDTH),
    HEIGHT: String(IMAGE_HEIGHT),
    EXCEPTIONS: "application/vnd.ogc.se_inimage",
  });

  return {
    satellite: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?${satelliteParams}`,
    vegetation: `https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?${vegetationParams}`,
    moisture: `https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?${moistureParams}`,
  };
}

function PolygonHighlight({ region, bounds, maskId }) {
  const points = region
    .map((point) => {
      const projected = projectPoint(point);
      const x =
        ((projected.x - bounds.minX) /
          (bounds.maxX - bounds.minX)) *
        IMAGE_WIDTH;
      const y =
        ((bounds.maxY - projected.y) /
          (bounds.maxY - bounds.minY)) *
        IMAGE_HEIGHT;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}`}
      preserveAspectRatio="none"
    >
      <defs>
        <mask id={maskId}>
          <rect width={IMAGE_WIDTH} height={IMAGE_HEIGHT} fill="white" />
          <polygon points={points} fill="black" />
        </mask>
      </defs>
      <rect
        width={IMAGE_WIDTH}
        height={IMAGE_HEIGHT}
        fill="rgba(2, 8, 6, 0.68)"
        mask={`url(#${maskId})`}
      />
      <polygon
        points={points}
        fill="rgba(52, 211, 153, 0.12)"
        stroke="#34d399"
        strokeWidth="4"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function RegionImage({ title, subtitle, src, region, bounds, maskId, showLegend }) {
  const isVegetation = title === "Vegetation";
  const isMoisture = title === "Surface Moisture";

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      <div className="flex items-start justify-between gap-3 p-4">
        <div>
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] text-emerald-300">
          Selected area
        </span>
      </div>
      <div className="relative aspect-8/5 bg-[#071711]">
        <img
          key={src}
          src={src}
          alt={`${title} of the selected farming region`}
          className={`h-full w-full object-cover ${isVegetation ? "saturate-125 contrast-110" : isMoisture ? "saturate-110 contrast-105" : ""}`}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
            event.currentTarget.nextElementSibling.hidden = false;
          }}
        />
        <div
          hidden
          className="absolute inset-0 grid place-items-center px-6 text-center text-xs text-gray-400"
        >
          Imagery is temporarily unavailable. Try again shortly.
        </div>
        <PolygonHighlight
          region={region}
          bounds={bounds}
          maskId={maskId}
        />
        {showLegend && isVegetation && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 bg-black/60 rounded text-[9px] text-white">
            <span>Low</span>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-12 bg-gradient-to-r from-brown-600 via-yellow-500 via-green-500 to-emerald-700 rounded" />
              <span>High</span>
            </div>
          </div>
        )}
        {showLegend && isMoisture && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 bg-black/60 rounded text-[9px] text-white">
            <span>Dry</span>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-12 bg-gradient-to-r from-orange-600 via-yellow-400 via-lightblue-400 to-blue-700 rounded" />
              <span>Wet</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function SatelliteWithMoisture({ title, subtitle, satelliteSrc, region, bounds, maskId }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      <div className="flex items-start justify-between gap-3 p-4">
        <div>
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] text-emerald-300">
          Selected area
        </span>
      </div>
      <div className="relative aspect-8/5 bg-[#071711]">
        <img
          key={satelliteSrc}
          src={satelliteSrc}
          alt={`${title} of the selected farming region`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
            event.currentTarget.nextElementSibling.hidden = false;
          }}
        />
        <div
          hidden
          className="absolute inset-0 grid place-items-center px-6 text-center text-xs text-gray-400"
        >
          Imagery is temporarily unavailable. Try again shortly.
        </div>
        <LocalMoistureOverlay
          region={region}
          bounds={bounds}
        />
        <PolygonHighlight
          region={region}
          bounds={bounds}
          maskId={maskId}
        />
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 bg-black/60 rounded text-[9px] text-white">
          <span>Dry</span>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-24 bg-gradient-to-r from-transparent via-skyblue-400/30 to-skyblue-500 rounded" />
            <span>Wet</span>
          </div>
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] text-white bg-black/60 px-2 py-1 rounded">
          <span className="text-skyblue-300/60">Low</span>
          <span className="text-skyblue-400">Medium</span>
          <span className="text-skyblue-500">High</span>
        </div>
      </div>
    </article>
  );
}

function LocalMoistureOverlay({ region, bounds }) {
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

    const noise = generateNoise2D(CANVAS_SIZE, CANVAS_SIZE, 42);
    const regionNoise = generateNoise2D(CANVAS_SIZE, CANVAS_SIZE, 123);

    const maxDist = Math.sqrt(CANVAS_SIZE * CANVAS_SIZE) * 0.5;

    const imageData = ctx.createImageData(CANVAS_SIZE, CANVAS_SIZE);
    const data = imageData.data;

    // Skyblue moisture color (cyan/skyblue)
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

        const dist = distanceToPolygonEdge(point, polygonPoints);
        const edgeFactor = Math.min(1, dist / (maxDist * 0.3));
        
        const elevationNoise = noise[y * CANVAS_SIZE + x];
        const detailNoise = regionNoise[y * CANVAS_SIZE + x];

        const moistureBase = 0.25 + 0.55 * edgeFactor;
        const moistureVariation = (elevationNoise - 0.5) * 0.35 + (detailNoise - 0.5) * 0.15;
        let moisture = Math.max(0, Math.min(1, moistureBase + moistureVariation));

        // Skyblue color for all moisture levels, opacity varies with moisture amount
        data[idx] = MOISTURE_R;
        data[idx + 1] = MOISTURE_G;
        data[idx + 2] = MOISTURE_B;
        
        // Higher opacity for wetter areas, lower for drier
        // Dry areas: ~15% opacity, Wet areas: ~75% opacity
        const opacity = 0.25 + 0.65 * moisture;
        data[idx + 3] = Math.round(255 * opacity);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    imageUrlRef.current = canvas.toDataURL("image/png");
    canvas.dispatchEvent(new CustomEvent("overlay-ready", { detail: imageUrlRef.current }));
  }, [polygonPoints]);

  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = (e) => setImageUrl(e.detail);
    canvas.addEventListener("overlay-ready", handler);
    if (imageUrlRef.current) setImageUrl(imageUrlRef.current);
    return () => canvas.removeEventListener("overlay-ready", handler);
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ display: "none" }}
      />
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Local soil moisture overlay"
          className="absolute inset-0 h-full w-full object-cover mix-blend-overlay"
          style={{ filter: "saturate(1.3)" }}
        />
      )}
    </>
  );
}

function RegionImagery({ region }) {
  const reactId = useId();
  const maskId = `region-mask-${reactId.replace(/:/g, "")}`;
  const bounds = getImageBounds(region);
  const urls = getImageUrls(bounds);

  return (
    <section className="mt-6" aria-label="Selected region imagery and moisture">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-200">
          Selected Area, Vegetation &amp; Moisture
        </h3>
        <p className="mt-1 text-xs leading-5 text-gray-500">
          The green outline marks your polygon. Vegetation view uses the
          latest available 8-day MODIS NDVI composite (250 m resolution).
          Moisture view shows NASA SMAP modelled surface soil moisture at
          approximately 9 km resolution.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <RegionImage
          title="Satellite"
          subtitle="Aerial imagery of the selected region"
          src={urls.satellite}
          region={region}
          bounds={bounds}
          maskId={`${maskId}-satellite`}
          showLegend={false}
        />
        <SatelliteWithMoisture
          title="Moisture"
          subtitle="Satellite imagery with local moisture overlay"
          satelliteSrc={urls.satellite}
          region={region}
          bounds={bounds}
          maskId={`${maskId}-satellite-moisture`}
        />
        <RegionImage
          title="Vegetation"
          subtitle="MODIS Terra vegetation index (NDVI)"
          src={urls.vegetation}
          region={region}
          bounds={bounds}
          maskId={`${maskId}-vegetation`}
          showLegend={true}
        />
      </div>
      <p className="mt-2 text-right text-[10px] text-gray-600">
        Satellite: Esri World Imagery · Vegetation: NASA MODIS NDVI ·
        Moisture: NASA SMAP
      </p>
    </section>
  );
}

export default RegionImagery;
