export type BirdShaderControls = {
  body: import("three").Color;
  cap: import("three").Color;
  blush: import("three").Color;
  feet: import("three").Color;
  debugMode: { value: number };
};

export function colorizeBirdV4(
  material: import("three").Material,
  controls: BirdShaderControls,
  zoneMap: import("three").Texture
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.birdZoneMap = { value: zoneMap };
    shader.uniforms.birdBodyColor = { value: controls.body };
    shader.uniforms.birdCapColor = { value: controls.cap };
    shader.uniforms.birdBlushColor = { value: controls.blush };
    shader.uniforms.birdFeetColor = { value: controls.feet };
    shader.uniforms.birdDebugMode = controls.debugMode;

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
attribute float birdFootZone;
varying vec3 vBirdLocalPosition;
varying vec3 vBirdLocalNormal;
varying float vBirdFootZone;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vBirdLocalPosition = position;
vBirdLocalNormal = normal;
vBirdFootZone = birdFootZone;`);

    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform sampler2D birdZoneMap;
uniform vec3 birdBodyColor;
uniform vec3 birdCapColor;
uniform vec3 birdBlushColor;
uniform vec3 birdFeetColor;
uniform float birdDebugMode;
varying vec3 vBirdLocalPosition;
varying vec3 vBirdLocalNormal;
varying float vBirdFootZone;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  vec3 zones = texture2D(birdZoneMap, vMapUv).rgb;

  vec3 beakPoint = (vBirdLocalPosition - vec3(0.32, 0.28, 0.66)) / vec3(0.25, 0.23, 0.17);
  float beakShape = 1.0 - smoothstep(1.00, 1.13, dot(beakPoint, beakPoint));
  vec3 beakCleanupPoint = (vBirdLocalPosition - vec3(0.30, 0.36, 0.58)) / vec3(0.36, 0.25, 0.30);
  float beakCleanup = (1.0 - smoothstep(1.00, 1.18, dot(beakCleanupPoint, beakCleanupPoint)))
    * smoothstep(0.27, 0.36, vBirdLocalPosition.y);

  vec3 leftFootPoint = (vBirdLocalPosition - vec3(-0.13, -0.60, 0.22)) / vec3(0.28, 0.25, 0.40);
  vec3 rightFootPoint = (vBirdLocalPosition - vec3(0.29, -0.55, 0.08)) / vec3(0.32, 0.24, 0.30);
  vec3 rearFootPoint = (vBirdLocalPosition - vec3(0.30, -0.52, -0.29)) / vec3(0.36, 0.24, 0.30);
  float footShape = max(
    1.0 - smoothstep(1.00, 1.18, dot(leftFootPoint, leftFootPoint)),
    max(
      1.0 - smoothstep(1.00, 1.18, dot(rightFootPoint, rightFootPoint)),
      1.0 - smoothstep(1.00, 1.18, dot(rearFootPoint, rearFootPoint))
    )
  );
  float footSurface = max(
    1.0 - smoothstep(-0.66, -0.59, vBirdLocalPosition.y),
    smoothstep(0.18, 0.42, normalize(vBirdLocalNormal).y)
  );
  float feetDetail = smoothstep(0.35, 0.82, vBirdFootZone) * footShape * footSurface;

  vec3 leftEyePoint = (vBirdLocalPosition - vec3(-0.05, 0.36, 0.68)) / vec3(0.11, 0.13, 0.10);
  vec3 rightEyePoint = (vBirdLocalPosition - vec3(0.505, 0.36, 0.42)) / vec3(0.09, 0.13, 0.16);
  float eyeShape = max(
    1.0 - smoothstep(1.00, 1.24, dot(leftEyePoint, leftEyePoint)),
    1.0 - smoothstep(1.00, 1.24, dot(rightEyePoint, rightEyePoint))
  );
  float beakLeftEdge = mix(0.125, 0.215, smoothstep(0.30, 0.44, vBirdLocalPosition.y));
  float beakSpatial = smoothstep(beakLeftEdge, beakLeftEdge + 0.04, vBirdLocalPosition.x)
    * (1.0 - smoothstep(0.455, 0.485, vBirdLocalPosition.x))
    * smoothstep(0.575, 0.615, vBirdLocalPosition.z);
  float textureFixed = smoothstep(0.18, 0.68, zones.r) * max(eyeShape, beakShape * beakSpatial);
  float fixedDetail = max(textureFixed, feetDetail);
  float capZone = smoothstep(0.12, 0.62, zones.g) * (1.0 - fixedDetail) * (1.0 - beakCleanup) * smoothstep(0.30, 0.40, vBirdLocalPosition.y);
  float blushZone = smoothstep(0.12, 0.62, zones.b) * (1.0 - fixedDetail) * (1.0 - beakCleanup) * smoothstep(0.06, 0.12, vBirdLocalPosition.y);
  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float originalContrast = mix(0.56, 1.04, smoothstep(0.08, 0.94, baseLuma));
  originalContrast = mix(originalContrast, 0.82, beakCleanup * (1.0 - textureFixed));
  vec3 recolored = birdBodyColor * originalContrast;
  recolored = mix(recolored, birdCapColor * originalContrast, capZone);
  recolored = mix(recolored, birdBlushColor * mix(0.78, 1.02, originalContrast), blushZone);
  recolored = mix(recolored, originalDiffuseColor, textureFixed);
  recolored = mix(recolored, birdFeetColor * mix(0.68, 1.04, originalContrast), feetDetail);
  vec3 debugColor = vec3(0.78);
  debugColor = mix(debugColor, vec3(0.18, 0.82, 0.38), capZone);
  debugColor = mix(debugColor, vec3(0.25, 0.42, 1.0), blushZone);
  debugColor = mix(debugColor, vec3(1.0, 0.18, 0.22), fixedDetail);
  sampledDiffuseColor.rgb = mix(recolored, debugColor, birdDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-bird-zones-v5";
  material.needsUpdate = true;
}
