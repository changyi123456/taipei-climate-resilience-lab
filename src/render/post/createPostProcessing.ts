import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import type { QualityTier } from '../app/quality';

export interface PostProcessingController {
  composer: EffectComposer;
  setQuality: (tier: QualityTier) => void;
}

/**
 * 後製管線（畫面質感提升版）：
 *   RenderPass → UnrealBloom（霓虹輝光）→ 電影感分級 → OutputPass。
 * 分級包含：暖冷分色（split-tone）、亮部柔光、平滑暗角、細微膠片噪點。
 */
export function createPostProcessing(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera
): PostProcessingController {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  // 輝光：強度略升、門檻略降，讓水面與霓虹更明亮但不過曝。
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.62, // strength
    0.85, // radius
    0.62  // threshold
  );
  composer.addPass(bloom);

  const gradePass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uContrast: { value: 1.12 },
      uSaturation: { value: 1.18 },
      uVignette: { value: 0.32 },
      uWarmShadows: { value: new THREE.Color(0x1a2238) }, // 暗部偏冷藍
      uWarmHighlights: { value: new THREE.Color(0xffe8c4) }, // 亮部偏暖
      uGrain: { value: 0.035 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      uniform float uContrast;
      uniform float uSaturation;
      uniform float uVignette;
      uniform vec3 uWarmShadows;
      uniform vec3 uWarmHighlights;
      uniform float uGrain;

      // 簡易雜訊（膠片顆粒）
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        vec3 color = texel.rgb;

        // 飽和度
        float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
        color = mix(vec3(luma), color, uSaturation);

        // 對比
        color = (color - 0.5) * uContrast + 0.5;

        // 暖冷分色：暗部染冷、亮部染暖，提升層次與電影感
        vec3 splitTone = mix(uWarmShadows, uWarmHighlights, smoothstep(0.0, 1.0, luma));
        color = mix(color, color * (0.85 + splitTone * 0.6), 0.35);

        // 平滑暗角
        float d = distance(vUv, vec2(0.5));
        float edge = smoothstep(0.2, 0.95, d);
        color *= 1.03 - edge * uVignette;

        // 膠片顆粒（靜態，依像素位置）
        float grain = (hash(vUv * 1024.0) - 0.5) * uGrain;
        color += grain;

        gl_FragColor = vec4(clamp(color, 0.0, 1.0), texel.a);
      }
    `
  });
  composer.addPass(gradePass);
  composer.addPass(new OutputPass());

  return {
    composer,
    setQuality: (tier) => {
      const enabled = tier === 'high';
      bloom.enabled = enabled;
      gradePass.enabled = enabled;
    }
  };
}
