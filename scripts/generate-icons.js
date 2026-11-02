const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([lenBuf, body, crcBuf]);
}

function generatePNG(size, isMaskable = false) {
  const width = size;
  const height = size;
  const half = size / 2;
  const rawData = Buffer.alloc(height * (1 + width * 4));

  // Tilted orbit angle
  const ang = -0.45;
  const cosA = Math.cos(ang);
  const sinA = Math.sin(ang);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    const ny = (y - half) / half;

    for (let x = 0; x < width; x++) {
      const nx = (x - half) / half;
      const r = Math.sqrt(nx * nx + ny * ny);

      // Default background: Cosmic Deep Violet to Dark Space
      let bgR = 40, bgG = 26, bgB = 58, bgA = 255;
      
      // Radial glow in center
      const bgGlow = Math.max(0, 1 - r * 0.9);
      bgR = Math.round(28 + bgGlow * 45);
      bgG = Math.round(18 + bgGlow * 30);
      bgB = Math.round(48 + bgGlow * 65);

      // If not maskable, we can round the outer corners or keep solid dark squircle
      if (!isMaskable) {
        // Squircle shape: |nx|^4 + |ny|^4 < 1.05
        const sqDist = Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4);
        if (sqDist > 0.98) {
          const edgeAlpha = Math.max(0, Math.min(1, (1.05 - sqDist) / 0.07));
          bgA = Math.round(edgeAlpha * 255);
        }
      }

      let rVal = bgR;
      let gVal = bgG;
      let bVal = bgB;
      let aVal = bgA;

      // 1. Celestial Orbit Ring: rotated ellipse
      const rotX = nx * cosA - ny * sinA;
      const rotY = nx * sinA + ny * cosA;
      const ringDist = Math.hypot(rotX / 0.72, rotY / 0.24);
      const ringDelta = Math.abs(ringDist - 1.0);
      if (ringDelta < 0.09) {
        const ringAlpha = Math.max(0, 1 - ringDelta / 0.09) * 0.75;
        // Ring color: lavender pink (#FFDDF0 / #DCCAFF)
        rVal = Math.round(rVal * (1 - ringAlpha) + 245 * ringAlpha);
        gVal = Math.round(gVal * (1 - ringAlpha) + 215 * ringAlpha);
        bVal = Math.round(bVal * (1 - ringAlpha) + 250 * ringAlpha);
      }

      // 2. Glowing Halo behind central star
      if (r < 0.55) {
        const haloAlpha = Math.pow(Math.max(0, 1 - r / 0.55), 2) * 0.6;
        rVal = Math.round(rVal * (1 - haloAlpha) + 190 * haloAlpha);
        gVal = Math.round(gVal * (1 - haloAlpha) + 160 * haloAlpha);
        bVal = Math.round(bVal * (1 - haloAlpha) + 245 * haloAlpha);
      }

      // 3. Central 4-pointed Star (astroid curve |nx|^0.45 + |ny|^0.45 < threshold)
      const absX = Math.abs(nx);
      const absY = Math.abs(ny);
      const starMetric = Math.pow(absX, 0.42) + Math.pow(absY, 0.42);
      const starThreshold = 0.58;

      if (starMetric < starThreshold) {
        const starAlpha = Math.min(1, (starThreshold - starMetric) / 0.12);
        // Star color: Pure luminous radiant white-pink (#FFFFFF / #FFF0F8)
        rVal = Math.round(rVal * (1 - starAlpha) + 255 * starAlpha);
        gVal = Math.round(gVal * (1 - starAlpha) + 248 * starAlpha);
        bVal = Math.round(bVal * (1 - starAlpha) + 255 * starAlpha);
      }

      // 4. Central Core Brightness
      if (r < 0.12) {
        const coreAlpha = Math.max(0, 1 - r / 0.12);
        rVal = Math.round(rVal * (1 - coreAlpha) + 255 * coreAlpha);
        gVal = Math.round(gVal * (1 - coreAlpha) + 255 * coreAlpha);
        bVal = Math.round(bVal * (1 - coreAlpha) + 255 * coreAlpha);
      }

      // 5. Tiny Sparkle Dots (Cosmic Dust)
      const dots = [
        [-0.48, -0.42, 0.035],
        [0.52, -0.38, 0.04],
        [-0.42, 0.50, 0.03],
        [0.46, 0.45, 0.035]
      ];
      for (const [dx, dy, dr] of dots) {
        const dDist = Math.hypot(nx - dx, ny - dy);
        if (dDist < dr) {
          const dotAlpha = Math.max(0, 1 - dDist / dr);
          rVal = Math.round(rVal * (1 - dotAlpha) + 255 * dotAlpha);
          gVal = Math.round(gVal * (1 - dotAlpha) + 240 * dotAlpha);
          bVal = Math.round(bVal * (1 - dotAlpha) + 255 * dotAlpha);
        }
      }

      rawData[offset++] = Math.min(255, Math.max(0, rVal));
      rawData[offset++] = Math.min(255, Math.max(0, gVal));
      rawData[offset++] = Math.min(255, Math.max(0, bVal));
      rawData[offset++] = Math.min(255, Math.max(0, aVal));
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating STARSPACE PWA Icons...');

fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), generatePNG(192, false));
console.log('✓ Created icon-192x192.png');

fs.writeFileSync(path.join(iconsDir, 'icon-192x192-maskable.png'), generatePNG(192, true));
console.log('✓ Created icon-192x192-maskable.png');

fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), generatePNG(512, false));
console.log('✓ Created icon-512x512.png');

fs.writeFileSync(path.join(iconsDir, 'icon-512x512-maskable.png'), generatePNG(512, true));
console.log('✓ Created icon-512x512-maskable.png');

fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), generatePNG(180, true));
console.log('✓ Created apple-touch-icon.png');

console.log('All icons generated successfully!');
