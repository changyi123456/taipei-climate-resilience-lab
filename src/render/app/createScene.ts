import * as THREE from 'three';

/**
 * 場景光照與大氣（畫面質感提升版）：
 *   暖色關鍵光（太陽）＋ 冷色補光 ＋ 青綠邊緣光，營造黃昏都市的層次與立體感。
 *   指數霧讓遠景柔和退入背景，強化縱深。
 */
export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x081019);
  scene.fog = new THREE.FogExp2(0x0a1d28, 0.025);

  // 半球光：天空冷藍、地面暖綠，提供基礎環境光與色彩對比。
  const hemi = new THREE.HemisphereLight(0xbfe6ff, 0x2a3320, 1.25);
  scene.add(hemi);

  // 關鍵光（太陽）：暖色、投影。
  const sun = new THREE.DirectionalLight(0xfff0c8, 3.7);
  sun.position.set(-7, 12, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -18;
  sun.shadow.camera.right = 18;
  sun.shadow.camera.top = 18;
  sun.shadow.camera.bottom = -18;
  sun.shadow.bias = -0.00015;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);

  // 冷色補光：填補陰影、增加色溫對比。
  const blueBounce = new THREE.DirectionalLight(0x6bbdff, 0.9);
  blueBounce.position.set(9, 5, -8);
  scene.add(blueBounce);

  // 青綠邊緣光：勾勒建物輪廓，呼應科幻沙盤美術。
  const skylineRim = new THREE.DirectionalLight(0x8fffd2, 1.25);
  skylineRim.position.set(4, 9, -12);
  scene.add(skylineRim);

  // 微弱暖色點光：中心舞台感，讓城市核心更聚焦。
  const coreGlow = new THREE.PointLight(0xffd9a0, 0.6, 26, 2);
  coreGlow.position.set(0, 6, -1);
  scene.add(coreGlow);

  return scene;
}
