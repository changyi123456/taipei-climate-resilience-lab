import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

export async function loadGltfScene(url: string): Promise<THREE.Group> {
  const gltf = await loader.loadAsync(url);
  const root = gltf.scene;

  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  return root;
}

