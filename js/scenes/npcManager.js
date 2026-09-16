/**
 * ============================================================================
 * NPC 3D AVATAR BUILDER & MANAGER
 * ============================================================================
 */

/* global THREE */

import { NPCS_DATA } from '../data/dialogueData.js';

export class NPCManager {
  constructor(game) {
    this.game = game;
    this.activeNpcs = [];
  }

  /**
   * Spawns NPCs configured for the specified zone
   * @param {string} zoneId
   */
  spawnNpcsForZone(zoneId) {
    this.activeNpcs = [];
    Object.values(NPCS_DATA).forEach(npcData => {
      if (npcData.zone === zoneId) {
        const npcGroup = this.buildNpcAvatar(npcData);
        npcGroup.position.set(npcData.position.x, npcData.position.y || 0, npcData.position.z);
        if (npcData.rotationY) npcGroup.rotation.y = npcData.rotationY;

        this.game.scene.add(npcGroup);
        this.activeNpcs.push({
          data: npcData,
          meshGroup: npcGroup,
          time: Math.random() * 10
        });

        // Register NPC as an interactable object
        npcGroup.userData.isNpc = true;
        npcGroup.userData.npcId = npcData.id;
        npcGroup.userData.vocabData = {
          chinese: npcData.chinese,
          pinyin: npcData.pinyin,
          nameVi: npcData.role,
          category: 'Nhân vật (NPC)'
        };
        npcGroup.traverse(c => {
          c.userData.rootGroup = npcGroup;
          c.userData.isNpc = true;
          c.userData.npcId = npcData.id;
        });
        this.game.interactiveObjects.push(npcGroup);

        // Add small collision box
        if (this.game.colliders) {
          this.game.colliders.push({
            name: `npc_${npcData.id}`,
            minX: npcData.position.x - 0.45,
            maxX: npcData.position.x + 0.45,
            minZ: npcData.position.z - 0.45,
            maxZ: npcData.position.z + 0.45
          });
        }
      }
    });
  }

  buildNpcAvatar(npcData) {
    const group = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbd09b, roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    const clothesMat = new THREE.MeshStandardMaterial({ color: npcData.avatarColor || 0x2563eb, roughness: 0.5 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.48, 0.26), clothesMat);
    torso.position.y = 0.84;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.20, 20, 20), skinMat);
    head.position.set(0, 1.25, 0);
    head.castShadow = true;
    group.add(head);

    // Hair
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
    hair.position.set(0, 1.28, -0.01);
    group.add(hair);

    // Eyes
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeMat);
      eye.position.set(side * 0.07, 1.25, 0.18);
      group.add(eye);
    }

    // Arms
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.26, 1.04, 0);
    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.36, 10), clothesMat);
    rightArm.position.y = -0.18;
    rightArmGroup.add(rightArm);
    group.add(rightArmGroup);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.26, 1.04, 0);
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.36, 10), clothesMat);
    leftArm.position.y = -0.18;
    leftArmGroup.add(leftArm);
    group.add(leftArmGroup);

    // Legs
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.52, 10), pantsMat);
      leg.position.set(side * 0.12, 0.34, 0);
      leg.castShadow = true;
      group.add(leg);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.18), shoeMat);
      shoe.position.set(side * 0.12, 0.05, 0.03);
      group.add(shoe);
    }

    // Shadow
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.36, 20),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.015;
    group.add(shadow);

    group.userData.rightArm = rightArmGroup;
    group.userData.leftArm = leftArmGroup;
    group.userData.head = head;
    group.userData.torso = torso;

    return group;
  }

  update(delta) {
    this.activeNpcs.forEach(npc => {
      npc.time += delta;
      const mesh = npc.meshGroup;
      if (!mesh || !mesh.userData) return;

      // Gentle breathing motion
      const breathe = Math.sin(npc.time * 2.0) * 0.01;
      if (mesh.userData.torso) mesh.userData.torso.position.y = 0.84 + breathe;
      if (mesh.userData.head) mesh.userData.head.position.y = 1.25 + breathe;

      // Friendly subtle hand wave on right arm
      if (mesh.userData.rightArm) {
        mesh.userData.rightArm.rotation.z = 0.15 + Math.sin(npc.time * 2.5) * 0.18;
        mesh.userData.rightArm.rotation.x = Math.sin(npc.time * 1.5) * 0.08;
      }
    });
  }
}
