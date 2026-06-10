import * as THREE from 'three';

export function createCamera(): THREE.OrthographicCamera {
  const camera = new THREE.OrthographicCamera(-12, 12, 8, -8, 0.1, 200);
  camera.position.set(15, 16, 15);
  camera.lookAt(0, 0.4, -0.8);
  updateCameraFrustum(camera, window.innerWidth, window.innerHeight);
  return camera;
}

export function updateCameraFrustum(camera: THREE.OrthographicCamera, width: number, height: number): void {
  const aspect = width / Math.max(1, height);
  const viewHeight = width < 760 ? 23 : width < 1100 ? 21 : 17.4;
  const viewWidth = viewHeight * aspect;

  camera.left = -viewWidth / 2;
  camera.right = viewWidth / 2;
  camera.top = viewHeight / 2;
  camera.bottom = -viewHeight / 2;
  camera.updateProjectionMatrix();
}
