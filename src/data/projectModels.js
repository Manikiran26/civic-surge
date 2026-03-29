function box(role, position, size, extra = {}) {
  return { shape: "box", role, position, size, ...extra };
}

function cylinder(role, position, radiusTop, radiusBottom, height, extra = {}) {
  return { shape: "cylinder", role, position, radiusTop, radiusBottom, height, ...extra };
}

function cone(role, position, radius, height, extra = {}) {
  return { shape: "cone", role, position, radius, height, ...extra };
}

function torus(role, position, radius, tube, extra = {}) {
  return { shape: "torus", role, position, radius, tube, ...extra };
}

function windowBand(position, size, extra = {}) {
  return box("glass", position, size, extra);
}

function tree(position, scale = 1) {
  const [x = 0, y = -0.82, z = 0] = position;
  return [
    cylinder("frame", [x, y + 0.2 * scale, z], 0.05 * scale, 0.06 * scale, 0.4 * scale, {
      radialSegments: 10,
    }),
    cone("landscape", [x, y + 0.62 * scale, z], 0.24 * scale, 0.56 * scale, {
      radialSegments: 12,
    }),
  ];
}

function repeatColumns(count, spacing, zOffset, height, role = "dark") {
  return Array.from({ length: count }, (_, index) => {
    const x = (index - (count - 1) / 2) * spacing;
    return cylinder(role, [x, height / 2 - 0.9, zOffset], 0.12, 0.16, height, { radialSegments: 12 });
  });
}

function containerYard(origin, rows, cols, options = {}) {
  const [originX = 0, originY = -0.66, originZ = 0] = origin;
  const gapX = options.gapX ?? 0.48;
  const gapZ = options.gapZ ?? 0.32;
  const roles = options.roles ?? ["secondary", "warning", "danger", "accent", "neutral"];
  const elements = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = originX + (col - (cols - 1) / 2) * gapX;
      const z = originZ + (row - (rows - 1) / 2) * gapZ;
      const stackCount = 1 + ((row * 3 + col * 5 + options.seedOffset) % (options.maxLayers ?? 3));

      for (let layer = 0; layer < stackCount; layer += 1) {
        const role = roles[(row + col + layer) % roles.length];
        elements.push(box(role, [x, originY + layer * 0.18, z], [0.36, 0.16, 0.22]));
      }
    }
  }

  return elements;
}

function gantryCrane(position, options = {}) {
  const [x = 0, y = -0.1, z = 0] = position;
  const height = options.height ?? 1.78;
  const span = options.span ?? 1.58;
  const boomLength = options.boomLength ?? 1.86;
  const role = options.role ?? "accent";
  const beamRole = options.beamRole ?? "frame";

  return [
    box(role, [x - span * 0.32, y + height * 0.48, z - 0.14], [0.12, height, 0.12]),
    box(role, [x + span * 0.32, y + height * 0.48, z - 0.14], [0.12, height, 0.12]),
    box(role, [x, y + height * 0.98, z - 0.14], [span, 0.12, 0.12]),
    box(beamRole, [x + boomLength * 0.18, y + height * 0.78, z + 0.18], [boomLength, 0.08, 0.12], {
      rotation: [0, 0, -0.46],
    }),
    box(beamRole, [x + 0.14, y + height * 0.58, z - 0.14], [0.1, 0.74, 0.1]),
    box("warning", [x + 0.12, y + height * 0.34, z - 0.14], [0.28, 0.1, 0.18]),
    box(beamRole, [x - 0.28, y + height * 0.62, z - 0.14], [0.7, 0.05, 0.08], {
      rotation: [0, 0, 0.72],
    }),
    box(beamRole, [x + 0.28, y + height * 0.62, z - 0.14], [0.7, 0.05, 0.08], {
      rotation: [0, 0, -0.72],
    }),
  ];
}

function containerShip(position, options = {}) {
  const [x = 0, y = -0.78, z = 0] = position;
  const length = options.length ?? 2.45;
  const width = options.width ?? 0.92;
  const hullRole = options.hullRole ?? "danger";
  const deckRoles = options.deckRoles ?? ["warning", "secondary", "accent", "neutral"];

  const elements = [
    box(hullRole, [x, y, z], [length, 0.34, width]),
    box("dark", [x, y + 0.2, z], [length * 0.9, 0.06, width * 0.88]),
    box("neutral", [x - length * 0.25, y + 0.38, z], [0.46, 0.34, 0.5]),
    box("glass", [x - length * 0.25, y + 0.46, z + 0.16], [0.24, 0.12, 0.1]),
    box("glass", [x - length * 0.25, y + 0.46, z - 0.16], [0.24, 0.12, 0.1]),
    cone(hullRole, [x + length * 0.55, y - 0.01, z], width * 0.34, 0.42, {
      rotation: [0, 0, -Math.PI / 2],
      radialSegments: 4,
    }),
  ];

  deckRoles.forEach((role, index) => {
    const offsetX = x - 0.2 + index * 0.28;
    elements.push(box(role, [offsetX, y + 0.34, z + 0.16], [0.22, 0.14, 0.18]));
    if (index % 2 === 0) {
      elements.push(box(deckRoles[(index + 1) % deckRoles.length], [offsetX, y + 0.5, z - 0.16], [0.22, 0.14, 0.18]));
    }
  });

  return elements;
}

function vehicle(position, options = {}) {
  const [x = 0, y = -0.82, z = 0] = position;
  const length = options.length ?? 0.58;
  const width = options.width ?? 0.24;
  const height = options.height ?? 0.16;
  const role = options.role ?? "accent";
  const roofRole = options.roofRole ?? "glass";
  const rotation = options.rotation ?? [0, 0, 0];

  return [
    box(role, [x, y + height * 0.5, z], [length, height, width], { rotation }),
    box(roofRole, [x, y + height * 0.96, z], [length * 0.66, height * 0.52, width * 0.82], { rotation }),
  ];
}

function streetLight(position, scale = 1) {
  const [x = 0, y = -0.82, z = 0] = position;
  return [
    cylinder("frame", [x, y + 0.42 * scale, z], 0.03 * scale, 0.04 * scale, 0.84 * scale, {
      radialSegments: 10,
    }),
    box("frame", [x + 0.14 * scale, y + 0.8 * scale, z], [0.28 * scale, 0.03 * scale, 0.03 * scale]),
    box("warning", [x + 0.27 * scale, y + 0.76 * scale, z], [0.08 * scale, 0.08 * scale, 0.08 * scale]),
  ];
}

function signalGantry(position, span = 2.8, height = 1.18) {
  const [x = 0, y = -0.82, z = 0] = position;
  return [
    cylinder("frame", [x - span * 0.48, y + height * 0.5, z], 0.04, 0.05, height, { radialSegments: 10 }),
    cylinder("frame", [x + span * 0.48, y + height * 0.5, z], 0.04, 0.05, height, { radialSegments: 10 }),
    box("frame", [x, y + height, z], [span, 0.06, 0.08]),
    box("warning", [x - span * 0.18, y + height * 0.84, z], [0.14, 0.14, 0.1]),
    box("warning", [x, y + height * 0.84, z], [0.14, 0.14, 0.1]),
    box("warning", [x + span * 0.18, y + height * 0.84, z], [0.14, 0.14, 0.1]),
  ];
}

