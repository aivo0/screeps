import { ErrorMapper } from "utils/ErrorMapper";
import { roleHarvester } from "./role.harvester";
import { roleUpgrader } from "./role.upgrader";
import { roleBuilder } from "./role.builder";
import { roleAttacker } from "./role.attacker";
import { roleClaimer } from "./role.claimer"

// One part costs 50. Finds an optimal part structure
const idealHarvester = (capacity: number): BodyPartConstant[] => {
  const remainder = capacity % 200;
  const equalAmount = (capacity - remainder) / 200;
  const extraMoveCost = (remainder >= 50) ? (remainder - 50) : 0;
  const extraCarry = (remainder - extraMoveCost) / 50;
  return Array(equalAmount).fill(WORK).concat(
    Array(equalAmount + extraCarry).fill(CARRY),
    Array(equalAmount + Math.floor(extraMoveCost / 50)).fill(MOVE)
  );
};

const idealUpgrader = (capacity: number): BodyPartConstant[] => {
  const remainder = capacity % 200;
  const equalAmount = (capacity - remainder) / 200;
  const extraMoveCost = remainder % 100;
  const extraWork = (remainder - extraMoveCost) / 100;
  return Array(equalAmount + extraWork).fill(WORK).concat(
    Array(equalAmount).fill(CARRY),
    Array(equalAmount + Math.floor(extraMoveCost / 50)).fill(MOVE)
  );
};

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // console.log(`Current game tick is ${Game.time}`);

  // Automatically delete memory of missing creeps
  let harvesterCount: RoleCount<number> = {};
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
      continue;
    }
    // Assing role-appropriate behaviour
    const creep = Game.creeps[name];

    // Initialize harvester counting
    if (!harvesterCount[creep.room.name]) { harvesterCount[creep.room.name] = 0; }
    // TODO: runtime error is thrown here if the creep is still spawning
    if (creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
      harvesterCount[creep.room.name]++;
    }
    else if (creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    }
    else if (creep.memory.role == 'builder') {
      roleBuilder.run(creep);
    }
    else if (creep.memory.role == 'attacker') {
      roleAttacker.run(creep);
    }
    else if (creep.memory.role == 'claimer') {
      roleClaimer.run(creep);
    }
  };
  // Plan out my rooms based on room's controller level
  // Loops only my rooms
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    const spawns = room.find(FIND_MY_SPAWNS)
    const level = room.controller?.level;

    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
      var username = hostiles[0].owner.username;
      Game.notify(`User ${username} spotted in room ${roomName}`);
      var towers = room.find(
        FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
      towers.forEach(tower => tower instanceof StructureTower ? tower.attack(hostiles[0]) : console.log("Tower not found"));
    }
    else {
      var towers = room.find(
        FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
      towers.forEach(tower => tower instanceof StructureTower ? towerRepair(tower) : console.log("Tower not found"));
    }
    function towerRepair(tower: StructureTower): void {
      if (tower.store.getFreeCapacity(RESOURCE_ENERGY) < tower.store.getUsedCapacity(RESOURCE_ENERGY)) {
        const repairTargets = tower.room.find(FIND_STRUCTURES, {
          filter: object => object.hits < object.hitsMax
        });
        repairTargets.sort((a, b) => a.hits - b.hits);
        tower.repair(repairTargets[0]);
      }
    }


    /*
    if (!Game.creeps['Claimer1']) {
      Game.spawns.Spawn1.spawnCreep([CLAIM, MOVE, MOVE],'Claimer1', {
        memory: { role: 'claimer', room: roomName, working: true }
      });
    }

    if (!Game.creeps['Attacker1']) {
      Game.spawns.Spawn1.spawnCreep([TOUGH, TOUGH, ATTACK,ATTACK,ATTACK,ATTACK, MOVE, MOVE],'Attacker1', {
        memory: { role: 'attacker', room: roomName, working: true }
      });
    }*/
    /*
    else if (!Game.creeps['Attacker2']) {
      Game.spawns.Spawn1.spawnCreep([TOUGH, TOUGH, ATTACK,ATTACK,ATTACK,ATTACK, MOVE, MOVE],'Attacker2', {
        memory: { role: 'attacker', room: roomName, working: true }
      });
    }*/

    if (!level) {
      console.log("level undefined");
    }
    else if (level === 1) {
      for (const spawnId in spawns) {
        const spawn = spawns[spawnId];
        // TODO: only call when it is possible to spawn
        if (!Game.creeps['Worker1' + roomName]) {
          spawn.spawnCreep(idealHarvester(room.energyCapacityAvailable), 'Worker1' + roomName, {
            memory: { role: 'harvester', room: roomName, working: true }
          });
        }
        else if (!Game.creeps['Worker2' + roomName]) {
          spawn.spawnCreep(idealHarvester(room.energyCapacityAvailable), 'Worker2' + roomName, {
            memory: { role: 'harvester', room: roomName, working: true }
          });
        }
        else if (!Game.creeps['Upgrader1' + roomName]) {
          spawn.spawnCreep(idealUpgrader(room.energyCapacityAvailable), 'Upgrader1' + roomName, {
            memory: { role: 'upgrader', room: roomName, working: true }
          });
        }
        else if (!Game.creeps['Upgrader2' + roomName]) {
          spawn.spawnCreep(idealUpgrader(room.energyCapacityAvailable), 'Upgrader2' + roomName, {
            memory: { role: 'upgrader', room: roomName, working: true }
          });
        }
        else if (!Game.creeps['Upgrader3' + roomName]) {
          spawn.spawnCreep(idealUpgrader(room.energyCapacityAvailable), 'Upgrader3' + roomName, {
            memory: { role: 'upgrader', room: roomName, working: true }
          });
        }
      }
    }
    else if (level > 1) {
      // TODO: automated extension placement
      // TODO: add a check whether extensions are ready and it is possible to
      // build bigger creeps
      // TODO: calculate the number of harvesting spots per source and consider it when sending
      // harvesters, builders, upgraders
      for (const spawnId in spawns) {
        const spawn = spawns[spawnId];
        const canBuild = spawn.room.find(FIND_CONSTRUCTION_SITES).length > 0;
        // TODO: only call when it is possible to spawn
        if (harvesterCount[roomName] === 0) {
          console.log("harvesters are dead");
          spawn.spawnCreep(idealHarvester(room.energyAvailable), 'Worker1' + roomName, {
            memory: { role: 'harvester', room: roomName, working: true }
          });
        }
        else if (!Game.creeps['Worker1' + roomName]) {
          spawn.spawnCreep(idealHarvester(room.energyCapacityAvailable), 'Worker1' + roomName, {
            memory: { role: 'harvester', room: roomName, working: true }
          });
        }
        else if (!Game.creeps['Worker2' + roomName]) {
          spawn.spawnCreep(idealHarvester(room.energyCapacityAvailable), 'Worker2' + roomName, {
            memory: { role: 'harvester', room: roomName, working: true }
          });
        }
        else if (!Game.creeps['Builder1' + roomName] && canBuild) {
          spawn.spawnCreep(idealUpgrader(room.energyCapacityAvailable), 'Builder1' + roomName, {
            memory: { role: 'builder', room: roomName, working: true, sourcePrio: 1 }
          });
        }
        else if (!Game.creeps['Builder2' + roomName] && canBuild) {
          spawn.spawnCreep(idealUpgrader(room.energyCapacityAvailable), 'Builder2' + roomName, {
            memory: { role: 'builder', room: roomName, working: true, sourcePrio: 1 }
          });
        }
        else if (!Game.creeps['Upgrader1' + roomName]) {
          spawn.spawnCreep(idealUpgrader(room.energyCapacityAvailable), 'Upgrader1' + roomName, {
            memory: { role: 'upgrader', room: roomName, working: true }
          });
        }
        else if (!Game.creeps['Upgrader2' + roomName]) {
          spawn.spawnCreep(idealUpgrader(room.energyCapacityAvailable), 'Upgrader2' + roomName, {
            memory: { role: 'upgrader', room: roomName, working: true }
          });
        }
        else if (!Game.creeps['Upgrader3' + roomName]) {
          spawn.spawnCreep(idealUpgrader(room.energyCapacityAvailable), 'Upgrader3' + roomName, {
            memory: { role: 'upgrader', room: roomName, working: true }
          });
        }
        else if (!Game.creeps['Upgrader4' + roomName]) {
          spawn.spawnCreep(idealUpgrader(room.energyCapacityAvailable), 'Upgrader4' + roomName, {
            memory: { role: 'upgrader', room: roomName, working: true }
          });
        }
      }
    }
  };
}
);
