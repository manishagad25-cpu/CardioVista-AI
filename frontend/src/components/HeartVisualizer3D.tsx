import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { AnatomicalMapping } from '../types';
import { RotateCw, Heart, RefreshCw } from 'lucide-react';

interface Props {
  mapping?: AnatomicalMapping;
  pulseRate?: number;
  selectedVessel?: string | null;
  onSelectVessel?: (vessel: string | null) => void;
}

interface VesselInfo {
  name: string;
  fullName: string;
  territory: string;
  clinicalSignificance: string;
  branches: string;
  anatomicalCourse: string;
}

const VESSEL_DETAILS: Record<string, VesselInfo> = {
  LAD: {
    name: 'LAD',
    fullName: 'Left Anterior Descending Artery',
    territory: 'Anterior left ventricular wall, anterior 2/3 of interventricular septum, cardiac apex.',
    clinicalSignificance: 'Primary perfusion vessel supplying 45–55% of left ventricular myocardial mass. Stenosis critically affects ejection fraction.',
    branches: 'Diagonal branches (D1, D2), Septal perforators',
    anatomicalCourse: 'Courses through the anterior interventricular sulcus toward the cardiac apex.'
  },
  LCX: {
    name: 'LCX',
    fullName: 'Left Circumflex Artery',
    territory: 'Posterolateral left ventricular free wall, anterolateral papillary muscle, left atrium.',
    clinicalSignificance: 'Supplies the lateral and posterior left ventricle. Critical for maintaining posterolateral contractility and mitral apparatus stability.',
    branches: 'Obtuse Marginal branches (OM1, OM2), Posterolateral branches',
    anatomicalCourse: 'Originates from the left main coronary artery and curves along the left atrioventricular groove.'
  },
  RCA: {
    name: 'RCA',
    fullName: 'Right Coronary Artery',
    territory: 'Right ventricle myocardium, inferior diaphragmatic LV wall, SA node (60%), AV node (90%).',
    clinicalSignificance: 'Supplies the right heart and conduction pacing system. Stenosis frequently precipitates inferior myocardial infarction and AV blocks.',
    branches: 'Conus branch, Acute Marginal (AM), Posterior Descending Artery (PDA)',
    anatomicalCourse: 'Arises from the right aortic sinus and travels inferiorly along the right coronary sulcus to the crux cordis.'
  }
};

