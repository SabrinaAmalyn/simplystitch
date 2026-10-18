import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";
import { bodyColorWeights, joinedBodyDistance, joinedBodyShape, JOINED_BODY } from "@/lib/joined-body";
import { PAW_BOUNDARY } from "@/lib/paw-colors";
import { PawVinyl } from "./PawVinyl";

/** Polygonize one smooth union, rather than overlapping separately shaded capsules. */
function buildJoinedGeometry(scale: number) {
  const resolution = 64;
  const extent = 0.8;
  const shape = joinedBodyShape(scale);
  const extension = JOINED_BODY.leg.bottom - shape.leg.bottom;
  const extentY = extent + extension / 2;
  const centerY = 0.6 - extension / 2;
  const material = new THREE.MeshBasicMaterial();
  const surface = new MarchingCubes(resolution, material, false, false, 24000);
  surface.isolation = 0;
  for (let z = 0; z < resolution; z++) {
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        surface.field[x + y * resolution + z * resolution * resolution] = -joinedBodyDistance(
          (x / resolution * 2 - 1) * extent,
          (y / resolution * 2 - 1) * extentY + centerY,
          (z / resolution * 2 - 1) * extent,
          shape,
        );
      }
    }
  }
  surface.update();
  const count = surface.geometry.drawRange.count;
  const geometry = new THREE.BufferGeometry();
  for (const name of ["position", "normal"]) {
    const attribute = surface.geometry.getAttribute(name);
    geometry.setAttribute(name, new THREE.Float32BufferAttribute(Array.from(attribute.array).slice(0, count * 3), 3));
  }
  geometry.scale(extent, extentY, extent);
  geometry.translate(0, centerY, 0);
  geometry.computeBoundingSphere();
  surface.geometry.dispose();
  material.dispose();
  return geometry;
}

export function JoinedBody({ torso, leftLeg, rightLeg, pawColor, marked, rightPawColor = pawColor, rightMarked = marked, lengthScale = 1 }: { torso: string; leftLeg: string; rightLeg: string; pawColor: string; marked: boolean; rightPawColor?: string; rightMarked?: boolean; lengthScale?: number }) {
  const geometry = useMemo(() => buildJoinedGeometry(lengthScale), [lengthScale]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    const colors = { torso: new THREE.Color(torso), leftLeg: new THREE.Color(leftLeg), rightLeg: new THREE.Color(rightLeg) };
    const position = geometry.getAttribute("position");
    const values = new Float32Array(position.count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < position.count; i++) {
      const weights = bodyColorWeights(position.getX(i), position.getY(i));
      color.setRGB(
        colors.torso.r * weights.torso + colors.leftLeg.r * weights.leftLeg + colors.rightLeg.r * weights.rightLeg,
        colors.torso.g * weights.torso + colors.leftLeg.g * weights.leftLeg + colors.rightLeg.g * weights.rightLeg,
        colors.torso.b * weights.torso + colors.leftLeg.b * weights.leftLeg + colors.rightLeg.b * weights.rightLeg,
      );
      color.toArray(values, i * 3);
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(values, 3));
  }, [geometry, torso, leftLeg, rightLeg]);
  return (
    <mesh geometry={geometry} castShadow>
      <PawVinyl vertexColors pawColor={pawColor} region="feet" enabled={marked} rightPawColor={rightPawColor} rightEnabled={rightMarked}
        boundary={PAW_BOUNDARY.feet + joinedBodyShape(lengthScale).leg.bottom - JOINED_BODY.leg.bottom} />
    </mesh>
  );
}