function aircraft(position, options = {}) {
  const [x = 0, y = -0.62, z = 0] = position;
  const scale = options.scale ?? 1;
  const bodyRole = options.bodyRole ?? "neutral";
  const wingRole = options.wingRole ?? "secondary";
  const accentRole = options.accentRole ?? "accent";

  return [
    box(bodyRole, [x, y + 0.2 * scale, z], [1.02 * scale, 0.18 * scale, 0.18 * scale]),
    box(wingRole, [x, y + 0.16 * scale, z], [0.34 * scale, 0.04 * scale, 1.1 * scale]),
    box(wingRole, [x - 0.3 * scale, y + 0.24 * scale, z], [0.3 * scale, 0.04 * scale, 0.52 * scale]),
    box(accentRole, [x + 0.42 * scale, y + 0.24 * scale, z], [0.18 * scale, 0.14 * scale, 0.14 * scale]),
    cone(bodyRole, [x + 0.62 * scale, y + 0.2 * scale, z], 0.1 * scale, 0.18 * scale, {
      rotation: [0, 0, -Math.PI / 2],
      radialSegments: 10,
    }),
  ];
}

function trainSet(position, carCount, options = {}) {
  const [x = 0, y = 0, z = 0] = position;
  const carLength = options.carLength ?? 0.78;
  const carGap = options.carGap ?? 0.1;
  const width = options.width ?? 0.74;
  const height = options.height ?? 0.36;
  const rotation = options.rotation ?? [0, 0, 0];
  const roles = options.roles ?? ["accent", "secondary"];
  const elements = [];
  const totalLength = carCount * carLength + Math.max(0, carCount - 1) * carGap;
  const start = x - totalLength / 2 + carLength / 2;

  for (let index = 0; index < carCount; index += 1) {
    const role = roles[index % roles.length];
    const carX = start + index * (carLength + carGap);
    elements.push(box(role, [carX, y, z], [carLength, height, width], { rotation }));
    elements.push(box("glass", [carX, y + height * 0.18, z + width * 0.22], [carLength * 0.72, height * 0.22, 0.08], { rotation }));
    elements.push(box("glass", [carX, y + height * 0.18, z - width * 0.22], [carLength * 0.72, height * 0.22, 0.08], { rotation }));
  }

  return elements;
}

function modelBase(meta, elements, extra = {}) {
  return {
    title: meta.title,
    family: meta.family,
    summary: meta.summary,
    scale: extra.scale ?? 1,
    turnRate: extra.turnRate ?? 0.006,
    floorRadius: extra.floorRadius ?? 4.2,
    elements,
  };
}

function metroModel(meta, options = {}) {
  const viaductLength = options.viaductLength ?? 5.6;
  const stationWidth = options.stationWidth ?? 2.1;
  const stationHeight = options.stationHeight ?? 1.2;
  const trainCars = options.trainCars ?? 3;
  const supportCount = options.supportCount ?? 3;
  const undergroundTube = options.undergroundTube ?? false;
  const trainOffset = options.trainOffset ?? 0.55;
  const stationY = options.stationY ?? 0.55;
  const elements = [
    box("dark", [0, -0.92, 0], [6.2, 0.18, 6.2]),
    box("neutral", [0, stationY, 0], [viaductLength, 0.26, stationWidth]),
    box("glass", [0, stationY + stationHeight * 0.55, 0], [viaductLength * 0.72, stationHeight, stationWidth * 0.82]),
    box("accent", [0, stationY + stationHeight + 0.16, 0], [viaductLength * 0.84, 0.12, stationWidth * 0.94]),
    box("dark", [0, stationY + 0.08, 0.38], [viaductLength * 0.92, 0.04, 0.08]),
    box("dark", [0, stationY + 0.08, -0.38], [viaductLength * 0.92, 0.04, 0.08]),
    ...repeatColumns(supportCount, viaductLength / Math.max(1, supportCount - 1), 0, 1.35),
    box("warning", [0, stationY + 0.08, 0], [viaductLength * 0.78, 0.05, 0.08]),
  ];
  elements.push(...trainSet([0, stationY + trainOffset, 0], trainCars, {
    carLength: 0.72,
    carGap: 0.08,
    width: 0.72,
    height: 0.34,
    roles: options.trainRoles ?? ["accent", "secondary"],
  }));

  if (options.addConcourse) {
    elements.push(box("neutral", [0, 0.02, -1.35], [2.2, 0.8, 1.15]));
    elements.push(box("glass", [0, 0.62, -1.35], [1.8, 0.55, 0.92]));
    elements.push(box("concrete", [-0.86, -0.42, -0.9], [0.42, 0.08, 0.9], { rotation: [0.28, 0, 0] }));
    elements.push(box("concrete", [0.86, -0.42, -0.9], [0.42, 0.08, 0.9], { rotation: [0.28, 0, 0] }));
    elements.push(...vehicle([-0.64, -0.8, -2.06], { role: "warning", length: 0.62, width: 0.24, height: 0.18 }));
    elements.push(...vehicle([0.64, -0.8, -2.06], { role: "secondary", length: 0.62, width: 0.24, height: 0.18 }));
    elements.push(...streetLight([-1.42, 1, -1.96], 0.92));
    elements.push(...streetLight([1.42, 1, -1.96], 0.92));
  }

  if (undergroundTube) {
    elements.push(cylinder("dark", [0, 0.16, 0], 0.9, 0.9, viaductLength + 0.6, { rotation: [0, 0, Math.PI / 2], openEnded: true }));
    elements.push(box("facade", [0, -0.24, -1.28], [2.2, 0.44, 0.74]));
    elements.push(box("glass", [0, -0.08, -0.92], [1.46, 0.18, 0.08]));
  } else {
    elements.push(box("glass", [0, stationY + stationHeight * 0.82, 0], [viaductLength * 0.52, 0.18, stationWidth * 0.96]));
  }

  if (options.addSkywalk) {
    elements.push(box("glass", [0, 0.76, -2.08], [2.8, 0.18, 0.42]));
    elements.push(cylinder("concrete", [-1.1, 0.02, -2.08], 0.08, 0.08, 0.92, { radialSegments: 12 }));
    elements.push(cylinder("concrete", [1.1, 0.02, -2.08], 0.08, 0.08, 0.92, { radialSegments: 12 }));
  }

  if (options.addPortal) {
    elements.push(box("dark", [-viaductLength * 0.54, stationY + 0.14, 0], [0.2, 1.2, stationWidth * 1.06]));
    elements.push(box("dark", [viaductLength * 0.54, stationY + 0.14, 0], [0.2, 1.2, stationWidth * 1.06]));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.02,
    turnRate: options.turnRate ?? 0.0065,
    floorRadius: options.floorRadius ?? 4.4,
  });
}

