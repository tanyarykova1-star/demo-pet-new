// src/DemogorgonScene.jsx
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { useRef, Suspense, useState } from 'react';
import { playRoarSound } from './sounds';

function Model({ mood }) {
  const group = useRef();
  const { scene } = useGLTF('/models/DemogorgonModel.glb'); 
  const [isRoaring, setIsRoaring] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation(); 
    playRoarSound();
    setIsRoaring(true);
    setTimeout(() => setIsRoaring(false), 500); // Рычим полсекунды
  };

  useFrame((state) => {
    if (!group.current) return; 
    const t = state.clock.getElapsedTime();
    
    // Логика поведения в зависимости от настроения
    if (mood === 'gameover') {
      group.current.position.x = (Math.random() - 0.5) * 0.2;
      group.current.position.y = (Math.random() - 0.5) * 0.2;
      group.current.rotation.z = Math.sin(t * 20) * 0.05;
      group.current.position.z = Math.min(2, t * 0.5); 
    } else if (mood === 'angry') {
      group.current.position.x = Math.sin(t * 30) * 0.05;
      group.current.position.y = Math.sin(t * 2) * 0.1;
      group.current.rotation.z = 0;
      group.current.position.z = 0;
    } else if (mood === 'sleepy') {
      group.current.position.x = 0;
      group.current.position.z = 0;
      group.current.rotation.z = 0.3; 
      group.current.position.y = Math.sin(t * 1) * 0.05; 
    } else {
      group.current.position.x = 0;
      group.current.position.y = Math.sin(t * 2) * 0.1;
      group.current.position.z = 0;
      group.current.rotation.z = 0;
    }

    // Если кликнули (рычим), добавляем эффект пульсации
    if (isRoaring) {
      const scale = 2 + Math.sin(t * 50) * 0.2; 
      group.current.scale.set(scale, scale, scale);
      group.current.rotation.y += Math.sin(t * 40) * 0.05;
    } else {
      group.current.scale.set(2, 2, 2); // Базовый масштаб
    }
  });

  return (
    <group 
      ref={group} 
      position={[0, -1, 0]} 
      scale={2} 
      onClick={handleClick} 
      onPointerOver={() => document.body.style.cursor = 'pointer'} 
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      <pointLight 
        intensity={isRoaring ? 8 : (mood === 'gameover' ? 5 : (mood === 'angry' ? 2 : 0.5))} 
        color={isRoaring ? "#ffaa00" : (mood === 'gameover' ? "#ff0000" : "#aa0000")} 
        distance={6} 
      />
      {/* rotation={[0, Math.PI / 2, 0]} поворачивает модель. Если смотрит боком - поменяй на Math.PI или -Math.PI / 2 */}
      <primitive object={scene} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
}

export default function DemogorgonScene({ mood }) {
  const isGameOver = mood === 'gameover';
  const isSleepy = mood === 'sleepy';

  let dirLightColor = "#ff5555";
  let spotLightColor = "#5555ff";
  let bgColor = '#111';

  if (isGameOver) {
    dirLightColor = "#ff0000"; spotLightColor = "#ff0000"; bgColor = '#300';
  } else if (isSleepy) {
    dirLightColor = "#4466aa"; spotLightColor = "#224488"; bgColor = '#0a1128';
  }

  return (
    <div className="scene-container" style={{ background: bgColor }}>
      <Canvas camera={{ position: [0, 1, 6], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={isGameOver ? 0.1 : (isSleepy ? 0.2 : 0.5)} />
          <directionalLight position={[10, 10, 5]} intensity={isGameOver ? 3 : (isSleepy ? 0.5 : 1.5)} color={dirLightColor} />
          <spotLight position={[-10, 5, 0]} intensity={isGameOver ? 5 : (isSleepy ? 1 : 2)} color={spotLightColor} />
          
          <Model mood={mood} />
          
          <Environment preset={isSleepy ? "night" : "night"} />
        </Suspense>
        
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} minDistance={0.5} maxDistance={15} />
      </Canvas>
    </div>
  );
}