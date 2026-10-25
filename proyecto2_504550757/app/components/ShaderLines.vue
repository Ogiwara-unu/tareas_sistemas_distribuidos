<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'

const containerRef = ref<HTMLDivElement | null>(null)

let camera: THREE.Camera | null = null
let scene: THREE.Scene | null = null
let renderer: THREE.WebGLRenderer | null = null
let uniforms: { time: { value: number }; resolution: { value: THREE.Vector2 } } | null = null
let animationId: number | null = null
let onWindowResize: (() => void) | null = null

const vertexShader = `
  void main() {
    gl_Position = vec4( position, 1.0 );
  }
`

const fragmentShader = `
  #define TWO_PI 6.2831853072
  #define PI 3.14159265359

  precision highp float;
  uniform vec2 resolution;
  uniform float time;

  float random (in float x) {
      return fract(sin(x)*1e4);
  }
  float random (vec2 st) {
      return fract(sin(dot(st.xy,
                           vec2(12.9898,78.233)))*
          43758.5453123);
  }

  varying vec2 vUv;

  void main(void) {
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    vec2 fMosaicScal = vec2(4.0, 2.0);
    vec2 vScreenSize = vec2(256,256);
    uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
    uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);

    float t = time*0.06+random(uv.x)*0.4;
    float lineWidth = 0.0008;

    vec3 color = vec3(0.0);
    for(int j = 0; j < 3; j++){
      for(int i=0; i < 5; i++){
        color[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01)*1.0 - length(uv));
      }
    }

    gl_FragColor = vec4(color[2],color[1],color[0],1.0);
  }
`

onMounted(() => {
  const container = containerRef.value
  if (!container) return

  camera = new THREE.Camera()
  camera.position.z = 1

  scene = new THREE.Scene()

  const geometry = new THREE.PlaneGeometry(2, 2)

  uniforms = {
    time: { value: 1.0 },
    resolution: { value: new THREE.Vector2() },
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
  })

  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  onWindowResize = () => {
    if (!renderer || !uniforms) return
    const rect = container.getBoundingClientRect()
    renderer.setSize(rect.width, rect.height)
    uniforms.resolution.value.x = renderer.domElement.width
    uniforms.resolution.value.y = renderer.domElement.height
  }

  onWindowResize()
  window.addEventListener('resize', onWindowResize, false)

  const animate = () => {
    animationId = requestAnimationFrame(animate)
    if (uniforms) uniforms.time.value += 0.05
    if (renderer && scene && camera) renderer.render(scene, camera)
  }

  animate()
})

onUnmounted(() => {
  if (animationId !== null) cancelAnimationFrame(animationId)
  if (onWindowResize) window.removeEventListener('resize', onWindowResize)
  if (renderer) {
    renderer.dispose()
    renderer.domElement.remove()
  }
  camera = null
  scene = null
  renderer = null
  uniforms = null
})
</script>

<template>
  <div ref="containerRef" class="shader-lines" />
</template>

<style scoped>
.shader-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.shader-lines :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
