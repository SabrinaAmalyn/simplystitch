import { useCallback, useEffect, useMemo } from "react";
import * as THREE from "three";
import { PAW_BOUNDARY, type PawRegion } from "@/lib/paw-colors";

/**
 * Recolour fragments of the original surface; positions and normals are untouched.
 * On a shared surface (joined feet) local x < 0 is the doll's right side and uses the right tint.
 */
export function PawVinyl({ color, pawColor, region, enabled, rightPawColor = pawColor, rightEnabled = enabled, vertexColors = false, boundary = PAW_BOUNDARY[region] }: {
  color?: string;
  pawColor: string;
  region: PawRegion;
  enabled: boolean;
  rightPawColor?: string;
  rightEnabled?: boolean;
  vertexColors?: boolean;
  boundary?: number;
}) {
  const uniforms = useMemo(() => ({
    pawTint: { value: new THREE.Color(pawColor) },
    pawTintRight: { value: new THREE.Color(rightPawColor) },
    pawBoundary: { value: boundary },
    pawEnabled: { value: enabled ? 1 : 0 },
    pawEnabledRight: { value: rightEnabled ? 1 : 0 },
  }), []);
  useEffect(() => {
    uniforms.pawTint.value.set(pawColor);
    uniforms.pawTintRight.value.set(rightPawColor);
    uniforms.pawBoundary.value = boundary;
    uniforms.pawEnabled.value = enabled ? 1 : 0;
    uniforms.pawEnabledRight.value = rightEnabled ? 1 : 0;
  }, [uniforms, pawColor, rightPawColor, boundary, enabled, rightEnabled]);
  const patch = useCallback((shader: THREE.WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float pawSurfaceY;\nvarying float pawSurfaceX;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\npawSurfaceY = position.y;\npawSurfaceX = position.x;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float pawSurfaceY;\nvarying float pawSurfaceX;\nuniform vec3 pawTint;\nuniform vec3 pawTintRight;\nuniform float pawBoundary;\nuniform float pawEnabled;\nuniform float pawEnabledRight;")
      .replace("#include <color_fragment>", `#include <color_fragment>
        float pawEdge = max(fwidth(pawSurfaceY), 0.00001);
        float pawMask = 1.0 - smoothstep(pawBoundary - pawEdge, pawBoundary + pawEdge, pawSurfaceY);
        float pawRight = pawSurfaceX < 0.0 ? 1.0 : 0.0;
        vec3 pawColour = mix(pawTint, pawTintRight, pawRight);
        float pawOn = mix(pawEnabled, pawEnabledRight, pawRight);
        diffuseColor.rgb = mix(diffuseColor.rgb, pawColour, pawMask * pawOn);
      `);
  }, [uniforms]);
  return <meshPhysicalMaterial {...(color === undefined ? {} : { color })} vertexColors={vertexColors} onBeforeCompile={patch}
    customProgramCacheKey={() => "paw-surface-v2"}
    roughness={0.55} sheen={1} sheenRoughness={0.45} sheenColor="#ffe4d2" clearcoat={0.15} clearcoatRoughness={0.6} />;
}
