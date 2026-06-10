import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import type { CityState } from '../../game/simulation/types';
import { CityWorld } from '../objects/CityWorld';
import type { DataLayerId } from '../objects/CityWorld';
import { createPostProcessing } from '../post/createPostProcessing';
import { createCamera, updateCameraFrustum } from './createCamera';
import { createRenderer } from './createRenderer';
import { createScene } from './createScene';

export interface GameAppCallbacks {
  onSelectDistrict: (districtId: string) => void;
  /** 點到地格磚時觸發（P2 建造模式）。回傳 true 表示已處理，不再觸發街區選取。 */
  onPickCell?: (districtId: string, cellIndex: number) => boolean;
}

export interface GameApp {
  update: (state: CityState) => void;
  playYearTransition: (state: CityState) => void;
  setDataLayer: (layer: DataLayerId) => void;
  start: () => void;
  dispose: () => void;
}

export function createGameApp(
  canvas: HTMLCanvasElement,
  initialState: CityState,
  callbacks: GameAppCallbacks
): GameApp {
  const renderer = createRenderer(canvas);
  const scene = createScene();
  const camera = createCamera();
  const composer = createPostProcessing(renderer, scene, camera);
  const controls = createControls(camera, canvas);
  const cityWorld = new CityWorld(scene, initialState);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const clock = new THREE.Clock();

  let frameId = 0;
  let disposed = false;
  let paused = document.hidden;
  // 限制到 ~40fps：教學沙盤不需要 60fps，可大幅降低 GPU 持續負載（bloom 為填充率瓶頸）。
  const minFrameMs = 1000 / 40;
  let lastFrameMs = 0;

  const resize = () => resizeRenderer(renderer, composer, camera);
  window.addEventListener('resize', resize);

  // 分頁隱藏時暫停渲染，避免背景持續吃 GPU。
  const onVisibility = () => {
    paused = document.hidden;
  };
  document.addEventListener('visibilitychange', onVisibility);

  const onPointerDown = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects(cityWorld.pickables, true);
    const hit = intersections[0]?.object ?? null;

    // 建造模式優先：點到地格磚先交給建造處理
    const cellTarget = cityWorld.findCellTarget(hit);
    if (cellTarget && callbacks.onPickCell?.(cellTarget.districtId, cellTarget.cellIndex)) {
      return;
    }

    const districtId = cityWorld.findDistrictId(hit);
    if (districtId) callbacks.onSelectDistrict(districtId);
  };
  canvas.addEventListener('pointerdown', onPointerDown);

  const render = (nowMs = 0) => {
    if (disposed) return;
    frameId = window.requestAnimationFrame(render);

    // 分頁隱藏時不渲染，但仍保留 controls 阻尼狀態。
    if (paused) return;
    // FPS 節流：未達最小間隔就跳過這一幀的繪製。
    if (nowMs - lastFrameMs < minFrameMs) return;
    lastFrameMs = nowMs;

    const elapsed = clock.getElapsedTime();
    cityWorld.tick(elapsed);
    controls.update();
    composer.render();
  };

  return {
    update: (state) => cityWorld.updateFromState(state),
    playYearTransition: (state) => cityWorld.playYearTransition(state),
    setDataLayer: (layer) => cityWorld.setDataLayer(layer),
    start: () => {
      resize();
      render();
    },
    dispose: () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointerdown', onPointerDown);
      controls.dispose();
      renderer.dispose();
    }
  };
}

function createControls(camera: THREE.OrthographicCamera, canvas: HTMLCanvasElement): OrbitControls {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minZoom = 0.62;
  controls.maxZoom = 1.65;
  controls.minPolarAngle = Math.PI * 0.22;
  controls.maxPolarAngle = Math.PI * 0.38;
  controls.enableRotate = true;
  controls.enablePan = true;
  controls.target.set(0, 0.4, -1);
  return controls;
}

function resizeRenderer(
  renderer: THREE.WebGLRenderer,
  composer: EffectComposer,
  camera: THREE.OrthographicCamera
): void {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // bloom 與全螢幕後製為填充率瓶頸；上限 1.5 在高 DPI 螢幕上明顯省 GPU 又幾乎看不出畫質差。
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(width, height, false);
  composer.setSize(width, height);
  updateCameraFrustum(camera, width, height);
}
