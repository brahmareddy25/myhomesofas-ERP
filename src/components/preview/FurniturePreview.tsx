"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, RoundedBox } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from 'three';
import gsap from "gsap";

interface PreviewProps {
  productType: string;
  length: number;  
  width: number;   
  height: number;  
  colorCode: string;
  seatWidth?: number;
  seatHeight?: number;
  armrestWidth?: number;
  chaisePlacement?: string;
  leftSideLength?: number;
  leftSideType?: string;
  rightSideLength?: number;
  rightSideType?: string;
  calculatedSeats?: number;
  unit?: "cm" | "in";
  handleType?: string;
  legType?: string;
  legHeight?: number;
}

export default function FurniturePreview({ 
  productType, 
  length = 220, 
  width = 90, 
  height = 85, 
  colorCode = "#1e3a8a",
  seatWidth = 60,
  seatHeight = 45,
  armrestWidth = 20,
  chaisePlacement = "Left Side",
  leftSideLength = 150,
  leftSideType = "Bed Type",
  rightSideLength = 150,
  rightSideType = "Seat Type",
  calculatedSeats = 3,
  unit = "cm",
  handleType = "Standard Block",
  legType = "Hidden Base",
  legHeight = 10
}: PreviewProps) {
  
  const scale = unit === "in" ? 0.0254 : 0.01;
  const L = length * scale;
  const W = width * scale; // Main body depth
  const H = height * scale;
  const SW = seatWidth * scale;
  const SH = seatHeight * scale;
  const AW = armrestWidth * scale;
  
  const baseHeight = SH * 0.4; 
  const cushionHeight = SH * 0.6; 
  const backrestThickness = unit === "in" ? 6 * scale : 15 * scale; // 6 inches or 15 cm
  const seatDepth = W - backrestThickness;

  const isBed = productType.toLowerCase().includes("bed");
  const isLShape = productType.toLowerCase().includes("l shape");
  const isUShape = productType.toLowerCase().includes("u shape");
  const isRecliner = productType.toLowerCase().includes("recliner");
  const isTable = productType.toLowerCase().includes("table");
  const isChair = productType.toLowerCase().includes("chair");

  // Premium Physical Materials
  const fabricMaterial = new THREE.MeshPhysicalMaterial({ 
    color: colorCode,
    roughness: 0.9,
    metalness: 0.05,
    clearcoat: 0.1,
    clearcoatRoughness: 0.8,
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.9,
    thickness: 0.05,
    clearcoat: 1.0,
  });

  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d2314,
    roughness: 0.6,
    metalness: 0.1
  });

  const mattressMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9
  });

  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.9,
    roughness: 0.1
  });

  // GSAP Animation Ref
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      gsap.fromTo(groupRef.current.position, 
        { y: -H/2 + 2 }, 
        { y: -H/2, duration: 1.5, ease: "bounce.out" }
      );
      gsap.fromTo(groupRef.current.rotation,
        { y: -Math.PI / 4 },
        { y: 0, duration: 2, ease: "power3.out" }
      );
    }
  }, [productType]);

  // Structural Topology Definition
  const hasLeftExt = isUShape || (isLShape && chaisePlacement === "Left Side");
  const hasRightExt = isUShape || (isLShape && chaisePlacement === "Right Side");

  // Extension Length represents how far it PROTRUDES from the front of the main sofa.
  // The full architectural length includes the main sofa depth.
  const leftExtLen = (leftSideLength * scale) + W;
  const rightExtLen = (rightSideLength * scale) + W;

  // Determine Handle/Armrest Physics
  const isTrackArm = handleType.includes("Track Arm");
  const isRounded = handleType.includes("Rounded");
  const armRadius = isTrackArm ? 0.01 : isRounded ? AW/2 : 0.08;

  // Determine Leg Physics
  const showLegs = !legType.includes("Hidden");
  const legH = legHeight * scale;
  const legY = legH / 2;
  const legMaterial = legType.includes("Metal") ? metalMaterial : woodMaterial;

  const renderLeg = (x: number, z: number) => {
    if (!showLegs) return null;
    return (
      <cylinderGeometry args={[0.02, 0.015, legH, 16]} />
    );
  };

  // Render the New Unified Sectional Engine
  const renderSectionalEngine = () => {
    const components = [];
    
    // 1. MAIN BACKREST
    // It spans the space between the side backrests (or side armrests).
    const mainBackrestLeftX = hasLeftExt ? -L/2 + AW : -L/2;
    const mainBackrestRightX = hasRightExt ? L/2 - AW : L/2;
    const mainBackrestWidth = mainBackrestRightX - mainBackrestLeftX;
    const mainBackrestCenterX = mainBackrestLeftX + mainBackrestWidth / 2;
    
    components.push(
      <RoundedBox key="main-backrest" args={[mainBackrestWidth, H, backrestThickness]} radius={armRadius} smoothness={4} castShadow receiveShadow position={[mainBackrestCenterX, H/2 + (showLegs ? legH : 0), -W/2 + backrestThickness/2]} material={fabricMaterial} />
    );

    // 2. LEFT SIDE
    if (hasLeftExt) {
      const isSeatType = leftSideType === "Seat Type";
      const totalDepth = leftExtLen; 
      const backrestDepth = isSeatType ? totalDepth : W; // Bed Type only has backrest for the corner part
      
      // Left Side Backrest
      components.push(
        <RoundedBox key="left-backrest" args={[AW, H, backrestDepth]} radius={armRadius} smoothness={4} castShadow receiveShadow position={[-L/2 + AW/2, H/2 + (showLegs ? legH : 0), -W/2 + backrestDepth/2]} material={fabricMaterial} />
      );

      // Left Corner Base & Cushion
      const cornerX = -L/2 + AW + SW/2;
      const cornerZ = -W/2 + backrestThickness + seatDepth/2;
      components.push(
        <RoundedBox key="left-corner-base" args={[SW, baseHeight, seatDepth]} radius={0.02} smoothness={4} castShadow receiveShadow position={[cornerX, baseHeight/2 + (showLegs ? legH : 0), cornerZ]} material={fabricMaterial} />,
        <RoundedBox key="left-corner-cushion" args={[SW - 0.02, cushionHeight, seatDepth - 0.02]} radius={0.05} smoothness={4} castShadow receiveShadow position={[cornerX, baseHeight + cushionHeight/2 + (showLegs ? legH : 0), cornerZ]} material={fabricMaterial} />
      );

      // Left Extension Protrusion
      const protrudeDepth = totalDepth - W;
      const protrudeZ = W/2 + protrudeDepth/2;
      
      if (isSeatType) {
        components.push(
          <RoundedBox key="left-ext-base" args={[SW, baseHeight, protrudeDepth]} radius={0.02} smoothness={4} castShadow receiveShadow position={[cornerX, baseHeight/2 + (showLegs ? legH : 0), protrudeZ]} material={fabricMaterial} />
        );
        
        // Front Armrest
        components.push(
          <RoundedBox key="left-front-armrest" args={[SW + AW, H * 0.75, AW]} radius={armRadius} smoothness={4} castShadow receiveShadow position={[-L/2 + (SW + AW)/2, (H * 0.75)/2 + (showLegs ? legH : 0), -W/2 + totalDepth - AW/2]} material={fabricMaterial} />
        );

        // Extension Cushions
        const innerExtDepth = protrudeDepth - AW;
        const numSeats = Math.max(1, Math.round(innerExtDepth / SW));
        const depthPerSeat = innerExtDepth / numSeats;
        
        for (let i = 0; i < numSeats; i++) {
          const cZ = W/2 + depthPerSeat/2 + (i * depthPerSeat);
          components.push(
            <RoundedBox key={`left-ext-cushion-${i}`} args={[SW - 0.02, cushionHeight, depthPerSeat - 0.02]} radius={0.05} smoothness={4} castShadow receiveShadow position={[cornerX, baseHeight + cushionHeight/2 + (showLegs ? legH : 0), cZ]} material={fabricMaterial} />
          );
        }
      } else {
        // Bed Type Protrusion (Standard Chaise Width)
        const bedW = SW;
        const bedX = -L/2 + AW + bedW/2;
        components.push(
          <RoundedBox key="left-bed-base" args={[bedW, baseHeight, protrudeDepth]} radius={0.02} smoothness={4} castShadow receiveShadow position={[bedX, baseHeight/2 + (showLegs ? legH : 0), protrudeZ]} material={fabricMaterial} />,
          <RoundedBox key="left-bed-mattress" args={[bedW - 0.02, cushionHeight, protrudeDepth]} radius={0.05} smoothness={4} castShadow receiveShadow position={[bedX, baseHeight + cushionHeight/2 + (showLegs ? legH : 0), protrudeZ]} material={mattressMaterial} />
        );
      }
    } else {
      // Standard Left Armrest
      components.push(
        <RoundedBox key="left-armrest" args={[AW, H * 0.75, seatDepth + 0.05]} radius={armRadius} smoothness={4} castShadow receiveShadow position={[-L/2 + AW/2, (H * 0.75)/2 + (showLegs ? legH : 0), backrestThickness/2 + 0.025]} material={fabricMaterial} />
      );
    }

    // 3. RIGHT SIDE
    if (hasRightExt) {
      const isSeatType = rightSideType === "Seat Type";
      const totalDepth = rightExtLen; 
      const backrestDepth = isSeatType ? totalDepth : W; 
      
      // Right Side Backrest
      components.push(
        <RoundedBox key="right-backrest" args={[AW, H, backrestDepth]} radius={armRadius} smoothness={4} castShadow receiveShadow position={[L/2 - AW/2, H/2 + (showLegs ? legH : 0), -W/2 + backrestDepth/2]} material={fabricMaterial} />
      );

      // Right Corner Base & Cushion
      const cornerX = L/2 - AW - SW/2;
      const cornerZ = -W/2 + backrestThickness + seatDepth/2;
      components.push(
        <RoundedBox key="right-corner-base" args={[SW, baseHeight, seatDepth]} radius={0.02} smoothness={4} castShadow receiveShadow position={[cornerX, baseHeight/2 + (showLegs ? legH : 0), cornerZ]} material={fabricMaterial} />,
        <RoundedBox key="right-corner-cushion" args={[SW - 0.02, cushionHeight, seatDepth - 0.02]} radius={0.05} smoothness={4} castShadow receiveShadow position={[cornerX, baseHeight + cushionHeight/2 + (showLegs ? legH : 0), cornerZ]} material={fabricMaterial} />
      );

      // Right Extension Protrusion
      const protrudeDepth = totalDepth - W;
      const protrudeZ = W/2 + protrudeDepth/2;
      
      if (isSeatType) {
        components.push(
          <RoundedBox key="right-ext-base" args={[SW, baseHeight, protrudeDepth]} radius={0.02} smoothness={4} castShadow receiveShadow position={[cornerX, baseHeight/2 + (showLegs ? legH : 0), protrudeZ]} material={fabricMaterial} />
        );
        
        // Front Armrest
        components.push(
          <RoundedBox key="right-front-armrest" args={[SW + AW, H * 0.75, AW]} radius={armRadius} smoothness={4} castShadow receiveShadow position={[L/2 - (SW + AW)/2, (H * 0.75)/2 + (showLegs ? legH : 0), -W/2 + totalDepth - AW/2]} material={fabricMaterial} />
        );

        // Extension Cushions
        const innerExtDepth = protrudeDepth - AW;
        const numSeats = Math.max(1, Math.round(innerExtDepth / SW));
        const depthPerSeat = innerExtDepth / numSeats;
        
        for (let i = 0; i < numSeats; i++) {
          const cZ = W/2 + depthPerSeat/2 + (i * depthPerSeat);
          components.push(
            <RoundedBox key={`right-ext-cushion-${i}`} args={[SW - 0.02, cushionHeight, depthPerSeat - 0.02]} radius={0.05} smoothness={4} castShadow receiveShadow position={[cornerX, baseHeight + cushionHeight/2 + (showLegs ? legH : 0), cZ]} material={fabricMaterial} />
          );
        }
      } else {
        // Bed Type Protrusion (Standard Chaise Width)
        const bedW = SW;
        const bedX = L/2 - AW - bedW/2;
        components.push(
          <RoundedBox key="right-bed-base" args={[bedW, baseHeight, protrudeDepth]} radius={0.02} smoothness={4} castShadow receiveShadow position={[bedX, baseHeight/2 + (showLegs ? legH : 0), protrudeZ]} material={fabricMaterial} />,
          <RoundedBox key="right-bed-mattress" args={[bedW - 0.02, cushionHeight, protrudeDepth]} radius={0.05} smoothness={4} castShadow receiveShadow position={[bedX, baseHeight + cushionHeight/2 + (showLegs ? legH : 0), protrudeZ]} material={mattressMaterial} />
        );
      }
    } else {
      // Standard Right Armrest
      components.push(
        <RoundedBox key="right-armrest" args={[AW, H * 0.75, seatDepth + 0.05]} radius={armRadius} smoothness={4} castShadow receiveShadow position={[L/2 - AW/2, (H * 0.75)/2 + (showLegs ? legH : 0), backrestThickness/2 + 0.025]} material={fabricMaterial} />
      );
    }

    // 4. MAIN BODY SEATS (Between the corners/armrests)
    const mainBodyLeftX = hasLeftExt ? -L/2 + AW + SW : -L/2 + AW;
    const mainBodyRightX = hasRightExt ? L/2 - AW - SW : L/2 - AW;
    const mainBodyWidth = mainBodyRightX - mainBodyLeftX;
    
    if (mainBodyWidth > 0) {
      const mainBodyCenterX = mainBodyLeftX + mainBodyWidth / 2;
      const mainBodyZ = -W/2 + backrestThickness + seatDepth/2;

      // Base
      components.push(
        <RoundedBox key="main-body-base" args={[mainBodyWidth, baseHeight, seatDepth]} radius={0.02} smoothness={4} castShadow receiveShadow position={[mainBodyCenterX, baseHeight/2 + (showLegs ? legH : 0), mainBodyZ]} material={fabricMaterial} />
      );

      // Cushions
      const numMainSeats = Math.max(1, Math.round(mainBodyWidth / SW));
      const widthPerSeat = mainBodyWidth / numMainSeats;
      
      for (let i = 0; i < numMainSeats; i++) {
        const cX = mainBodyLeftX + widthPerSeat/2 + (i * widthPerSeat);
        components.push(
          <RoundedBox key={`main-cushion-${i}`} args={[widthPerSeat - 0.02, cushionHeight, seatDepth - 0.02]} radius={0.05} smoothness={4} castShadow receiveShadow position={[cX, baseHeight + cushionHeight/2 + (showLegs ? legH : 0), mainBodyZ]} material={fabricMaterial} />
        );
      }

      // Recliner Footrests
      if (isRecliner) {
        components.push(
          <group key="recliner-footrests" position={[0, baseHeight/2 + (showLegs ? legH : 0), mainBodyZ + seatDepth/2 + 0.2]}>
            <RoundedBox args={[widthPerSeat - 0.05, 0.1, 0.4]} radius={0.02} smoothness={4} castShadow receiveShadow position={[mainBodyLeftX + widthPerSeat/2, 0, 0]} material={fabricMaterial} />
            <RoundedBox args={[widthPerSeat - 0.05, 0.1, 0.4]} radius={0.02} smoothness={4} castShadow receiveShadow position={[mainBodyRightX - widthPerSeat/2, 0, 0]} material={fabricMaterial} />
          </group>
        );
      }
    }

    // LEGS RENDERER (Render at 4 corners of main bounds + extensions if applicable)
    if (showLegs) {
      const legRadius = legType.includes("Metal") ? 0.015 : 0.04;
      components.push(
        <mesh key="leg-bl" position={[-L/2 + 0.05, legY, -W/2 + 0.05]} castShadow receiveShadow>
          <cylinderGeometry args={[legRadius, legRadius * 0.7, legH, 16]} />
          <primitive object={legMaterial} attach="material" />
        </mesh>,
        <mesh key="leg-br" position={[L/2 - 0.05, legY, -W/2 + 0.05]} castShadow receiveShadow>
          <cylinderGeometry args={[legRadius, legRadius * 0.7, legH, 16]} />
          <primitive object={legMaterial} attach="material" />
        </mesh>
      );
      // Front left leg (depends on extension)
      const flZ = hasLeftExt ? -W/2 + leftExtLen - 0.05 : W/2 - 0.05;
      components.push(
        <mesh key="leg-fl" position={[-L/2 + 0.05, legY, flZ]} castShadow receiveShadow>
          <cylinderGeometry args={[legRadius, legRadius * 0.7, legH, 16]} />
          <primitive object={legMaterial} attach="material" />
        </mesh>
      );
      // Front right leg (depends on extension)
      const frZ = hasRightExt ? -W/2 + rightExtLen - 0.05 : W/2 - 0.05;
      components.push(
        <mesh key="leg-fr" position={[L/2 - 0.05, legY, frZ]} castShadow receiveShadow>
          <cylinderGeometry args={[legRadius, legRadius * 0.7, legH, 16]} />
          <primitive object={legMaterial} attach="material" />
        </mesh>
      );
    }

    return components;
  };

  const CaptureHelper = () => {
    const { gl, scene, camera } = useThree();
    useEffect(() => {
      (window as any).capture3DViews = async () => {
        const origPos = camera.position.clone();
        const origRot = camera.rotation.clone();
        
        // 1. Current View (Isometric)
        gl.render(scene, camera);
        const isometric = gl.domElement.toDataURL('image/jpeg', 0.8);
        
        // 2. Top View
        camera.position.set(0, 5, 0);
        camera.lookAt(0,0,0);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        gl.render(scene, camera);
        const top = gl.domElement.toDataURL('image/jpeg', 0.8);

        // 3. Front View
        camera.position.set(0, 0.5, 4);
        camera.lookAt(0,0,0);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        gl.render(scene, camera);
        const front = gl.domElement.toDataURL('image/jpeg', 0.8);

        // Restore
        camera.position.copy(origPos);
        camera.rotation.copy(origRot);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        gl.render(scene, camera);

        return { isometric, top, front };
      };
      return () => { delete (window as any).capture3DViews; };
    }, [gl, scene, camera]);
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px', position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)', backgroundColor: '#050505' }}>
      
      <div style={{ position: 'absolute', top: '1.5rem', left: '2rem', zIndex: 10 }}>
        <h4 style={{ color: 'var(--color-gold-primary)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          3D Visualizer {isChair && "(2D Locked)"}
        </h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Premium Factory Engineering</p>
      </div>

      <Canvas shadows camera={{ position: [4, 3, 5], fov: 45 }} gl={{ preserveDrawingBuffer: true }} style={{ position: 'relative', zIndex: 1 }}>
        <CaptureHelper />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow shadow-mapSize={1024} shadow-bias={-0.0001} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <Environment preset="city" />

        <Suspense fallback={null}>
          <group ref={groupRef} position={[0, -H/2, 0]}>
            
            {/* Elegant Display Pedestal */}
            <mesh receiveShadow position={[0, -0.05, 0]}>
              <cylinderGeometry args={[4.5, 4.6, 0.1, 64]} />
              <meshStandardMaterial color="#111115" metalness={0.8} roughness={0.2} />
            </mesh>

            {isTable ? (
              // TEA TABLE GEOMETRY
              <group position={[0, 0.05, 0]}>
                <RoundedBox args={[L, 0.05, W]} radius={0.01} smoothness={4} castShadow receiveShadow position={[0, H, 0]} material={glassMaterial} />
                <RoundedBox args={[0.1, H, 0.1]} radius={0.02} castShadow position={[-L/2 + 0.1, H/2, -W/2 + 0.1]} material={woodMaterial} />
                <RoundedBox args={[0.1, H, 0.1]} radius={0.02} castShadow position={[L/2 - 0.1, H/2, -W/2 + 0.1]} material={woodMaterial} />
                <RoundedBox args={[0.1, H, 0.1]} radius={0.02} castShadow position={[-L/2 + 0.1, H/2, W/2 - 0.1]} material={woodMaterial} />
                <RoundedBox args={[0.1, H, 0.1]} radius={0.02} castShadow position={[L/2 - 0.1, H/2, W/2 - 0.1]} material={woodMaterial} />
              </group>
            ) : isBed ? (
              // BED GEOMETRY
              <group position={[0, 0.05, 0]}>
                <RoundedBox args={[L, baseHeight, W]} radius={0.02} smoothness={4} castShadow receiveShadow position={[0, baseHeight/2, 0]} material={fabricMaterial} />
                <RoundedBox args={[L - 0.1, cushionHeight, W - 0.1]} radius={0.05} smoothness={4} castShadow receiveShadow position={[0, baseHeight + cushionHeight/2, 0]} material={mattressMaterial} />
                <RoundedBox args={[L, H, backrestThickness]} radius={0.05} smoothness={4} castShadow receiveShadow position={[0, H/2, -W/2 + backrestThickness/2]} material={fabricMaterial} />
              </group>
            ) : (
              // SOFA / SECTIONAL GEOMETRY (NEW UNIFIED ENGINE)
              <group position={[0, 0.05, 0]}>
                {renderSectionalEngine()}
              </group>
            )}

            <ContactShadows position={[0, 0, 0]} opacity={0.8} scale={12} blur={3} far={5} color="#000000" />
          </group>
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          minPolarAngle={isChair ? Math.PI / 2 : 0} 
          maxPolarAngle={isChair ? Math.PI / 2 : Math.PI / 2 - 0.05}
          minAzimuthAngle={isChair ? Math.PI / 2 : -Infinity}
          maxAzimuthAngle={isChair ? Math.PI / 2 : Infinity}
          minDistance={3}
          maxDistance={12}
          autoRotate={!isChair}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* Dimension Overlays */}
      <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', zIndex: 10 }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', letterSpacing: '1px', display: 'block' }}>OVERALL LENGTH</span>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{length} {unit}</span>
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', letterSpacing: '1px', display: 'block' }}>MAIN DEPTH</span>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{width} {unit}</span>
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', letterSpacing: '1px', display: 'block' }}>OVERALL HEIGHT</span>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{height} {unit}</span>
        </div>
      </div>
    </div>
  );
}
