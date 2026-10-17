import { useCallback, useEffect, useMemo } from "react";
import * as THREE from "three";
import { PAW_BOUNDARY, type PawRegion } from "@/lib/paw-colors";

/** Recolour fragments of the original surface; positions and normals are untouched. */
export function PawVinyl({ color, pawColor, region, enabled, vertexColors = false }: {
  color?: string;
  pawColor: string;
  region: PawRegion;
  enabled: boolean;
  vertexColors?: boolean;
}) {
  const uniforms = useMemo(() => ({
    pawTint: { value: new THREE.Color(pawColor) },
    pawBoundary: { value: PAW_BOUNDARY[region] as number },
    pawEnabled: { value: enabled ? 1 : 0 },
  }), []);
  useEffect(() => {
    uniforms.pawTint.value.set(pawColor);
    uniforms.pawBoundary.value = PAW_BOUNDARY[region];
    uniforms.pawEnabled.value = enabled ? 1 : 0;
  }, [uniforms, pawColor, region, enabled]);
  const patch = useCallback((shader: THREE.WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float pawSurfaceY;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\npawSurfaceY = position.y;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float pawSurfaceY;\nuniform vec3 pawTint;\nuniform float pawBoundary;\nuniform float pawEnabled;")
      .replace("#include <color_fragment>", `#include <color_fragment>
        float pawEdge = max(fwidth(pawSurfaceY), 0.00001);
        float pawMask = 1.0 - smoothstep(pawBoundary - pawEdge, pawBoundary + pawEdge, pawSurfaceY);
        diffuseColor.rgb = mix(diffuseColor.rgb, pawTint, pawMask * pawEnabled);
      `);
  }, [uniforms]);
  return <meshPhysicalMaterial color={color} vertexColors={vertexColors} onBeforeCompile={patch}
    customProgramCacheKey={() => "paw-surface-v1"}
    roughness={0.55} sheen={1} sheenRoughness={0.45} sheenColor="#ffe4d2" clearcoat={0.15} clearcoatRoughness={0.6} />;
}