export const HeartVisualizer3D: React.FC<Props> = ({
  mapping,
  pulseRate = 75,
  selectedVessel: externalSelectedVessel,
  onSelectVessel
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [internalSelectedVessel, setInternalSelectedVessel] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'lad' | 'lcx' | 'rca'>('overview');
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const selectedVessel = externalSelectedVessel !== undefined ? externalSelectedVessel : internalSelectedVessel;

  const handleSelectVessel = (vessel: string | null) => {
    setInternalSelectedVessel(vessel);
    if (onSelectVessel) onSelectVessel(vessel);
  };

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const heartGroupRef = useRef<THREE.Group | null>(null);
  const vesselsRef = useRef<Record<string, THREE.Mesh>>({});

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 520;
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
    // Initial camera position providing a natural anatomical anterior-oblique view
    camera.position.set(0, 0.25, 4.4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // High-contrast, clean dark medical workstation canvas
    renderer.setClearColor(0x13171F, 1.0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // 2. Anatomical 3-Point Studio Lighting
    // Subtle balanced ambient illumination
    const ambientLight = new THREE.AmbientLight(0xE2E8F0, 0.55);
    scene.add(ambientLight);

    // Warm Key Light (accentuating myocardial striations & sulcal topography)
    const keyLight = new THREE.DirectionalLight(0xFFF7EC, 1.4);
    keyLight.position.set(4, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Cool Fill Light (illuminating posterior grooves and lateral margins)
    const fillLight = new THREE.DirectionalLight(0xD6E4F0, 0.75);
    fillLight.position.set(-4, -1, 3.5);
    scene.add(fillLight);

    // Sharp Rim / Edge Light (crisply defining aortic arch, pulmonary trunk, and apex)
    const rimLight = new THREE.DirectionalLight(0xFFFFFF, 1.15);
    rimLight.position.set(0, 4.5, -4.5);
    scene.add(rimLight);

    // Subtle bottom bounce light for apex definition
    const bounceLight = new THREE.DirectionalLight(0x2B384E, 0.4);
    bounceLight.position.set(0, -4, 2);
    scene.add(bounceLight);

    // 3. Heart Group Container
    const heartGroup = new THREE.Group();
    heartGroupRef.current = heartGroup;
    scene.add(heartGroup);

    // Anatomical orientation: base superior, apex pointing antero-inferiorly to the left
    heartGroup.rotation.y = -0.22;
    heartGroup.rotation.x = 0.08;

    // 4. Anatomically Plausible Coronary Vascular Pathways (LAD, LCX, RCA)
    // Conforming directly to verified surface vertices along the natural sulci of realistic_heart.glb
    const createVesselMesh = (name: string, points: THREE.Vector3[], radius: number, isArtery: boolean = true) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const geom = new THREE.TubeGeometry(curve, 64, radius, 12, false);
      const mat = new THREE.MeshStandardMaterial({
        color: isArtery ? 0x88241C : 0x1E5CA8, // Natural arterial red or anatomical venous blue
        roughness: 0.30,
        metalness: 0.18,
        emissive: 0x000000,
        emissiveIntensity: 0.0
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.name = name;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      heartGroup.add(mesh);
      if (isArtery) {
        vesselsRef.current[name] = mesh;
      }
      return mesh;
    };

    // Anterior Interventricular Vein (Anatomical Landmark mirroring reference image)
    createVesselMesh('GreatCardiacVein', [
      new THREE.Vector3(-0.095, 0.435, 0.425),
      new THREE.Vector3(-0.040, 0.235, 0.518),
      new THREE.Vector3(-0.042, 0.088, 0.582),
      new THREE.Vector3(-0.008, -0.112, 0.615),
      new THREE.Vector3(0.052, -0.285, 0.612),
      new THREE.Vector3(0.072, -0.501, 0.540),
      new THREE.Vector3(0.082, -0.720, 0.450),
      new THREE.Vector3(0.082, -0.908, 0.332)
    ], 0.016, false);

    // LAD (Left Anterior Descending Artery): courses tightly along anterior interventricular sulcus to apex
    createVesselMesh('LAD', [
      new THREE.Vector3(-0.112, 0.424, 0.420),
      new THREE.Vector3(-0.053, 0.227, 0.512),
      new THREE.Vector3(-0.056, 0.079, 0.576),
      new THREE.Vector3(-0.020, -0.121, 0.610),
      new THREE.Vector3(0.044, -0.294, 0.606),
      new THREE.Vector3(0.063, -0.509, 0.534),
      new THREE.Vector3(0.074, -0.728, 0.445),
      new THREE.Vector3(0.074, -0.915, 0.326)
    ], 0.015, true);

    // LCX (Left Circumflex Artery): courses laterally along left atrioventricular groove
    createVesselMesh('LCX', [
      new THREE.Vector3(-0.173, 0.393, 0.420),
      new THREE.Vector3(-0.359, 0.356, 0.407),
      new THREE.Vector3(-0.619, 0.282, 0.236),
      new THREE.Vector3(-0.731, 0.110, -0.004),
      new THREE.Vector3(-0.741, -0.129, -0.245),
      new THREE.Vector3(-0.596, -0.326, -0.395),
      new THREE.Vector3(-0.413, -0.506, -0.445)
    ], 0.014, true);

    // RCA (Right Coronary Artery): courses through right atrioventricular sulcus to crux cordis
    createVesselMesh('RCA', [
      new THREE.Vector3(0.192, 0.392, 0.443),
      new THREE.Vector3(0.345, 0.311, 0.338),
      new THREE.Vector3(0.507, 0.178, 0.252),
      new THREE.Vector3(0.599, 0.002, 0.112),
      new THREE.Vector3(0.632, -0.217, -0.112),
      new THREE.Vector3(0.584, -0.477, -0.342),
      new THREE.Vector3(0.285, -0.713, -0.410),
      new THREE.Vector3(0.090, -0.852, -0.338)
    ], 0.014, true);

    // 5. Load High-Fidelity Anatomical Human Heart 3D Model
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/models/realistic_heart.glb',
      (gltf) => {
        const loadedModel = gltf.scene;

        // Automatically calculate bounding box to scale and center precisely
        const box = new THREE.Box3().setFromObject(loadedModel);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const targetHeight = 2.25;
        const scaleFactor = targetHeight / maxDim;
        loadedModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Center loaded model at container origin
        loadedModel.position.x = -center.x * scaleFactor;
        loadedModel.position.y = -center.y * scaleFactor;
        loadedModel.position.z = -center.z * scaleFactor;

        // Apply realistic natural PBR myocardium material properties
        loadedModel.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            const mesh = node as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              // Natural fleshy myocardium sheen with micro-relief normal map
              mat.roughness = 0.38;
              mat.metalness = 0.06;
              if (mat.normalMap) {
                mat.normalScale = new THREE.Vector2(1.15, 1.15);
              }
              mat.needsUpdate = true;
            }
          }
        });

        heartGroup.add(loadedModel);
        setModelLoaded(true);
        setLoadError(null);
      },
      undefined,
      (err) => {
        console.error('Failed to load primary realistic heart asset:', err);
        setLoadError('Loading fallback anatomical asset...');
        // Fallback to standard heart GLB if needed
        gltfLoader.load(
          '/models/heart.glb',
          (fallbackGltf) => {
            const fallbackModel = fallbackGltf.scene;
            const box = new THREE.Box3().setFromObject(fallbackModel);
            const size = new THREE.Vector3();
            box.getSize(size);
            const center = new THREE.Vector3();
            box.getCenter(center);
            const scaleFactor = 2.2 / Math.max(size.x, size.y, size.z);
            fallbackModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
            fallbackModel.position.set(-center.x * scaleFactor, -center.y * scaleFactor, -center.z * scaleFactor);
            heartGroup.add(fallbackModel);
            setModelLoaded(true);
            setLoadError(null);
          },
          undefined,
          (fallbackErr) => {
            console.error('Fallback asset also failed:', fallbackErr);
            setLoadError('Could not load 3D heart asset. Check WebGL availability.');
          }
        );
      }
    );

    // 6. Interactive Smooth Orbit & Drag Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      heartGroup.rotation.y += deltaX * 0.0075;
      heartGroup.rotation.x += deltaY * 0.0075;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + e.deltaY * 0.0035, 2.8, 7.0);
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    mount.addEventListener('wheel', onWheel, { passive: false });

    // 7. Raycasting for Direct Vessel Clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactiveMeshes = Object.values(vesselsRef.current);
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);

      if (intersects.length > 0) {
        const hitVesselName = intersects[0].object.name;
        if (hitVesselName) {
          handleSelectVessel(hitVesselName);
        }
      }
    };
    mount.addEventListener('click', onClick);

    // 8. Cardiac Systolic/Diastolic Animation Loop
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Realistic cardiac systolic/diastolic contraction pulsation
      const bps = (pulseRate || 75) / 60;
      const heartBeat = Math.sin(elapsedTime * bps * Math.PI * 2);
      const pulseScale = 1 + (heartBeat > 0.45 ? (heartBeat - 0.45) * 0.024 : 0);
      heartGroup.scale.set(pulseScale, pulseScale, pulseScale);

      if (autoRotate && !isDragging) {
        heartGroup.rotation.y += 0.004;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Observer for Robust Responsiveness
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      mount.removeEventListener('wheel', onWheel);
      mount.removeEventListener('click', onClick);
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [pulseRate]);

  // Synchronize arterial vessel colors with actual model prediction probabilities
  useEffect(() => {
    if (!mapping) return;

    const targets: ('LAD' | 'LCX' | 'RCA')[] = ['LAD', 'LCX', 'RCA'];
    targets.forEach(vesselKey => {
      const mesh = vesselsRef.current[vesselKey];
      const state = mapping[vesselKey];
      if (mesh && state) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const isStenotic = state.status === 'Stenotic' || state.probability >= 0.50;
        const isBorderline = !isStenotic && state.probability >= 0.40;
        const isSelected = selectedVessel === vesselKey;

        if (isSelected) {
          // Selected vessel: brightly illuminated with risk status color and glowing emissive halo
          const highlightColor = isStenotic ? 0xEF4444 : isBorderline ? 0xF59E0B : 0x10B981;
          mat.color.setHex(highlightColor);
          mat.roughness = 0.16;
          mat.metalness = 0.30;
          mat.emissive = new THREE.Color(isStenotic ? 0x7F1D1D : isBorderline ? 0x78350F : 0x064E3B);
          mat.emissiveIntensity = 0.55;
        } else if (selectedVessel === null) {
          // Overview mode: subtle, natural anatomical tint indicating evaluated risk state
          const ambientColor = isStenotic ? 0x99241B : isBorderline ? 0x8C5A18 : 0x247A46;
          mat.color.setHex(ambientColor);
          mat.roughness = 0.30;
          mat.metalness = 0.18;
          mat.emissive = new THREE.Color(0x000000);
          mat.emissiveIntensity = 0.0;
        } else {
          // Another vessel is focused: dim unselected vessel to natural anatomical resting tone
          mat.color.setHex(0x661814);
          mat.roughness = 0.38;
          mat.metalness = 0.12;
          mat.emissive = new THREE.Color(0x000000);
          mat.emissiveIntensity = 0.0;
        }
        mat.needsUpdate = true;
      }
    });
  }, [mapping, selectedVessel]);

  // Smooth anatomical camera presets targeting specific vascular territories
  const applyView = (view: 'overview' | 'lad' | 'lcx' | 'rca') => {
    setActiveView(view);
    setAutoRotate(false);
    if (!heartGroupRef.current || !cameraRef.current) return;

    const hg = heartGroupRef.current;
    const cam = cameraRef.current;

    switch (view) {
      case 'lad': // Anterior interventricular view
        hg.rotation.set(0.06, 0.05, 0.0);
        cam.position.set(0, 0.15, 3.8);
        handleSelectVessel('LAD');
        break;
      case 'lcx': // Left lateral posterolateral view
        hg.rotation.set(0.10, -1.35, 0.0);
        cam.position.set(-0.8, 0.3, 3.8);
        handleSelectVessel('LCX');
        break;
      case 'rca': // Right atrioventricular view
        hg.rotation.set(0.12, 1.45, 0.0);
        cam.position.set(0.8, 0.3, 3.8);
        handleSelectVessel('RCA');
        break;
      case 'overview':
        hg.rotation.set(0.08, -0.22, 0.0);
        cam.position.set(0, 0.25, 4.4);
        handleSelectVessel(null);
        break;
    }
  };

  const selectedDetails = selectedVessel ? VESSEL_DETAILS[selectedVessel] : null;
  const selectedState = selectedVessel && mapping ? (mapping as any)[selectedVessel] : null;

  return (
    <div className="clinical-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 1. Header Toolbar */}
      <div className="clinical-card-header" style={{ padding: '16px 20px', background: '#FFFFFF' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284C7'
            }}>
              <Heart size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                3D Anatomical Heart Visualization
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                High-resolution human cardiac anatomy with predictive coronary artery stenosis mapping
              </p>
            </div>
          </div>
        </div>

        {/* View Preset Controls */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-secondary btn-sm ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => applyView('overview')}
            style={activeView === 'overview' ? { background: '#0284C7', color: '#FFFFFF', borderColor: '#0284C7' } : {}}
          >
            Overview
          </button>
          <button
            className={`btn btn-secondary btn-sm ${activeView === 'lad' ? 'active' : ''}`}
            onClick={() => applyView('lad')}
            style={activeView === 'lad' ? { background: '#0284C7', color: '#FFFFFF', borderColor: '#0284C7' } : {}}
          >
            LAD (Anterior)
          </button>
          <button
            className={`btn btn-secondary btn-sm ${activeView === 'lcx' ? 'active' : ''}`}
            onClick={() => applyView('lcx')}
            style={activeView === 'lcx' ? { background: '#0284C7', color: '#FFFFFF', borderColor: '#0284C7' } : {}}
          >
            LCX (Lateral)
          </button>
          <button
            className={`btn btn-secondary btn-sm ${activeView === 'rca' ? 'active' : ''}`}
            onClick={() => applyView('rca')}
            style={activeView === 'rca' ? { background: '#0284C7', color: '#FFFFFF', borderColor: '#0284C7' } : {}}
          >
            RCA (Right AV)
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => applyView('overview')}
            title="Reset Camera Framing"
          >
            <RefreshCw size={13} />
          </button>
          <button
            className={`btn btn-secondary btn-sm ${autoRotate ? 'active' : ''}`}
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle Continuous Rotation"
            style={autoRotate ? { background: '#E0F2FE', color: '#0369A1' } : {}}
          >
            <RotateCw size={13} />
          </button>
        </div>
      </div>

      {/* 2. WebGL 3D Canvas Viewport */}
      <div style={{ position: 'relative', width: '100%', minHeight: '520px', flex: 1 }}>
        <div
          ref={mountRef}
          style={{
            width: '100%',
            height: '100%',
            minHeight: '520px',
            cursor: 'grab',
            position: 'relative',
            background: '#13171F'
          }}
        />

        {/* Loading / Status Overlay */}
        {!modelLoaded && !loadError && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(19, 23, 31, 0.85)',
            color: '#E2E8F0',
            gap: '12px',
            fontSize: '13px'
          }}>
            <RotateCw className="animate-spin" size={24} color="#38BDF8" />
            <span>Loading High-Resolution Anatomical 3D Model...</span>
          </div>
        )}

        {loadError && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#FFFFFF',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {loadError}
          </div>
        )}

        {/* Interactive Quick Vessel Selector Floating Pill */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          display: 'flex',
          gap: '8px',
          background: 'rgba(19, 23, 31, 0.75)',
          backdropFilter: 'blur(8px)',
          padding: '6px 10px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          {(['LAD', 'LCX', 'RCA'] as const).map(vKey => {
            const st = mapping ? mapping[vKey] : null;
            const isSelected = selectedVessel === vKey;
            const prob = st ? (st.probability * 100).toFixed(0) : '--';
            const color = st?.probability && st.probability >= 0.50 ? '#EF4444' : st?.probability && st.probability >= 0.40 ? '#F59E0B' : '#10B981';
            return (
              <button
                key={vKey}
                type="button"
                onClick={() => applyView(vKey.toLowerCase() as any)}
                style={{
                  background: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  border: isSelected ? `1px solid ${color}` : '1px solid transparent',
                  borderRadius: '14px',
                  padding: '3px 8px',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color }} />
                <span>{vKey}</span>
                <span style={{ opacity: 0.8, fontSize: '10px', fontWeight: 400 }}>{prob}%</span>
              </button>
            );
          })}
        </div>

        {/* Viewport Camera Instructions */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '16px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '11px',
          background: 'rgba(19, 23, 31, 0.65)',
          backdropFilter: 'blur(4px)',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          Drag to orbit • Scroll to zoom • Click artery to inspect
        </div>
      </div>

      {/* 3. Clinical Perfusion & Status Legend */}
      <div style={{
        padding: '12px 20px',
        background: '#F8FAFC',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Vascular Risk Mapping:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10B981' }} />
            <span style={{ color: 'var(--text-primary)' }}>Patent (&lt; 40%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#D97706' }} />
            <span style={{ color: 'var(--text-primary)' }}>Borderline (40–49%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#DC2626' }} />
            <span style={{ color: 'var(--text-primary)' }}>Stenotic (&ge; 50%)</span>
          </div>
        </div>

        <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
          Heart Rate Pulse: <strong>{pulseRate} BPM</strong>
        </div>
      </div>

      {/* 4. Selected Artery Clinical Inspection Card */}
      {selectedDetails && (
        <div style={{
          padding: '16px 20px',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`status-badge ${
                selectedState?.status === 'Stenotic' || (selectedState?.probability && selectedState.probability >= 0.50)
                  ? 'status-badge-abnormal'
                  : selectedState?.probability >= 0.40
                  ? 'status-badge-warning'
                  : 'status-badge-normal'
              }`}>
                {selectedState?.status || (selectedState?.probability >= 0.50 ? 'Stenotic' : 'Patent')}
              </span>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {selectedDetails.fullName} ({selectedDetails.name})
              </h4>
            </div>

            {selectedState && (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Model Stenosis Probability: <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{(selectedState.probability * 100).toFixed(1)}%</strong>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', fontSize: '12px' }}>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Myocardial Territory: </span>
              <span style={{ color: 'var(--text-primary)' }}>{selectedDetails.territory}</span>
            </div>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Anatomical Course: </span>
              <span style={{ color: 'var(--text-primary)' }}>{selectedDetails.anatomicalCourse}</span>
            </div>
          </div>

          <div style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            background: '#F8FAFC',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            lineHeight: 1.5
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>Clinical Significance:</strong> {selectedDetails.clinicalSignificance}
          </div>
        </div>
      )}

      {/* 5. Provenance & Clinical Limitation Note */}
      <div style={{
        padding: '10px 20px',
        background: '#F8FAFC',
        fontSize: '11px',
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <span>
          3D Anatomical Asset: Licensed under Creative Commons Attribution (CC-BY 4.0 / Medical Education ZBrush Human Anatomy).
        </span>
        <span>
          Educational visualization: Coronary arteries represent predictive decision overlays, not patient CT segmentations.
        </span>
      </div>
    </div>
  );
};