function wastewaterModel(meta, options = {}) {
  const tankCount = options.tankCount ?? 3;
  const elements = [
    box("asphalt", [0, -0.92, 0], [6.6, 0.16, 6.4]),
    box("concrete", [0, -0.82, 0], [5.8, 0.05, 5.3]),
    box("facade", [0, -0.45, -1.8], [1.9, 0.48, 0.94]),
    box("roof", [0, -0.12, -1.8], [2.1, 0.08, 1.08]),
    box("glass", [0, -0.22, -1.34], [1.16, 0.18, 0.1]),
    box("accent", [0, -0.5, 1.48], [4.7, 0.12, 0.22]),
    cylinder("glass", [-2.05, -0.48, 1.48], 0.16, 0.16, 0.22, { radialSegments: 18 }),
    cylinder("glass", [2.05, -0.48, 1.48], 0.16, 0.16, 0.22, { radialSegments: 18 }),
    box("concrete", [0, -0.68, -0.94], [4.2, 0.08, 0.24]),
  ];

  for (let index = 0; index < tankCount; index += 1) {
    const x = (index - (tankCount - 1) / 2) * 1.62;
    elements.push(cylinder("concrete", [x, -0.2, 0.08], 0.72, 0.72, 0.28, { radialSegments: 30 }));
    elements.push(cylinder(index % 2 === 0 ? "secondary" : "glass", [x, -0.02, 0.08], 0.62, 0.62, 0.1, { radialSegments: 30 }));
    elements.push(cylinder("frame", [x, 0.14, 0.08], 0.07, 0.07, 0.3, { radialSegments: 12 }));
  }

  if (options.addDigesters) {
    elements.push(cylinder("neutral", [-1.72, -0.06, 1.9], 0.46, 0.5, 0.68, { radialSegments: 24 }));
    elements.push(cylinder("roof", [-1.72, 0.36, 1.9], 0.38, 0.44, 0.12, { radialSegments: 24 }));
    elements.push(cylinder("neutral", [1.72, -0.06, 1.9], 0.46, 0.5, 0.68, { radialSegments: 24 }));
    elements.push(cylinder("roof", [1.72, 0.36, 1.9], 0.38, 0.44, 0.12, { radialSegments: 24 }));
    elements.push(box("accent", [0, -0.16, 1.9], [2.7, 0.08, 0.16]));
  }

  if (options.addFilterBeds !== false) {
    elements.push(box("neutral", [-2.2, -0.48, -1.18], [0.82, 0.18, 1.12]));
    elements.push(box("neutral", [2.2, -0.48, -1.18], [0.82, 0.18, 1.12]));
    elements.push(box("secondary", [-2.2, -0.34, -1.18], [0.72, 0.06, 1]));
    elements.push(box("secondary", [2.2, -0.34, -1.18], [0.72, 0.06, 1]));
  }

  elements.push(...vehicle([0, -0.82, -2.18], { role: "warning", length: 0.52, width: 0.22, height: 0.16 }));
  elements.push(...streetLight([-2.8, 1, -2.16], 0.82));
  elements.push(...streetLight([2.8, 1, -2.16], 0.82));

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.09,
    turnRate: options.turnRate ?? 0.0048,
    floorRadius: options.floorRadius ?? 4.9,
  });
}

function hospitalModel(meta, options = {}) {
  const elements = [
    box("asphalt", [0, -0.94, 0], [6.7, 0.16, 6.4]),
    box("concrete", [0, -0.82, 0], [5.4, 0.05, 4.8]),
    box("facade", [0, -0.08, 0.08], [2.9, 1.18, 1.92]),
    box("roof", [0, 0.62, 0.08], [3.08, 0.08, 2.08]),
    box("glass", [0, 0.16, 1.04], [1.92, 0.44, 0.12]),
    box("facade", [-2, -0.18, -0.02], [1.22, 0.94, 2.36]),
    box("roof", [-2, 0.34, -0.02], [1.36, 0.08, 2.54]),
    box("facade", [2, -0.18, -0.02], [1.22, 0.94, 2.36]),
    box("roof", [2, 0.34, -0.02], [1.36, 0.08, 2.54]),
    box("glass", [0, 0.7, -0.58], [0.88, 0.78, 0.88]),
    box("danger", [0, 0.98, 1.02], [0.9, 0.14, 0.14]),
    box("danger", [0, 0.98, 1.02], [0.14, 0.9, 0.14]),
    box("secondary", [0, -0.48, 1.62], [1.1, 0.18, 0.9]),
    box("warning", [-1.55, -0.84, 1.86], [0.62, 0.02, 0.1]),
    box("warning", [1.55, -0.84, 1.86], [0.62, 0.02, 0.1]),
    box("concrete", [0, -0.66, 2.04], [2.6, 0.08, 0.96]),
  ];

  elements.push(...vehicle([-0.92, -0.82, 2.08], { role: "neutral", roofRole: "danger", length: 0.56, width: 0.24, height: 0.16 }));
  elements.push(...vehicle([0.92, -0.82, 2.08], { role: "secondary", roofRole: "glass", length: 0.56, width: 0.24, height: 0.16 }));
  elements.push(...streetLight([-2.54, 1, 2.18], 0.88));
  elements.push(...streetLight([2.54, 1, 2.18], 0.88));

  if (options.helipad) {
    elements.push(cylinder("neutral", [1.95, 0.9, -1.02], 0.58, 0.58, 0.08, { radialSegments: 24 }));
    elements.push(box("accent", [1.95, 0.97, -1.02], [0.62, 0.05, 0.16]));
    elements.push(box("accent", [1.95, 0.97, -1.02], [0.16, 0.05, 0.62]));
  }

  if (options.traumaTower) {
    elements.push(box("glass", [0, 1.26, -0.82], [1.06, 1.08, 1.06]));
    elements.push(box("roof", [0, 1.86, -0.82], [1.18, 0.08, 1.18]));
  }

  if (options.addClinicWing) {
    elements.push(box("facade", [-2.8, -0.28, -0.18], [0.78, 0.68, 1.66]));
    elements.push(box("roof", [-2.8, 0.1, -0.18], [0.92, 0.08, 1.82]));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.06,
    turnRate: options.turnRate ?? 0.0049,
    floorRadius: options.floorRadius ?? 5,
  });
}

function railStationModel(meta, options = {}) {
  const elements = [
    box("dark", [0, -0.92, 0], [6.3, 0.18, 6.3]),
    box("neutral", [0, -0.34, 0], [4.6, 0.28, 1.9]),
    box("dark", [0, -0.26, 0.68], [5.3, 0.03, 0.08]),
    box("dark", [0, -0.26, -0.68], [5.3, 0.03, 0.08]),
    box("accent", [0, 0.54, 0], [4.3, 0.1, 2.1]),
    box("glass", [0, 0.12, 0], [3.5, 0.82, 1.5]),
    box("neutral", [0, 0.96, 0], [2.6, 0.28, 1.1]),
    box("warning", [0, -0.18, 0.42], [5.1, 0.05, 0.08]),
    box("warning", [0, -0.18, -0.42], [5.1, 0.05, 0.08]),
  ];
  elements.push(...trainSet([0, -0.02, 0], 2, {
    carLength: 1.06,
    carGap: 1.72,
    width: 0.74,
    height: 0.34,
    roles: ["secondary"],
  }));
  elements.push(...signalGantry([0, 0, -0.02], 4.8, 1.18));
  elements.push(...streetLight([-2.76, 1, 2.04], 0.84));
  elements.push(...streetLight([2.76, 1, 2.04], 0.84));

  if (options.heritageDome) {
    elements.push(cone("secondary", [-1.1, 1.18, 0], 0.42, 0.72, { radialSegments: 6 }));
    elements.push(cone("secondary", [1.1, 1.18, 0], 0.42, 0.72, { radialSegments: 6 }));
    elements.push(box("neutral", [0, 0.9, -1.1], [0.86, 0.72, 0.86]));
  }

  if (options.multimodalWing) {
    elements.push(box("glass", [1.78, 0.08, -0.95], [1.1, 0.78, 0.86]));
    elements.push(...vehicle([2.36, -0.82, -1.84], { role: "warning", length: 0.62, width: 0.22, height: 0.16 }));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.05,
    turnRate: options.turnRate ?? 0.0056,
  });
}

