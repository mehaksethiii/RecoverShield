import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface TransactionItem {
  id: string;
  amount: number;
  reason: string;
  riskScore: number;
  diagnosis: string;
  strategy: string;
  status: 'ANALYZING' | 'ROUTING' | 'RECOVERED' | 'BLOCKED';
  pos: THREE.Vector3;
}

interface RecoverShield3DCoreProps {
  activeRisksCount?: number;
  revenueAtRisk?: number;
  recoveredAmount?: number;
  onSimulateEvent?: () => void;
}

const FAILURE_PRESETS = [
  { reason: 'UPI Timeout', diagnosis: 'Transient gateway latency', strategy: 'Smart Retry', amount: 3499, risk: 42 },
  { reason: 'Insufficient Funds', diagnosis: 'Issuer account balance low', strategy: 'Payment Link (WhatsApp/SMS)', amount: 8900, risk: 65 },
  { reason: 'Bank Server Offline', diagnosis: 'Core banking outage at HDFC', strategy: 'Alternate Route (Card/Netbanking)', amount: 12500, risk: 58 },
  { reason: 'Card Expired / Declined', diagnosis: 'Card tokenization mismatch', strategy: 'Dynamic Payment Link', amount: 4999, risk: 71 },
  { reason: 'Velocity Limit Exceeded', diagnosis: 'Policy violation: >3 rapid attempts', strategy: 'Policy Block & Human Review', amount: 145000, risk: 94 },
  { reason: 'Authentication Failure', diagnosis: '2FA OTP expired by user', strategy: 'Smart Retry with Instant OTP', amount: 2199, risk: 38 },
];

