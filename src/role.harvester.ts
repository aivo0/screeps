import { worker } from "cluster";

export const roleHarvester = {

    // Fun fact: harvesting distance is 1
    run: function(creep: Creep) {
        if(creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
            creep.say('Drop off');
        }
        if(!creep.memory.working) {
            var source = creep.pos.findClosestByRange(FIND_SOURCES, {
                filter: (structure: Source) => {
                    return (structure.energy > 0 );
                }
            });
            if(source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure: AnyStoreStructure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            // Only fill towers when spawns and extensions are filled
            if (targets.length === 0) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure: AnyStoreStructure) => {
                        return (structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
            }
            const targetPos = creep.pos.findClosestByPath(targets.map(x=>x.pos));
            const target = targets.filter(x=>x.pos === targetPos);
            if(target.length > 0) {
                if(creep.transfer(target[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target[0], {visualizePathStyle: {stroke: '#ffff00'}});
                }
            }
            else {
                creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0]);
            }
        }
    }
};