function portModel(meta, options = {}) {
  const craneCount = options.craneCount ?? 3;
  const elements = [
    box("dark", [0, -0.94, 0], [7.8, 0.16, 7.2]),
    box("secondary", [-2.42, -0.86, 0], [2.48, 0.03, 6.9]),
    box("concrete", [0.98, -0.84, 0], [5.18, 0.05, 6.4]),
    box("concrete", [-0.48, -0.82, 0], [0.28, 0.09, 6.4]),
    box("asphalt", [1.56, -0.8, -1.94], [3.88, 0.04, 1.16]),
    box("asphalt", [1.56, -0.8, 1.94], [3.88, 0.04, 1.16]),
    box("facade", [2.56, -0.42, 2.58], [1.42, 0.54, 0.82]),
    box("roof", [2.56, -0.08, 2.58], [1.56, 0.08, 0.94]),
    box("glass", [2.56, -0.24, 2.96], [1.06, 0.2, 0.08]),
    ...containerYard([1.58, -0.66, -1.82], 4, 7, { seedOffset: 2, maxLayers: 3 }),
    ...containerYard([1.62, -0.66, 0.18], 5, 8, { seedOffset: 5, maxLayers: 3 }),
    ...containerYard([1.56, -0.66, 2.02], 3, 6, { seedOffset: 8, maxLayers: 2 }),
    ...containerShip([-2.66, -0.74, -1.38], { length: 2.62, width: 1.02 }),
    ...containerShip([-2.72, -0.76, 1.48], {
      length: 2.24,
      width: 0.9,
      hullRole: "dark",
      deckRoles: ["warning", "accent", "secondary", "neutral"],
    }),
  ];

  for (let index = 0; index < craneCount; index += 1) {
    const z = -2.06 + index * 2.02;
    elements.push(...gantryCrane([-0.56, -0.12, z], { height: 1.76, span: 1.2, boomLength: 1.74 }));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.12,
    turnRate: options.turnRate ?? 0.0043,
    floorRadius: options.floorRadius ?? 5.8,
  });
}

function corridorModel(meta, options = {}) {
  const rampCount = options.rampCount ?? 0;
  const viaduct = options.viaduct ?? false;
  const streetLightCount = options.streetLightCount ?? 4;
  const vehicleCount = options.vehicleCount ?? 2;
  const elements = [
    box("dark", [0, -0.92, 0], [6.5, 0.18, 6.5]),
    box("dark", [0, -0.5, 0], [5.2, 0.18, 1.6]),
    box("warning", [0, -0.38, 0], [5.2, 0.04, 0.1]),
    box("warning", [0, -0.38, 0.5], [5.2, 0.03, 0.06]),
    box("warning", [0, -0.38, -0.5], [5.2, 0.03, 0.06]),
    box("concrete", [0, -0.38, 0.78], [5.2, 0.04, 0.08]),
    box("concrete", [0, -0.38, -0.78], [5.2, 0.04, 0.08]),
  ];

  if (viaduct) {
    elements.push(...repeatColumns(3, 1.8, 0, 1.05, "neutral"));
    elements.push(box("neutral", [0, 0.1, 0], [5.1, 0.14, 1.52]));
  }

  for (let index = 0; index < rampCount; index += 1) {
    const x = index === 0 ? -1.8 : 1.8;
    const z = index === 0 ? -1.35 : 1.35;
    elements.push(box("accent", [x, -0.34, z], [1.7, 0.08, 0.52], { rotation: [0, index === 0 ? -0.45 : 0.45, 0] }));
  }

  if (options.bridgeArch) {
    elements.push(torus("accent", [0, 0.16, 0], 1.08, 0.08, { rotation: [0, 0, Math.PI] }));
  }

  if (options.addTollPlaza) {
    elements.push(box("neutral", [0, 0.1, 0], [2.2, 0.16, 1.86]));
    elements.push(box("roof", [0, 0.34, 0], [2.48, 0.08, 2]));
    elements.push(...repeatColumns(3, 0.68, 0, 0.46, "concrete"));
  }

  for (let index = 0; index < streetLightCount; index += 1) {
    const x = -2.2 + index * (4.4 / Math.max(1, streetLightCount - 1));
    elements.push(...streetLight([x, 1, 1.2], 0.8));
  }

  for (let index = 0; index < vehicleCount; index += 1) {
    const x = -1.4 + index * 1.4;
    const z = index % 2 === 0 ? -0.26 : 0.26;
    elements.push(...vehicle([x, -0.54, z], {
      role: index % 2 === 0 ? "warning" : "secondary",
      length: 0.56,
      width: 0.2,
      height: 0.14,
    }));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.04,
    turnRate: options.turnRate ?? 0.0051,
  });
}

function railLineModel(meta, options = {}) {
  const trackCount = options.trackCount ?? 2;
  const trainCount = options.trainCount ?? 1;
  const coachCount = options.coachCount ?? 3;
  const elements = [
    box("dark", [0, -0.92, 0], [6.4, 0.18, 6.4]),
    box("dark", [0, -0.56, 0], [5.4, 0.18, 2.3]),
  ];

  for (let index = 0; index < trackCount; index += 1) {
    const z = trackCount === 1 ? 0 : -0.62 + index * 1.24;
    elements.push(box("neutral", [0, -0.36, z + 0.12], [5.2, 0.05, 0.08]));
    elements.push(box("neutral", [0, -0.36, z - 0.12], [5.2, 0.05, 0.08]));
    elements.push(box("warning", [0, -0.48, z], [5.1, 0.03, 0.62]));
    for (let sleeper = 0; sleeper < 9; sleeper += 1) {
      const x = -2.2 + sleeper * 0.55;
      elements.push(box("concrete", [x, -0.42, z], [0.24, 0.04, 0.72]));
    }
  }

  for (let index = 0; index < trainCount; index += 1) {
    const z = trackCount === 1 ? 0 : index % 2 === 0 ? -0.62 : 0.62;
    elements.push(...trainSet([0, 0.02, z], coachCount, {
      carLength: 0.78,
      carGap: 0.08,
      width: 0.58,
      height: 0.32,
      roles: index % 2 === 0 ? ["accent", "secondary"] : ["secondary", "neutral"],
    }));
  }

  if (options.addOverbridge) {
    elements.push(box("glass", [0, 0.68, 0], [1.1, 0.26, 2.1]));
    elements.push(cylinder("neutral", [-0.4, 0.18, 0.86], 0.08, 0.08, 0.9));
    elements.push(cylinder("neutral", [0.4, 0.18, -0.86], 0.08, 0.08, 0.9));
  }

  if (options.electrified !== false) {
    elements.push(...signalGantry([-1.2, 0, 0], 2.6, 1.04));
    elements.push(...signalGantry([1.4, 0, 0], 2.6, 1.04));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.02,
    turnRate: options.turnRate ?? 0.0054,
  });
}

function rrtsModel(meta, options = {}) {
  const elements = [
    box("dark", [0, -0.92, 0], [6.2, 0.18, 6.2]),
    box("neutral", [0, 0.08, 0], [5.4, 0.18, 1.8]),
    ...repeatColumns(4, 1.5, 0, 1.18, "dark"),
    box("glass", [0, 0.88, 0], [3.2, 0.58, 1.3]),
    box("accent", [0, 1.24, 0], [3.6, 0.08, 1.42]),
  ];
  elements.push(...trainSet([0.12, 0.54, 0], 2, {
    carLength: 1.24,
    carGap: 0.18,
    width: 0.76,
    height: 0.38,
    roles: ["secondary"],
  }));
  elements.push(...signalGantry([0, 0, 0], 4.2, 1.2));

  if (options.addPortal) {
    elements.push(cylinder("dark", [2.2, 0.22, 0], 0.74, 0.74, 1.4, { rotation: [0, 0, Math.PI / 2], openEnded: true }));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.06,
    turnRate: options.turnRate ?? 0.0062,
  });
}