export default function RecoverShield3DCore({
  activeRisksCount = 26,
  revenueAtRisk = 762981,
  recoveredAmount = 241820,
  onSimulateEvent,
}: RecoverShield3DCoreProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredTxn, setHoveredTxn] = useState<TransactionItem | null>(null);
  const [diagnosisStep, setDiagnosisStep] = useState<string>('RECOVERSHIELD AI CORE ACTIVE');
  const [successPuffs, setSuccessPuffs] = useState<Array<{ id: number; text: string; x: number; y: number }>>([]);

  // Compute live recovery rate
  const totalTracked = revenueAtRisk + recoveredAmount;
  const recoveryRate = totalTracked > 0 ? ((recoveredAmount / totalTracked) * 100).toFixed(1) : '31.7';

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 900;
    let height = container.clientHeight || 480;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 10.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Main Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // -------------------------------------------------------------
    // 1. CENTRAL AI RECOVERY CORE
    // -------------------------------------------------------------
    const coreGroup = new THREE.Group();
    rootGroup.add(coreGroup);

    // Outer Holographic Geometric Shield (Icosahedron Wireframe)
    const shieldGeo = new THREE.IcosahedronGeometry(1.35, 1);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    coreGroup.add(shieldMesh);

    // Inner Glowing Core Sphere
    const innerGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.9,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerSphere);

    // Multiple Concentric Transparent Rings
    const rings: THREE.Mesh[] = [];
    const ringRadii = [1.7, 2.05, 2.4];
    const ringColors = [0x38bdf8, 0x818cf8, 0x06b6d4];

    ringRadii.forEach((radius, i) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.02, 16, 90);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColors[i],
        transparent: true,
        opacity: 0.45 - i * 0.08,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / (2 + i * 0.8);
      ring.rotation.y = (i * Math.PI) / 3;
      coreGroup.add(ring);
      rings.push(ring);
    });

    // Orbiting Core Particle Swarm
    const coreParticlesCount = 80;
    const corePos = new Float32Array(coreParticlesCount * 3);
    for (let i = 0; i < coreParticlesCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.35 + Math.random() * 0.7;
      corePos[i] = r * Math.sin(phi) * Math.cos(theta);
      corePos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      corePos[i + 2] = r * Math.cos(phi);
    }
    const coreParticlesGeo = new THREE.BufferGeometry();
    coreParticlesGeo.setAttribute('position', new THREE.BufferAttribute(corePos, 3));
    const coreParticlesMat = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
    });
    const coreParticles = new THREE.Points(coreParticlesGeo, coreParticlesMat);
    coreGroup.add(coreParticles);

    // -------------------------------------------------------------
    // 2. INBOUND FAILED PAYMENT NODES (LEFT SIDE, X ≈ -4.2)
    // -------------------------------------------------------------
    const failedNodesGroup = new THREE.Group();
    rootGroup.add(failedNodesGroup);

    const failedPositions = [
      { pos: new THREE.Vector3(-4.4, 1.8, 0), label: 'BANK TIMEOUT' },
      { pos: new THREE.Vector3(-4.6, 0.6, 0.6), label: 'INSUFFICIENT FUNDS' },
      { pos: new THREE.Vector3(-4.5, -0.6, -0.4), label: 'CARD DECLINED' },
      { pos: new THREE.Vector3(-4.3, -1.8, 0.3), label: 'NETWORK ERROR' },
    ];

    const failedOrbs: THREE.Mesh[] = [];
    failedPositions.forEach((node) => {
      const orbGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const orbMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xdc2626,
        emissiveIntensity: 0.9,
        roughness: 0.2,
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.copy(node.pos);
      failedNodesGroup.add(orb);
      failedOrbs.push(orb);

      // Connecting glowing conduit line into Core
      const curve = new THREE.QuadraticBezierCurve3(
        node.pos,
        new THREE.Vector3(node.pos.x * 0.4, node.pos.y * 0.3, node.pos.z * 0.5),
        new THREE.Vector3(0, 0, 0)
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 30, 0.015, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.35,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      failedNodesGroup.add(tube);
    });

    // -------------------------------------------------------------
    // 3. AI RECOVERY ROUTE NODES (RIGHT SIDE, X ≈ +2.2)
    // -------------------------------------------------------------
    const routeNodesGroup = new THREE.Group();
    rootGroup.add(routeNodesGroup);

    const routePositions = [
      { name: 'SMART RETRY', color: 0x06b6d4, pos: new THREE.Vector3(2.4, 1.6, 0.2) },
      { name: 'PAYMENT LINK', color: 0x8b5cf6, pos: new THREE.Vector3(2.7, 0.5, -0.3) },
      { name: 'ALTERNATE ROUTE', color: 0x3b82f6, pos: new THREE.Vector3(2.5, -0.6, 0.4) },
      { name: 'POLICY BLOCK', color: 0xf43f5e, pos: new THREE.Vector3(2.2, -1.7, -0.2) },
    ];

    const routeOrbs: THREE.Mesh[] = [];
    routePositions.forEach((route) => {
      const orbGeo = new THREE.OctahedronGeometry(0.25, 0);
      const orbMat = new THREE.MeshStandardMaterial({
        color: route.color,
        emissive: route.color,
        emissiveIntensity: 0.9,
        roughness: 0.1,
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.copy(route.pos);
      routeNodesGroup.add(orb);
      routeOrbs.push(orb);

      // Conduit line from Core to Route
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(route.pos.x * 0.5, route.pos.y * 0.4, route.pos.z * 0.4),
        route.pos
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.016, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: route.color,
        transparent: true,
        opacity: 0.4,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      routeNodesGroup.add(tube);
    });

    // -------------------------------------------------------------
    // 4. RECOVERED REVENUE ZONE (FAR RIGHT, X ≈ +4.4)
    // -------------------------------------------------------------
    const recoveredGroup = new THREE.Group();
    rootGroup.add(recoveredGroup);

    const recoveredCenter = new THREE.Vector3(4.5, 0.2, 0);

    // Emerald collector gate (double glowing rings)
    const recRingGeo = new THREE.TorusGeometry(0.85, 0.035, 16, 60);
    const recRingMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 1.4,
    });
    const recRing1 = new THREE.Mesh(recRingGeo, recRingMat);
    recRing1.position.copy(recoveredCenter);
    recRing1.rotation.y = Math.PI / 2.3;
    recoveredGroup.add(recRing1);

    const recRing2 = new THREE.Mesh(recRingGeo, recRingMat.clone());
    recRing2.position.copy(recoveredCenter);
    recRing2.rotation.y = -Math.PI / 2.3;
    recoveredGroup.add(recRing2);

    // Collector conduit lines from routes (except Policy Block) to Recovered Zone
    routePositions.slice(0, 3).forEach((route) => {
      const curve = new THREE.QuadraticBezierCurve3(
        route.pos,
        new THREE.Vector3(3.6, (route.pos.y + recoveredCenter.y) * 0.5, 0.2),
        recoveredCenter
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.012, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.35,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      recoveredGroup.add(tube);
    });

    // -------------------------------------------------------------
    // 5. ANIMATED ACTIVE TRANSACTION PACKETS
    // -------------------------------------------------------------
    interface ActivePacket {
      mesh: THREE.Mesh;
      data: TransactionItem;
      progress: number;
      speed: number;
      startPos: THREE.Vector3;
      routeTarget: typeof routePositions[0];
      stage: 'TO_CORE' | 'AT_CORE' | 'TO_ROUTE' | 'TO_RECOVERED' | 'DONE';
      dwellTime: number;
    }

    const activePackets: ActivePacket[] = [];
    const packetGeometry = new THREE.SphereGeometry(0.12, 14, 14);

    const spawnTransaction = () => {
      const preset = FAILURE_PRESETS[Math.floor(Math.random() * FAILURE_PRESETS.length)];
      const fromNode = failedPositions[Math.floor(Math.random() * failedPositions.length)];
      const targetRoute = preset.strategy.includes('Block') 
        ? routePositions[3] 
        : routePositions[Math.floor(Math.random() * 3)];

      const txnData: TransactionItem = {
        id: `TXN_${Math.floor(10000 + Math.random() * 90000)}`,
        amount: preset.amount,
        reason: preset.reason,
        riskScore: preset.risk,
        diagnosis: preset.diagnosis,
        strategy: preset.strategy,
        status: 'ANALYZING',
        pos: fromNode.pos.clone(),
      };

      const packetMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xe11d48,
        emissiveIntensity: 1.2,
      });
      const mesh = new THREE.Mesh(packetGeometry, packetMat);
      mesh.position.copy(fromNode.pos);
      rootGroup.add(mesh);

      activePackets.push({
        mesh,
        data: txnData,
        progress: 0,
        speed: 0.008 + Math.random() * 0.004,
        startPos: fromNode.pos.clone(),
        routeTarget: targetRoute,
        stage: 'TO_CORE',
        dwellTime: 0,
      });
    };

    // Initial seed packets
    spawnTransaction();
    setTimeout(spawnTransaction, 1400);

    // -------------------------------------------------------------
    // 6. LIGHTING
    // -------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0x06b6d4, 4, 15);
    coreLight.position.set(0, 0, 1);
    scene.add(coreLight);

    const redLight = new THREE.PointLight(0xef4444, 2.5, 12);
    redLight.position.set(-4, 0, 2);
    scene.add(redLight);

    const greenLight = new THREE.PointLight(0x10b981, 3, 12);
    greenLight.position.set(4.5, 0, 2);
    scene.add(greenLight);

    // -------------------------------------------------------------
    // 7. INTERACTION & RAYCASTING
    // -------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isHovering = false;

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouse, camera);
      const candidates = activePackets.map(p => p.mesh);
      const intersects = raycaster.intersectObjects(candidates, false);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const packet = activePackets.find(p => p.mesh === hitMesh);
        if (packet) {
          setHoveredTxn(packet.data);
          isHovering = true;
          container.style.cursor = 'pointer';
        }
      } else if (isHovering) {
        setHoveredTxn(null);
        isHovering = false;
        container.style.cursor = 'default';
      }
    };

    window.addEventListener('mousemove', onPointerMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // -------------------------------------------------------------
    // 8. MAIN ANIMATION LOOP
    // -------------------------------------------------------------
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let spawnTimer = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Core rotation & pulsing
      shieldMesh.rotation.y = elapsed * 0.35;
      shieldMesh.rotation.x = Math.sin(elapsed * 0.2) * 0.15;
      coreParticles.rotation.y = -elapsed * 0.25;

      rings[0].rotation.z = elapsed * 0.4;
      rings[1].rotation.z = -elapsed * 0.35;
      rings[2].rotation.z = elapsed * 0.25;

      const corePulse = 1 + Math.sin(elapsed * 2.4) * 0.05;
      innerSphere.scale.set(corePulse, corePulse, corePulse);

      // Collector rings rotation
      recRing1.rotation.z = elapsed * 0.6;
      recRing2.rotation.z = -elapsed * 0.6;

      // Spawn new transactions periodically (every 3.2s)
      spawnTimer += delta;
      if (spawnTimer > 3.2) {
        spawnTimer = 0;
        if (activePackets.length < 5) {
          spawnTransaction();
        }
      }

      // Update active packets through the 5-stage pipeline
      for (let i = activePackets.length - 1; i >= 0; i--) {
        const packet = activePackets[i];
        const { mesh, startPos, routeTarget } = packet;

        if (packet.stage === 'TO_CORE') {
          packet.progress += packet.speed;
          mesh.position.lerpVectors(startPos, new THREE.Vector3(0, 0, 0), packet.progress);

          if (packet.progress >= 1) {
            packet.stage = 'AT_CORE';
            packet.progress = 0;
            packet.data.status = 'ANALYZING';

            // Trigger HUD diagnosis labels
            setDiagnosisStep('AI DIAGNOSING ROOT CAUSE...');
            setTimeout(() => setDiagnosisStep('ROOT CAUSE DETECTED: ' + packet.data.reason), 600);
            setTimeout(() => setDiagnosisStep('POLICY SELECTED: ' + packet.data.strategy), 1200);
          }
        } else if (packet.stage === 'AT_CORE') {
          packet.dwellTime += delta;
          mesh.position.set(0, 0, 0);

          if (packet.dwellTime > 1.4) {
            packet.stage = 'TO_ROUTE';
            packet.progress = 0;
            packet.data.status = 'ROUTING';

            // Shift color toward the strategy color
            (mesh.material as THREE.MeshStandardMaterial).color.setHex(routeTarget.color);
            (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(routeTarget.color);
          }
        } else if (packet.stage === 'TO_ROUTE') {
          packet.progress += packet.speed * 1.2;
          mesh.position.lerpVectors(new THREE.Vector3(0, 0, 0), routeTarget.pos, packet.progress);

          if (packet.progress >= 1) {
            if (routeTarget.name === 'POLICY BLOCK') {
              packet.stage = 'DONE';
              packet.data.status = 'BLOCKED';
              setDiagnosisStep('GUARDRAIL ACTION: BLOCKED TO PROTECT MERCHANT');
            } else {
              packet.stage = 'TO_RECOVERED';
              packet.progress = 0;
              packet.startPos.copy(routeTarget.pos);

              // Turn emerald green
              (mesh.material as THREE.MeshStandardMaterial).color.setHex(0x10b981);
              (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x059669);
            }
          }
        } else if (packet.stage === 'TO_RECOVERED') {
          packet.progress += packet.speed * 1.4;
          mesh.position.lerpVectors(packet.startPos, recoveredCenter, packet.progress);

          if (packet.progress >= 1) {
            packet.stage = 'DONE';
            packet.data.status = 'RECOVERED';

            // Emit floating recovered label
            const puffId = Date.now() + Math.random();
            const text = `+₹${(packet.data.amount / 100).toLocaleString('en-IN')} RECOVERED`;
            setSuccessPuffs(prev => [...prev.slice(-3), { id: puffId, text, x: 80 + Math.random() * 8, y: 35 + Math.random() * 20 }]);
            setTimeout(() => {
              setSuccessPuffs(prev => prev.filter(p => p.id !== puffId));
            }, 2500);

            // Pulse collector rings
            recRing1.scale.set(1.3, 1.3, 1.3);
            setTimeout(() => recRing1.scale.set(1, 1, 1), 300);
          }
        } else if (packet.stage === 'DONE') {
          rootGroup.remove(mesh);
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
          activePackets.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // -------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------
    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      // Dispose scene objects
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#0B0F19] via-[#0D1424] to-[#080C16] border border-slate-800/80 p-6 shadow-2xl overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMETRY ACTIVE
            </span>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900/90 px-2.5 py-0.5 rounded border border-slate-800">
              RECOVERSHIELD 3D RECOVERY CORE
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Autonomous Pipeline: Failed Payment → AI Diagnosis → Bounded Recovery
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            RecoverShield watches payment telemetry in real time, routes drops through Gemini & Groq reasoning, and restores revenue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onSimulateEvent) onSimulateEvent();
            }}
            className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm shadow-blue-500/10"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Simulate Drop Webhook
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-[460px] my-2">
        {/* Three.js canvas container */}
        <div ref={mountRef} className="w-full h-full" />

        {/* 3D Overlay Labels: Left (Failed Payments) */}
        <div className="absolute top-6 left-4 pointer-events-none z-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-rose-400/90 font-bold mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            DETECTED PAYMENT LOSSES
          </div>
          <div className="space-y-1 text-[11px] text-slate-400 font-mono">
            <div className="bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded border border-rose-500/30 text-rose-300">
              • UPI Gateway Timeout
            </div>
            <div className="bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded border border-rose-500/30 text-rose-300">
              • Insufficient Funds
            </div>
            <div className="bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded border border-rose-500/30 text-rose-300">
              • Issuer Card Decline
            </div>
          </div>
        </div>

        {/* 3D Overlay Labels: Center AI Core */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-10 text-center">
          <div className="inline-block bg-slate-950/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-cyan-500/40 shadow-lg shadow-cyan-500/10">
            <span className="text-[11px] font-mono tracking-wider font-bold text-cyan-300 uppercase flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              {diagnosisStep}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            Gemini 3.1 Pro + Groq LPU State Engine
          </div>
        </div>

        {/* 3D Overlay Labels: Right (Recovery Routes & Recovered Revenue) */}
        <div className="absolute top-6 right-4 pointer-events-none z-10 text-right">
          <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold mb-1 flex items-center justify-end gap-1.5">
            RECOVERED REVENUE ZONE
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="space-y-1 text-[11px] font-mono">
            <div className="bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded border border-emerald-500/40 text-emerald-300 inline-block">
              ✓ Smart Retry (High Conf)
            </div>
            <br />
            <div className="bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded border border-purple-500/40 text-purple-300 inline-block mt-1">
              ✓ Razorpay Payment Link
            </div>
            <br />
            <div className="bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded border border-blue-500/40 text-blue-300 inline-block mt-1">
              ✓ Alternate Payment Rail
            </div>
          </div>
        </div>

        {/* Floating Success Toast Bubbles (+₹X RECOVERED) */}
        {successPuffs.map(puff => (
          <div
            key={puff.id}
            style={{ top: `${puff.y}%`, right: `${100 - puff.x}%` }}
            className="absolute z-20 pointer-events-none transform -translate-y-4 transition-all duration-1000 ease-out animate-bounce bg-emerald-500/90 text-slate-950 text-xs font-black font-mono px-3 py-1 rounded-full shadow-lg shadow-emerald-500/40 border border-emerald-200"
          >
            {puff.text}
          </div>
        ))}

        {/* Hover Transaction Detail Card (Interactive Inspection) */}
        {hoveredTxn && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none w-80 bg-slate-950/95 backdrop-blur-xl p-4 rounded-xl border border-cyan-500/50 shadow-2xl shadow-cyan-500/20 animate-fade-in text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-mono text-xs font-bold text-cyan-400">{hoveredTxn.id}</span>
              <span className="text-xs font-mono font-bold text-white">₹{(hoveredTxn.amount / 100).toLocaleString('en-IN')}</span>
            </div>
            <div className="mt-2 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Trigger:</span>
                <span className="text-rose-400 font-medium">{hoveredTxn.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Risk Score:</span>
                <span className="text-amber-400 font-mono font-bold">{hoveredTxn.riskScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI Diagnosis:</span>
                <span className="text-slate-200 text-right max-w-[160px] truncate">{hoveredTxn.diagnosis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recovery Strategy:</span>
                <span className="text-cyan-300 font-semibold">{hoveredTxn.strategy}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Status:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {hoveredTxn.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Synchronized Live Metrics HUD (Bottom Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-mono font-bold">
            !
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Active Risks</div>
            <div className="text-xl font-black text-white">{activeRisksCount}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold">
            ₹
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Revenue at Risk</div>
            <div className="text-xl font-black text-white">₹{(revenueAtRisk / 100).toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold">
            ✓
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Recovered Today</div>
            <div className="text-xl font-black text-emerald-400">₹{(recoveredAmount / 100).toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold">
            %
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Recovery Rate</div>
            <div className="text-xl font-black text-cyan-400">{recoveryRate}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
