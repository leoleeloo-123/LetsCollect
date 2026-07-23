type CatCoatControls = {
  color: import("three").Color;
  debugMode: { value: number };
};

export function colorizeCatCoat(
  material: import("three").Material,
  controls: CatCoatControls,
  protectMap: import("three").Texture
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.catProtectMap = { value: protectMap };
    shader.uniforms.catCoatColor = { value: controls.color };
    shader.uniforms.catDebugMode = controls.debugMode;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 vCatObjectPosition;
varying vec3 vCatObjectNormal;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vCatObjectPosition = position;
vCatObjectNormal = normal;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform sampler2D catProtectMap;
uniform vec3 catCoatColor;
uniform float catDebugMode;
varying vec3 vCatObjectPosition;
varying vec3 vCatObjectNormal;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  vec4 protectSample = texture2D(catProtectMap, vMapUv);
  float authoredMask = smoothstep(0.18, 0.62, protectSample.r);
  float earSupplementMask = smoothstep(0.18, 0.62, protectSample.g);
  float earPatchMask = smoothstep(0.18, 0.62, protectSample.b);

  vec3 catNormal = normalize(vCatObjectNormal);
  float faceDepthGate = smoothstep(0.23, 0.36, vCatObjectPosition.z);
  float faceLowerGate = smoothstep(-0.24, -0.13, vCatObjectPosition.y);
  float faceUpperGate = 1.0 - smoothstep(0.17, 0.27, vCatObjectPosition.y);
  float faceGate = faceDepthGate * faceLowerGate * faceUpperGate;

  float earHeightGate = smoothstep(0.08, 0.18, vCatObjectPosition.y);
  float earDepthGate = smoothstep(-0.03, 0.13, vCatObjectPosition.z);
  float earSideGate = smoothstep(0.10, 0.22, abs(vCatObjectPosition.x));
  float earGate = earHeightGate * earDepthGate * earSideGate;
  float earNormalGate = smoothstep(0.02, 0.34, catNormal.z);


  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float darkFaceDetail = 1.0 - smoothstep(0.40, 0.58, baseLuma);
  float pinkRedBias = smoothstep(0.10, 0.22, originalDiffuseColor.r - originalDiffuseColor.g);
  float pinkBlueBalance = 1.0 - smoothstep(0.07, 0.16, originalDiffuseColor.g - originalDiffuseColor.b);
  float pinkFaceDetail = pinkRedBias * pinkBlueBalance;
  float faceColorGate = max(darkFaceDetail, pinkFaceDetail);
  float faceFixedDetail = authoredMask * faceGate * faceColorGate;
  float earSupplementHeightGate = smoothstep(0.34, 0.40, vCatObjectPosition.y);
  float earBaseFixedDetail = authoredMask * earGate * earNormalGate;
  float earSupplementFixedDetail = earSupplementMask * earGate * earSupplementHeightGate;
  float earPatchHeightGate = smoothstep(0.32, 0.40, vCatObjectPosition.y);
  float earPatchDetail = earPatchHeightGate * earPatchMask;
  float earFixedDetail = max(max(earBaseFixedDetail, earSupplementFixedDetail), earPatchDetail);
  float fixedDetail = max(faceFixedDetail, earFixedDetail);
  float originalContrast = mix(0.54, 1.06, smoothstep(0.08, 0.94, baseLuma));
  vec3 colorizedCoat = catCoatColor * originalContrast;
  vec3 authoredEarPink = vec3(0.72, 0.46, 0.40) * originalContrast;
  vec3 protectedDiffuseColor = mix(originalDiffuseColor, authoredEarPink, earPatchDetail);
  vec3 resultColor = mix(colorizedCoat, protectedDiffuseColor, fixedDetail);
  vec3 zoneColor = mix(vec3(0.10, 0.38, 0.68), vec3(0.88, 0.10, 0.18), fixedDetail);
  sampledDiffuseColor.rgb = mix(resultColor, zoneColor, catDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-cat-protected-coat-v17";
  material.needsUpdate = true;
}