function airportModel(meta, options = {}) {
  const elements = [
    box("asphalt", [0, -0.94, 0], [7.6, 0.16, 7.2]),
    box("dark", [0, -0.8, -0.36], [6.5, 0.04, 1.56]),
    box("warning", [0, -0.75, -0.36], [6.1, 0.01, 0.08]),
    box("warning", [0, -0.75, -1.04], [0.2, 0.01, 5]),
    box("facade", [-0.9, -0.18, 1.58], [3, 0.74, 1.08]),
    box("roof", [-0.9, 0.24, 1.58], [3.24, 0.1, 1.24]),
    box("glass", [-0.9, -0.02, 1.96], [2.34, 0.3, 0.12]),
    cylinder("frame", [1.95, 0.16, 1.6], 0.16, 0.2, 1.86, { radialSegments: 16 }),
    box("secondary", [1.95, 1.16, 1.6], [0.78, 0.24, 0.78]),
    box("neutral", [1.32, -0.36, -0.08], [1.42, 0.12, 0.6]),
    box("accent", [1.32, -0.24, -0.08], [0.82, 0.1, 0.18]),
    box("neutral", [2.2, -0.32, -0.08], [0.18, 0.18, 1.12]),
    box("neutral", [2.52, -0.32, -0.08], [0.18, 0.18, 0.82]),
  ];
  elements.push(...aircraft([1.52, -0.64, -0.34], { scale: 0.9 }));
  elements.push(...vehicle([-2.2, -0.82, 2.24], { role: "warning", length: 0.56, width: 0.2, height: 0.14 }));
  elements.push(...streetLight([-2.82, 1, 2.26], 0.82));
  elements.push(...streetLight([2.82, 1, 2.26], 0.82));

  if (options.addJetBridge) {
    elements.push(box("glass", [0.22, -0.02, 0.88], [1.26, 0.14, 0.24]));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.1,
    turnRate: options.turnRate ?? 0.0044,
    floorRadius: options.floorRadius ?? 5.2,
  });
}

function campusModel(meta, options = {}) {
  const wingCount = options.wingCount ?? 3;
  const elements = [
    box("dark", [0, -0.92, 0], [6.6, 0.18, 6.6]),
    box("neutral", [0, -0.22, 0], [2.0, 1.0, 1.5]),
    box("glass", [0, 0.34, 0.82], [1.5, 0.42, 0.16]),
    cylinder("accent", [0, -0.78, 0], 1.9, 1.9, 0.04, { radialSegments: 30 }),
    box("landscape", [0, -0.86, -2.16], [5.4, 0.04, 1.22]),
  ];

  for (let index = 0; index < wingCount; index += 1) {
    const angle = (Math.PI * 2 * index) / wingCount;
    const x = Math.cos(angle) * 1.7;
    const z = Math.sin(angle) * 1.7;
    elements.push(box(index % 2 === 0 ? "secondary" : "neutral", [x, -0.15, z], [1.1, 0.86, 0.92], { rotation: [0, -angle, 0] }));
  }

  if (options.addAuditorium) {
    elements.push(cylinder("accent", [-1.85, -0.18, -1.82], 0.62, 0.72, 0.72, { radialSegments: 18 }));
  }

  if (options.addHostels) {
    elements.push(box("facade", [-2.5, -0.06, 1.8], [0.94, 1.02, 0.84]));
    elements.push(box("facade", [2.5, -0.06, 1.8], [0.94, 1.02, 0.84]));
    elements.push(box("roof", [-2.5, 0.5, 1.8], [1.08, 0.08, 0.98]));
    elements.push(box("roof", [2.5, 0.5, 1.8], [1.08, 0.08, 0.98]));
  }

  elements.push(...vehicle([0, -0.82, 2.3], { role: "warning", length: 0.62, width: 0.24, height: 0.16 }));
  elements.push(...streetLight([-2.84, 1, 2.18], 0.84));
  elements.push(...streetLight([2.84, 1, 2.18], 0.84));

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.05,
    turnRate: options.turnRate ?? 0.0047,
  });
}

function conventionCenterModel(meta, options = {}) {
  const elements = [
    box("asphalt", [0, -0.94, 0], [7.2, 0.16, 7]),
    box("concrete", [0, -0.84, 0.2], [5.9, 0.05, 5]),
    box("landscape", [0, -0.86, -2.32], [6.2, 0.04, 1.28]),
    box("facade", [0, -0.12, -0.18], [4.2, 0.82, 2.56]),
    box("roof", [0, 0.34, -0.18], [4.48, 0.1, 2.84]),
    box("glass", [0, 0.04, 1.08], [2.64, 0.34, 0.12]),
    box("concrete", [0, -0.54, 1.74], [3.12, 0.08, 1.08]),
    box("roof", [0, 0.72, 0.24], [2.64, 0.08, 1.12]),
    box("facade", [-2.04, -0.18, 0.62], [1.1, 0.62, 1.44]),
    box("facade", [2.04, -0.18, 0.62], [1.1, 0.62, 1.44]),
    box("roof", [-2.04, 0.18, 0.62], [1.24, 0.08, 1.58]),
    box("roof", [2.04, 0.18, 0.62], [1.24, 0.08, 1.58]),
    box("accent", [0, -0.62, 2.26], [1.42, 0.04, 1.24]),
    box("secondary", [0, 0.9, -0.46], [1.12, 0.05, 0.1]),
    box("secondary", [0, 0.9, -0.46], [0.1, 0.05, 1.12]),
    ...repeatColumns(6, 0.7, 1.32, 0.64, "concrete"),
    ...tree([-2.86, -0.86, 2.56], 0.96),
    ...tree([2.86, -0.86, 2.56], 0.96),
    ...tree([-2.92, -0.86, -2.18], 1),
    ...tree([2.92, -0.86, -2.18], 1),
  ];

  elements.push(...vehicle([-1.08, -0.82, 2.62], { role: "warning", length: 0.56, width: 0.22, height: 0.16 }));
  elements.push(...vehicle([1.08, -0.82, 2.62], { role: "secondary", length: 0.56, width: 0.22, height: 0.16 }));
  elements.push(...streetLight([-3.08, 1, 2.48], 0.86));
  elements.push(...streetLight([3.08, 1, 2.48], 0.86));

  if (options.addPavilions !== false) {
    elements.push(cylinder("neutral", [-2.14, -0.3, -1.62], 0.52, 0.58, 0.48, { radialSegments: 18 }));
    elements.push(cylinder("neutral", [2.14, -0.3, -1.62], 0.52, 0.58, 0.48, { radialSegments: 18 }));
    elements.push(box("roof", [-2.14, 0, -1.62], [1.18, 0.08, 1.18]));
    elements.push(box("roof", [2.14, 0, -1.62], [1.18, 0.08, 1.18]));
  }

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.08,
    turnRate: options.turnRate ?? 0.0044,
    floorRadius: options.floorRadius ?? 5.4,
  });
}

