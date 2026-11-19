import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

/** Studio environment map for realistic PBR reflections (generated once). */
export const Env: React.FC<{intensity?: number}> = ({intensity = 0.6}) => {
  const {gl, scene} = useThree();
  useLayoutEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    (scene as unknown as {environmentIntensity: number}).environmentIntensity = intensity;
    return () => { tex.dispose(); pm.dispose(); };
  }, [gl, scene, intensity]);
  return null;
};

/** Drives the R3F default camera from Remotion props each frame. */
export const Cam: React.FC<{pos: [number, number, number]; look: [number, number, number]; fov?: number}> = ({pos, look, fov = 35}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    camera.position.set(...pos);
    (camera as THREE.PerspectiveCamera).fov = fov;
    camera.lookAt(...look);
    camera.updateProjectionMatrix();
  });
  return null;
};

const useFloorTex = () => useMemo(() => {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = '#1C1F25'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`; g.fillRect(Math.random() * 512, Math.random() * 512, 2, 2); }
  g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 6; g.strokeRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}, []);

const metal = new THREE.MeshStandardMaterial({color: '#3A3F48', roughness: 0.35, metalness: 0.8});
const chrome = new THREE.MeshStandardMaterial({color: '#C9CED6', roughness: 0.2, metalness: 1});
const rubber = new THREE.MeshStandardMaterial({color: '#141519', roughness: 0.7});
const pad = new THREE.MeshStandardMaterial({color: '#202228', roughness: 0.6});

/** Hex dumbbell (length ~0.32 m) aligned on X. */
export const Dumbbell: React.FC<{scale?: number}> = ({scale = 1}) => (
  <group scale={scale}>
    <mesh material={chrome} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.016, 0.016, 0.2, 16]} /></mesh>
    {[1, -1].map((s) => <mesh key={s} material={rubber} position={[0.13 * s, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.06, 0.06, 0.08, 6]} /></mesh>)}
  </group>
);
/** Olympic plate (vertical, facing +Z). */
export const Plate: React.FC<{r?: number; position?: [number, number, number]}> = ({r = 0.22, position = [0, 0, 0]}) => (
  <group position={position}>
    <mesh material={rubber} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[r, r, 0.045, 40]} /></mesh>
    <mesh material={chrome} position={[0, 0, 0.026]}><circleGeometry args={[r * 0.18, 24]} /></mesh>
  </group>
);

/** Dark premium gym: textured floor, back wall with LED strips, dumbbell rack, power rack, coloured rim lights. */
export const Gym: React.FC<{rimL?: string; rimR?: string; light?: number}> = ({rimL = '#3D8BFF', rimR = '#FF4747', light = 1}) => {
  const tex = useFloorTex();
  return (
    <>
      <Env />
      <color attach="background" args={['#07090D']} />
      <fog attach="fog" args={['#07090D', 7, 16]} />
      <ambientLight intensity={0.35 * light} />
      <hemisphereLight args={['#9DB4FF', '#1A1410', 0.45 * light]} />
      <spotLight position={[0, 5.5, 4.5]} angle={0.55} penumbra={0.6} intensity={120 * light} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <spotLight position={[-2.6, 2.6, -2.2]} angle={0.7} penumbra={0.8} intensity={70 * light} color={rimL} />
      <spotLight position={[2.6, 2.6, -2.2]} angle={0.7} penumbra={0.8} intensity={70 * light} color={rimR} />
      <pointLight position={[0, 1.6, 2.4]} intensity={6 * light} color="#FFE6CC" />
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[40, 40]} /><meshStandardMaterial map={tex} roughness={0.85} /></mesh>
      {/* back wall + LED strips */}
      <mesh position={[0, 3, -4.2]} receiveShadow><planeGeometry args={[30, 6]} /><meshStandardMaterial color="#111419" roughness={0.9} /></mesh>
      {[0.6, 2.9].map((y, i) => <mesh key={i} position={[0, y, -4.15]}><boxGeometry args={[30, 0.035, 0.02]} /><meshStandardMaterial color="#fff" emissive={i ? '#FFFFFF' : '#9CC4FF'} emissiveIntensity={2.2} /></mesh>)}
      {[-3.2, 3.2].map((x, i) => <mesh key={i} position={[x, 1.8, -4.14]}><boxGeometry args={[0.04, 2.4, 0.02]} /><meshStandardMaterial color="#fff" emissive={i ? rimR : rimL} emissiveIntensity={2.5} /></mesh>)}
      {/* dumbbell rack (left) */}
      <group position={[-2.6, 0, -3.2]}>
        <mesh material={metal} position={[0, 0.45, 0]} castShadow><boxGeometry args={[2.2, 0.06, 0.5]} /></mesh>
        <mesh material={metal} position={[0, 0.85, -0.1]} rotation={[0.3, 0, 0]} castShadow><boxGeometry args={[2.2, 0.05, 0.4]} /></mesh>
        {[-1, 1].map((s) => <mesh key={s} material={metal} position={[1.05 * s, 0.45, 0]}><boxGeometry args={[0.06, 0.9, 0.5]} /></mesh>)}
        {Array.from({length: 6}).map((_, i) => <group key={i} position={[-0.85 + i * 0.34, 0.54, 0.05]} rotation={[0, Math.PI / 2, 0]}><Dumbbell scale={0.85 + i * 0.05} /></group>)}
        {Array.from({length: 6}).map((_, i) => <group key={'b' + i} position={[-0.85 + i * 0.34, 0.95, -0.12]} rotation={[0, Math.PI / 2, 0.3]}><Dumbbell scale={0.7} /></group>)}
      </group>
      {/* power rack (right) */}
      <group position={[2.7, 0, -3.1]}>
        {[[-0.6, -0.4], [0.6, -0.4], [-0.6, 0.4], [0.6, 0.4]].map(([x, z], i) => <mesh key={i} material={metal} position={[x, 1.2, z]} castShadow><boxGeometry args={[0.08, 2.4, 0.08]} /></mesh>)}
        <mesh material={metal} position={[0, 2.38, 0]}><boxGeometry args={[1.3, 0.06, 0.9]} /></mesh>
        <mesh material={chrome} position={[0, 1.35, 0.4]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.018, 0.018, 2.0, 16]} /></mesh>
        <group position={[-0.85, 1.35, 0.4]} rotation={[0, Math.PI / 2, 0]}><Plate r={0.24} /></group>
        <group position={[0.85, 1.35, 0.4]} rotation={[0, Math.PI / 2, 0]}><Plate r={0.24} /></group>
      </group>
      {/* flat bench (centre back) */}
      <group position={[0, 0, -2.6]}>
        <mesh material={pad} position={[0, 0.45, 0]} castShadow><boxGeometry args={[0.32, 0.09, 1.2]} /></mesh>
        <mesh material={metal} position={[0, 0.2, 0]}><boxGeometry args={[0.08, 0.4, 1.0]} /></mesh>
      </group>
    </>
  );
};
