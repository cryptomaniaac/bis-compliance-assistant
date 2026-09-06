'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SVG_CODE = `<svg width="512" height="512" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f3d38a"/>
      <stop offset="50%" stop-color="#d4a24c"/>
      <stop offset="100%" stop-color="#a67326"/>
    </linearGradient>
    <linearGradient id="navyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1c2340"/>
      <stop offset="100%" stop-color="#0e1226"/>
    </linearGradient>
    <linearGradient id="maroonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#a12a2a"/>
      <stop offset="100%" stop-color="#6e1717"/>
    </linearGradient>
    <path id="topArc" d="M 41.0,200.0 A 163,163 0 0 1 359.0,200.0"/>
    <path id="bottomArc" d="M 41.0,200.0 A 163,163 0 0 0 359.0,200.0"/>
  </defs>
  <circle cx="200" cy="200" r="190" fill="url(#navyGrad)" stroke="url(#goldGrad)" stroke-width="4"/>
  <circle cx="200" cy="200" r="176" fill="none" stroke="url(#goldGrad)" stroke-width="2" opacity="0.6"/>
  <g fill="url(#goldGrad)" opacity="0.85" transform="translate(200,200)">
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(0)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(9)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(18)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(27)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(36)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(45)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(54)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(63)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(72)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(81)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(90)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(99)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(108)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(117)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(126)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(135)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(144)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(153)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(162)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(171)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(180)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(189)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(198)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(207)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(216)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(225)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(234)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(243)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(252)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(261)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(270)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(279)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(288)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(297)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(306)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(315)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(324)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(333)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(342)"/>
    <rect x="-1.2" y="-190" width="2.4" height="8" transform="rotate(351)"/>
  </g>
  <text font-family="Georgia, 'Times New Roman', serif" font-size="19" font-weight="700" letter-spacing="4.5" fill="url(#goldGrad)">
    <textPath href="#topArc" startOffset="50%" text-anchor="middle">BIS ASSIST</textPath>
  </text>
  <text font-family="Georgia, 'Times New Roman', serif" font-size="10.5" font-weight="600" letter-spacing="2" fill="#e8d29a">
    <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">OFFICIAL STANDARDS PORTAL</textPath>
  </text>
  <circle cx="41" cy="200" r="2.5" fill="url(#goldGrad)"/>
  <circle cx="359" cy="200" r="2.5" fill="url(#goldGrad)"/>
  <circle cx="200" cy="200" r="150" fill="#161b34" stroke="url(#goldGrad)" stroke-width="1.5"/>
  <g fill="none" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round">
    <path d="M 112,266 C 98,240 96,205 105,172 C 112,150 106,138 98,120"/>
    <g stroke-width="2">
      <path d="M 108,248 C 96,245 87,249 81,258"/>
      <path d="M 105,228 C 93,226 83,230 77,239"/>
      <path d="M 106,208 C 94,206 84,210 78,219"/>
      <path d="M 108,188 C 97,186 88,190 82,198"/>
      <path d="M 104,168 C 94,166 85,169 79,177"/>
      <path d="M 101,148 C 92,146 84,149 78,156"/>
    </g>
    <path d="M 288,266 C 302,240 304,205 295,172 C 288,150 294,138 302,120"/>
    <g stroke-width="2">
      <path d="M 292,248 C 304,245 313,249 319,258"/>
      <path d="M 295,228 C 307,226 317,230 323,239"/>
      <path d="M 294,208 C 306,206 316,210 322,219"/>
      <path d="M 292,188 C 303,186 312,190 318,198"/>
      <path d="M 296,168 C 306,166 315,169 321,177"/>
      <path d="M 299,148 C 308,146 316,149 322,156"/>
    </g>
  </g>
  <g transform="translate(200,170)">
    <path d="M 0,-46 L 36,-32 C 36,-2 31,28 0,48 C -31,28 -36,-2 -36,-32 Z" fill="url(#maroonGrad)" stroke="url(#goldGrad)" stroke-width="3"/>
    <path d="M 0,-36 L 28,-25 C 28,-2 24,20 0,38 C -24,20 -28,-2 -28,-25 Z" fill="none" stroke="url(#goldGrad)" stroke-width="1" opacity="0.7"/>
    <path d="M -16,-1 L -5,11 L 19,-17" fill="none" stroke="url(#goldGrad)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <g transform="translate(200,246)" fill="url(#goldGrad)">
    <path d="M0,-9 L2.4,-2.8 L9,-2.8 L3.7,1.3 L5.6,7.7 L0,3.8 L-5.6,7.7 L-3.7,1.3 L-9,-2.8 L-2.4,-2.8 Z"/>
  </g>
</svg>`;

function Medallion3D({ mousePos }: { mousePos: { x: number; y: number } }) {
  const groupRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  // Generate high-resolution SVG texture with upright orientation
  useEffect(() => {
    const img = new Image();
    const svgBlob = new Blob([SVG_CODE], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Rotate context -Math.PI / 2 so emblem is perfectly right side up
        ctx.translate(512, 512);
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(img, -512, -512, 1024, 1024);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        setTexture(tex);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  // Gold metallic material for cylinder rim edge
  const rimMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xf3d38a,
      metalness: 0.95,
      roughness: 0.15,
    });
  }, []);

  // Double-sided emblem face material
  const faceMaterial = useMemo(() => {
    if (!texture) return rimMaterial;
    return new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.4,
      roughness: 0.3,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [texture, rimMaterial]);

  // Cylinder geometry materials array: [side, top, bottom]
  const materials = useMemo(() => {
    return [rimMaterial, faceMaterial, faceMaterial];
  }, [rimMaterial, faceMaterial]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // 1. Continuous 360° Y-axis rotation loop
    groupRef.current.rotation.y += delta * 0.75;

    // 2. Responsive Mouse Parallax Tilt (tracking global window mouse offset)
    const targetX = mousePos.y * 0.45;
    const targetZ = -mousePos.x * 0.35;

    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.1;
    groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * 0.1;

    // Smooth floating movement
    groupRef.current.position.y = Math.sin(Date.now() * 0.0018) * 0.12;
  });

  return (
    <group ref={groupRef}>
      {/* 3D Extruded Metallic Medallion Cylinder */}
      <mesh material={materials} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 0.22, 64]} />
      </mesh>

      {/* Raised Metallic Outer Bevel Ring */}
      <mesh material={rimMaterial} position={[0, 0, 0.12]}>
        <torusGeometry args={[2.02, 0.06, 16, 64]} />
      </mesh>
      <mesh material={rimMaterial} position={[0, 0, -0.12]}>
        <torusGeometry args={[2.02, 0.06, 16, 64]} />
      </mesh>
    </group>
  );
}

export default function Hero3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);

  // Global window mouse parallax tracking across the entire hero section
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);

    const container = containerRef.current;
    let observer: IntersectionObserver | null = null;

    if (container) {
      observer = new IntersectionObserver(
        ([entry]) => setIsVisible(entry.isIntersecting),
        { threshold: 0.1 }
      );
      observer.observe(container);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Golden Ambient Lighting Glow */}
      <div
        style={{
          position: 'absolute',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(243,211,138,0.25) 0%, rgba(208,74,12,0.12) 55%, transparent 75%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {isVisible && (
        <Canvas
          camera={{ position: [0, 0, 6.2], fov: 42 }}
          style={{ width: '100%', height: '100%', position: 'relative' }}
          gl={{ alpha: true, antialias: true }}
        >
          {/* Key Light (Top Right) */}
          <directionalLight position={[6, 6, 7]} intensity={3.8} color="#ffffff" />

          {/* Cool Rim Light (Bottom Left) */}
          <directionalLight position={[-6, -5, 5]} intensity={2.5} color="#60a5fa" />

          {/* Warm Specular Point Glow */}
          <pointLight position={[2, 2, 4]} intensity={3.0} color="#f3d38a" />

          {/* Ambient Fill */}
          <ambientLight intensity={0.9} />

          <Medallion3D mousePos={mousePos} />
        </Canvas>
      )}
    </div>
  );
}