function bennettUniversityCampusModel(meta, options = {}) {
  const elements = [
    box("asphalt", [0, -0.94, 0], [10.2, 0.16, 8.9]),
    box("asphalt", [-4.42, -0.9, -0.12], [0.92, 0.03, 8]),
    box("asphalt", [-0.2, -0.9, 2.82], [4.9, 0.03, 1.82]),
    box("landscape", [3.82, -0.86, 2.82], [2.38, 0.04, 2.54]),
    box("landscape", [0.7, -0.86, 3.96], [6.82, 0.04, 0.74]),
    box("concrete", [0.24, -0.76, 1.62], [6.62, 0.16, 2.12]),
    box("dark", [0.24, -0.14, 1.72], [5.94, 1.02, 1.64]),
    box("roof", [0.24, 0.46, 1.72], [6.18, 0.1, 1.82]),
    box("glass", [0.24, -0.02, 2.5], [4.96, 0.52, 0.12]),
    box("facade", [-0.08, 0.18, 0.08], [7.38, 1.24, 1.82]),
    box("roof", [-0.08, 0.9, 0.08], [7.64, 0.08, 2.02]),
    box("facade", [-2.72, 0.14, -1.42], [2.02, 1.26, 2.74]),
    box("roof", [-2.72, 0.86, -1.42], [2.2, 0.08, 2.94]),
    box("facade", [2.82, 0.14, -1.24], [2.18, 1.18, 2.54]),
    box("roof", [2.82, 0.82, -1.24], [2.34, 0.08, 2.72]),
    box("facade", [0.58, 0.14, -2.42], [5.24, 1.06, 1.36]),
    box("roof", [0.58, 0.76, -2.42], [5.48, 0.08, 1.52]),
    box("facade", [-3.72, 0.76, -0.94], [1.02, 2.68, 1.02]),
    box("roof", [-3.72, 2.14, -0.94], [1.16, 0.08, 1.16]),
    box("facade", [-1.24, 1.02, -2.78], [1.06, 3.22, 1.06]),
    box("roof", [-1.24, 2.68, -2.78], [1.18, 0.08, 1.18]),
    box("facade", [0.36, 0.88, -2.52], [1, 2.86, 1]),
    box("roof", [0.36, 2.36, -2.52], [1.12, 0.08, 1.12]),
    box("facade", [3.72, 0.76, -1.02], [0.98, 2.52, 0.98]),
    box("roof", [3.72, 2.06, -1.02], [1.12, 0.08, 1.12]),
    box("facade", [-2.22, 1.22, 1.02], [0.78, 3.66, 0.78]),
    box("roof", [-2.22, 3.08, 1.02], [0.9, 0.08, 0.9]),
    box("warning", [0.82, 0.34, -3.64], [2.82, 0.08, 1.72]),
    box("roof", [0.82, 0.2, -3.64], [3.04, 0.06, 1.92]),
    box("neutral", [3.92, -0.74, 3.28], [0.58, 0.12, 0.58]),
    cylinder("concrete", [3.92, -0.58, 3.28], 0.28, 0.32, 0.18, { radialSegments: 18 }),
    cylinder("neutral", [3.92, -0.24, 3.28], 0.1, 0.12, 0.62, { radialSegments: 12 }),
    cone("neutral", [3.92, 0.18, 3.28], 0.18, 0.48, { radialSegments: 10 }),
    box("glass", [-0.08, 0.42, 1.06], [5.42, 0.28, 0.12]),
    box("glass", [-2.72, 0.22, 0.62], [1.38, 0.18, 0.12]),
    box("glass", [-2.72, 0.22, -1.86], [1.38, 0.18, 0.12]),
    box("glass", [2.82, 0.22, 0.56], [1.46, 0.18, 0.12]),
    box("glass", [2.82, 0.22, -1.92], [1.46, 0.18, 0.12]),
    box("glass", [0.58, 0.3, -1.62], [4.2, 0.22, 0.12]),
    box("frame", [-2.22, 1.96, 1.02], [0.12, 3.98, 0.12]),
    box("frame", [-1.88, 1.96, 1.02], [0.12, 3.98, 0.12]),
    box("frame", [-2.05, 3.56, 1.02], [0.48, 0.12, 0.48]),
    box("frame", [-2.22, 0.18, 1.52], [0.42, 0.06, 0.42]),
  ];

  for (let index = 0; index < 10; index += 1) {
    const x = -2.18 + index * 0.48;
    elements.push(box("facade", [x, -0.18, 2.52], [0.14, 1.32, 0.14]));
    elements.push(box("facade", [x, -0.18, 0.94], [0.12, 1.04, 0.08]));
  }

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      const x = -1.84 + col * 0.64;
      const z = 2.16 + row * 0.36;
      const role = (row + col) % 2 === 0 ? "neutral" : "secondary";
      elements.push(...vehicle([x, -0.82, z], {
        role,
        length: 0.48,
        width: 0.2,
        height: 0.14,
        rotation: [0, Math.PI / 2, 0],
      }));
    }
  }

  elements.push(...vehicle([-4.22, -0.82, -1.92], { role: "neutral", length: 0.68, width: 0.24, height: 0.16, rotation: [0, Math.PI / 2, 0] }));
  elements.push(...vehicle([-4.22, -0.82, -0.22], { role: "warning", length: 0.62, width: 0.24, height: 0.16, rotation: [0, Math.PI / 2, 0] }));
  elements.push(...vehicle([-4.22, -0.82, 1.52], { role: "secondary", length: 0.62, width: 0.24, height: 0.16, rotation: [0, Math.PI / 2, 0] }));
  elements.push(...vehicle([-4.22, -0.82, 3.08], { role: "neutral", length: 0.62, width: 0.24, height: 0.16, rotation: [0, Math.PI / 2, 0] }));
  elements.push(...streetLight([-3.72, 1, 3.6], 0.9));
  elements.push(...streetLight([-1.22, 1, 3.6], 0.9));
  elements.push(...streetLight([1.44, 1, 3.6], 0.9));
  elements.push(...streetLight([3.92, 1, 3.6], 0.9));
  elements.push(...tree([-2.98, -0.86, 4], 1));
  elements.push(...tree([-2.22, -0.86, 4.2], 0.94));
  elements.push(...tree([3.22, -0.86, 4.08], 1.02));
  elements.push(...tree([4.82, -0.86, 3.08], 1.12));
  elements.push(...tree([4.9, -0.86, 4.2], 0.98));
  elements.push(...tree([4.56, -0.86, 1.74], 0.92));
  elements.push(...tree([-4.68, -0.86, -3.06], 0.92));
  elements.push(...tree([-4.68, -0.86, 4.08], 0.92));

  const spec = modelBase(meta, elements, {
    scale: options.scale ?? 1.02,
    turnRate: options.turnRate ?? 0.0036,
    floorRadius: options.floorRadius ?? 6.8,
  });
  spec.previewCamera = {
    position: [-3.2, 4.5, 8.4],
    target: [0.3, 0.62, 0.52],
  };
  spec.modalCamera = {
    position: [-3.5, 5.1, 9.2],
    target: [0.3, 0.7, 0.44],
  };
  return spec;
}

function mobilityHubCampusModel(meta, options = {}) {
  const elements = [
    box("asphalt", [0, -0.94, 0], [7.4, 0.16, 7.2]),
    box("landscape", [0, -0.86, -2.35], [7, 0.04, 1.6]),
    box("landscape", [-2.75, -0.86, 0.35], [1.2, 0.04, 3.8]),
    box("landscape", [2.75, -0.86, 0.35], [1.2, 0.04, 3.8]),
    box("concrete", [0, -0.76, 0.15], [5.1, 0.18, 4.7]),
    box("concrete", [0, -0.68, 2.15], [4.4, 0.08, 1.3]),
    box("accent", [0, -0.64, 2.15], [1.2, 0.03, 1.1]),
    box("facade", [0, -0.1, 1.65], [2.7, 0.74, 1.1]),
    box("roof", [0, 0.34, 2.1], [3.5, 0.08, 0.62]),
    box("glass", [0, 0.02, 2.18], [2.1, 0.38, 0.12]),
    ...repeatColumns(5, 0.68, 2.18, 0.55, "concrete"),
    box("facade", [0, 0.06, 0.3], [1.6, 1.18, 1.55]),
    box("glass", [0, 0.22, 0.58], [1.28, 0.9, 0.94]),
    box("roof", [0, 0.72, 0.26], [1.95, 0.12, 1.75]),
    box("facade", [-1.72, -0.02, 0.1], [1.72, 0.9, 2.9]),
    box("roof", [-1.72, 0.48, 0.1], [1.86, 0.08, 3.04]),
    box("facade", [1.72, -0.02, 0.1], [1.72, 0.9, 2.9]),
    box("roof", [1.72, 0.48, 0.1], [1.86, 0.08, 3.04]),
    box("facade", [0, 0.12, -1.72], [4.86, 0.86, 1.05]),
    box("roof", [0, 0.58, -1.72], [5.02, 0.08, 1.17]),
    box("glass", [-0.82, 0.1, 1.05], [0.46, 0.52, 0.56]),
    box("glass", [0.82, 0.1, 1.05], [0.46, 0.52, 0.56]),
    windowBand([-1.72, 0.14, 1.54], [1.24, 0.24, 0.12]),
    windowBand([-1.72, 0.14, -1.16], [1.24, 0.24, 0.12]),
    windowBand([1.72, 0.14, 1.54], [1.24, 0.24, 0.12]),
    windowBand([1.72, 0.14, -1.16], [1.24, 0.24, 0.12]),
    windowBand([0, 0.3, -1.18], [3.8, 0.22, 0.12]),
    box("frame", [-2.2, -0.12, -0.1], [0.08, 0.9, 2.6]),
    box("frame", [2.2, -0.12, -0.1], [0.08, 0.9, 2.6]),
    box("facade", [-2.4, -0.22, 1.88], [0.56, 0.6, 0.9]),
    box("facade", [2.4, -0.22, 1.88], [0.56, 0.6, 0.9]),
    box("glass", [-2.4, -0.08, 2.24], [0.34, 0.22, 0.08]),
    box("glass", [2.4, -0.08, 2.24], [0.34, 0.22, 0.08]),
    cylinder("concrete", [-2.08, -0.32, -1.7], 0.46, 0.52, 0.74, { radialSegments: 18 }),
    box("roof", [-2.08, 0.1, -1.7], [0.98, 0.08, 0.98]),
    box("secondary", [0, 0.86, 0.26], [1.08, 0.05, 0.08]),
    box("secondary", [0, 0.86, 0.26], [0.08, 0.05, 1.08]),
    box("accent", [0, -0.58, 0.15], [0.42, 0.04, 3.95]),
    box("warning", [0, -0.86, 2.15], [3.7, 0.02, 0.06]),
    ...tree([-2.65, -0.86, 2.78], 1),
    ...tree([-1.55, -0.86, 2.92], 0.9),
    ...tree([1.55, -0.86, 2.92], 0.9),
    ...tree([2.65, -0.86, 2.78], 1),
    ...tree([-3.02, -0.86, -1.92], 1.05),
    ...tree([3.02, -0.86, -1.92], 1.05),
  ];

  if (options.addBusBays !== false) {
    elements.push(box("asphalt", [0, -0.9, 3.05], [4.2, 0.03, 0.78]));
    elements.push(box("neutral", [-1.18, -0.82, 2.98], [0.88, 0.12, 0.32]));
    elements.push(box("neutral", [1.18, -0.82, 2.98], [0.88, 0.12, 0.32]));
    elements.push(box("accent", [-1.18, -0.74, 2.98], [0.7, 0.08, 0.28]));
    elements.push(box("accent", [1.18, -0.74, 2.98], [0.7, 0.08, 0.28]));
    elements.push(...vehicle([-1.18, -0.82, 3.02], { role: "warning", length: 0.78, width: 0.24, height: 0.18 }));
    elements.push(...vehicle([1.18, -0.82, 3.02], { role: "secondary", length: 0.78, width: 0.24, height: 0.18 }));
  }

  elements.push(...streetLight([-3.16, 1, 2.94], 0.84));
  elements.push(...streetLight([3.16, 1, 2.94], 0.84));

  return modelBase(meta, elements, {
    scale: options.scale ?? 1.08,
    turnRate: options.turnRate ?? 0.0038,
    floorRadius: options.floorRadius ?? 5.3,
  });
}

const savedProjectModels = {
  "bennett-university-mobility-hub": bennettUniversityCampusModel(
    {
      title: "Bennett University campus massing",
      family: "education",
      summary: "Dedicated Bennett University aerial massing with the front hall, academic spine, tower blocks, sports court, and campus lawns.",
    },
    { scale: 1.04 }
  ),
  "bharat-mandapam-civic-hub": conventionCenterModel(
    {
      title: "Convention plaza + mobility hub",
      family: "civic",
      summary: "Public plaza spine with shaded pavilion massing near Bharat Mandapam.",
    },
    { addPavilions: true, scale: 1.06 }
  ),
  "mumbai-metro-line-2a": metroModel({ title: "Metro viaduct interchange", family: "metro", summary: "Elevated two-track interchange massing for the Dahisar East to DN Nagar corridor." }, { viaductLength: 5.8, stationWidth: 2.25, trainCars: 4, supportCount: 4, addConcourse: true }),
  "mumbai-metro-line-7": metroModel({ title: "North-south elevated metro", family: "metro", summary: "Linear elevated station massing with longer train formation." }, { viaductLength: 5.9, stationWidth: 2.15, trainCars: 4, supportCount: 4, addPortal: true, trainRoles: ["secondary", "accent"] }),
  "malad-stp": wastewaterModel({ title: "Sewage treatment process train", family: "wastewater", summary: "Clarifier and processing tank layout for the Malad plant." }, { tankCount: 3, addDigesters: true, addFilterBeds: true }),
  "bhandup-stp": wastewaterModel({ title: "Expanded wastewater node", family: "wastewater", summary: "Saved 3D treatment cluster with digesters and process tanks." }, { tankCount: 4, addDigesters: true, addFilterBeds: true, scale: 1.08 }),
  "bhandup-multispeciality-hospital": hospitalModel({ title: "Multispeciality hospital campus", family: "hospital", summary: "Twin-wing municipal hospital massing with helipad-ready roof deck." }, { helipad: true, addClinicWing: true }),
  "csmt-redevelopment": railStationModel({ title: "Heritage terminus redevelopment", family: "station", summary: "Redevelopment concept with concourse bridge and heritage domes." }, { heritageDome: true, multimodalWing: true, scale: 1.08 }),
  "visakhapatnam-railway-station-redevelopment": railStationModel({ title: "Coastal city station upgrade", family: "station", summary: "Modern station redevelopment with multimodal entry hall." }, { multimodalWing: true }),
  "visakhapatnam-fishing-harbour-modernisation": portModel({ title: "Fishing harbour modernisation", family: "port", summary: "Modernised berth and crane layout for harbour operations." }, { craneCount: 4 }),
  "raipur-visakhapatnam-economic-corridor-ap-section": corridorModel({ title: "Economic corridor segment", family: "highway", summary: "Freight corridor section with grade-separated ramps." }, { rampCount: 2, viaduct: true, streetLightCount: 5, vehicleCount: 3, addTollPlaza: true }),
  "convent-junction-sheela-nagar-port-road": corridorModel({ title: "Port access road", family: "road", summary: "Urban freight road with access ramps near the port belt." }, { rampCount: 1, streetLightCount: 6, vehicleCount: 3 }),
  "narasannapeta-pathapatnam-nh326a": corridorModel({ title: "Highway corridor section", family: "highway", summary: "Four-lane highway segment massing with support piers." }, { viaduct: true, rampCount: 1, streetLightCount: 3, vehicleCount: 2 }),
  "howrah-maidan-esplanade-metro": metroModel({ title: "River-crossing metro section", family: "metro", summary: "Underground metro section with deep-tube alignment concept." }, { undergroundTube: true, viaductLength: 5.1, trainCars: 3, stationWidth: 1.95, addPortal: true, trainRoles: ["secondary"] }),
  "kavi-subhash-hemanta-mukhopadhyay-metro": metroModel({ title: "Terminal metro extension", family: "metro", summary: "Saved metro terminal section with concourse box and elevated deck." }, { trainCars: 3, addConcourse: true, addSkywalk: true, supportCount: 3 }),
  "taratala-majerhat-metro": metroModel({ title: "Connector metro station", family: "metro", summary: "Short elevated connector station model for Taratala to Majerhat." }, { viaductLength: 5.2, stationWidth: 2, trainCars: 2, addConcourse: true, addPortal: true }),
  "pune-metro-ruby-hall-ramwadi": metroModel({ title: "Urban metro eastward stretch", family: "metro", summary: "Longer station canopy with four-car metro preview." }, { viaductLength: 6.1, stationWidth: 2.2, trainCars: 4, supportCount: 4, addSkywalk: true }),
  "kochi-metro-phase-1b-tripunithura": metroModel({ title: "Metro phase extension", family: "metro", summary: "Saved elevated metro extension model with concourse and viaduct spans." }, { viaductLength: 5.6, stationWidth: 2.05, trainCars: 3, addConcourse: true, trainRoles: ["secondary", "accent"] }),
  "agra-metro-taj-east-gate-mankameshwar": metroModel({ title: "Heritage city metro line", family: "metro", summary: "Compact metro section for the Agra corridor with protected canopy form." }, { undergroundTube: true, viaductLength: 4.9, stationWidth: 1.9, trainCars: 3, addPortal: true }),
  "duhai-modinagar-north-rrts": rrtsModel({ title: "Regional rapid transit section", family: "rrts", summary: "Saved RRTS viaduct with twin trainsets and portal edge." }, { addPortal: true }),
  "pune-metro-pimpri-nigdi-extension": metroModel({ title: "Metro extension viaduct", family: "metro", summary: "Northern Pune extension with long viaduct deck and four-car train." }, { viaductLength: 6.2, stationWidth: 2.15, trainCars: 4, supportCount: 4, addPortal: true }),
  "gurugram-metro-rail-project": metroModel({ title: "City loop metro project", family: "metro", summary: "Saved metro loop concept with interchange concourse and deck." }, { viaductLength: 6, stationWidth: 2.3, trainCars: 4, supportCount: 5, addConcourse: true, addSkywalk: true }),
  "aiims-rewari": hospitalModel({ title: "AIIMS medical campus", family: "hospital", summary: "Institutional hospital massing with helipad and campus-scale wings." }, { helipad: true, addClinicWing: true, scale: 1.08 }),
  "rewari-kathuwas-rail-doubling": railLineModel({ title: "Rail doubling section", family: "railway", summary: "Twin-track doubling model with trainset and overbridge." }, { trackCount: 2, trainCount: 1, coachCount: 3, addOverbridge: true }),
  "kathuwas-narnaul-rail-doubling": railLineModel({ title: "Rail capacity upgrade", family: "railway", summary: "Parallel rail line doubling with expanded overbridge span." }, { trackCount: 2, trainCount: 2, coachCount: 2, addOverbridge: true, scale: 1.05 }),
  "bhiwani-dobh-bhali-rail-doubling": railLineModel({ title: "Rail corridor strengthening", family: "railway", summary: "Saved double-track corridor with longer track bed and service span." }, { trackCount: 2, trainCount: 1, coachCount: 4 }),
  "rohtak-meham-hansi-rail-line": railLineModel({ title: "New rail line package", family: "railway", summary: "New corridor rail model with future expansion track bed." }, { trackCount: 1, trainCount: 1, coachCount: 3, addOverbridge: true }),
  "aiims-jodhpur-trauma-centre": hospitalModel({ title: "Trauma and critical care block", family: "hospital", summary: "Saved trauma-centre massing with tower block and emergency forecourt." }, { traumaTower: true, helipad: true, addClinicWing: true }),
  "jodhpur-airport-terminal": airportModel({ title: "Airport terminal building", family: "airport", summary: "Terminal slice with runway edge, ATC tower, and aircraft stand." }, { addJetBridge: true }),
  "jodhpur-ring-road-karwar-dangiyawas": corridorModel({ title: "Ring road section", family: "road", summary: "Ring road carriageway with grade-separated ramps." }, { rampCount: 2, viaduct: true, bridgeArch: true, streetLightCount: 5, vehicleCount: 3 }),
  "pachpadra-bagundi-nh25": corridorModel({ title: "Desert highway section", family: "highway", summary: "Highway massing with elevated support structure and clean divider." }, { viaduct: true, rampCount: 1, vehicleCount: 2, streetLightCount: 2 }),
  "iim-shillong-umsawli-campus": campusModel({ title: "Academic campus cluster", family: "education", summary: "Saved campus massing with radial academic wings and auditorium." }, { wingCount: 4, addAuditorium: true, addHostels: true }),
  "shillong-diengpasoh-road": corridorModel({ title: "Hill road corridor", family: "road", summary: "Hill road section with curved access ramps and compact deck." }, { rampCount: 2, bridgeArch: true, scale: 1.01, streetLightCount: 3, vehicleCount: 2 }),
};

function fallbackModel(project) {
  const type = String(project?.type || "infrastructure").toLowerCase();

  if (type.includes("metro")) {
    return metroModel({ title: "Metro corridor", family: "metro", summary: "Fallback elevated metro massing." });
  }
  if (type.includes("hospital")) {
    return hospitalModel({ title: "Healthcare complex", family: "hospital", summary: "Fallback hospital massing." });
  }
  if (type.includes("rail")) {
    return railLineModel({ title: "Rail corridor", family: "railway", summary: "Fallback rail model." });
  }
  if (type.includes("road") || type.includes("highway")) {
    return corridorModel({ title: "Road corridor", family: "road", summary: "Fallback road corridor model." });
  }
  if (type.includes("airport")) {
    return airportModel({ title: "Airport terminal", family: "airport", summary: "Fallback airport model." });
  }
  if (type.includes("port")) {
    return portModel({ title: "Harbour node", family: "port", summary: "Fallback harbour model." });
  }
  if (type.includes("wastewater")) {
    return wastewaterModel({ title: "Treatment plant", family: "wastewater", summary: "Fallback wastewater facility." });
  }
  if (type.includes("education")) {
    return campusModel({ title: "Campus complex", family: "education", summary: "Fallback campus model." });
  }
  if (type.includes("infrastructure") || type.includes("transport") || type.includes("utilities")) {
    return mobilityHubCampusModel(
      {
        title: project?.name || "Civic hub",
        family: "civic",
        summary: "Fallback civic hub with atrium, plaza edge, and landscaped frontage.",
      },
      { addBusBays: false, scale: 1.04, floorRadius: 5 }
    );
  }

  return modelBase(
    {
      title: project?.name || "Civic structure",
      family: "civic",
      summary: "Fallback civic building with layered facade, glazed entrance, and site landscaping.",
    },
    [
      box("asphalt", [0, -0.94, 0], [6.6, 0.16, 6.4]),
      box("concrete", [0, -0.8, 0.15], [4.9, 0.14, 4.2]),
      box("facade", [0, -0.14, 0.1], [2.6, 1.05, 1.75]),
      box("roof", [0, 0.48, 0.1], [2.86, 0.08, 1.95]),
      box("glass", [0, 0.1, 0.92], [1.76, 0.52, 0.12]),
      box("facade", [-1.86, -0.2, -0.12], [1.18, 0.9, 2.5]),
      box("roof", [-1.86, 0.28, -0.12], [1.32, 0.08, 2.68]),
      box("facade", [1.86, -0.2, -0.12], [1.18, 0.9, 2.5]),
      box("roof", [1.86, 0.28, -0.12], [1.32, 0.08, 2.68]),
      windowBand([-1.86, 0.12, 1.14], [0.82, 0.18, 0.12]),
      windowBand([-1.86, 0.12, -1.12], [0.82, 0.18, 0.12]),
      windowBand([1.86, 0.12, 1.14], [0.82, 0.18, 0.12]),
      windowBand([1.86, 0.12, -1.12], [0.82, 0.18, 0.12]),
      box("landscape", [0, -0.86, -2.15], [5.6, 0.04, 1.1]),
      ...tree([-2.36, -0.86, 2.28], 0.92),
      ...tree([2.36, -0.86, 2.28], 0.92),
      ...tree([-2.62, -0.86, -2.1], 0.9),
      ...tree([2.62, -0.86, -2.1], 0.9),
    ]
  );
}

export function getProjectModelSpec(project) {
  if (!project) {
    return fallbackModel(null);
  }

  return savedProjectModels[project.id] || fallbackModel(project);
}

export const projectModelCatalog = savedProjectModels;
