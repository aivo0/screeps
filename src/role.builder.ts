export const roleBuilder = {

    run: function(creep: Creep) {

        if(creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
            creep.say('🚧 build');
        }

        if(creep.memory.working) {
            let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            const targetPos = creep.pos.findClosestByPath(targets.map(x=>x.pos));
            const target = targets.filter(x=>x.pos === targetPos);
            if(target.length > 0) {
                if(creep.build(target[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else {
                const towers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure: AnyStoreStructure) => {
                        return (structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
                if(towers.length > 0) {
                    if(creep.transfer(towers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(towers[0], {visualizePathStyle: {stroke: '#ffff00'}});
                    }
                }
                else {
                    const repairTargets = creep.room.find(FIND_STRUCTURES, {
                        filter: object => object.hits < object.hitsMax
                    });
                    repairTargets.sort((a,b) => a.hits - b.hits);
                    if(creep.repair(repairTargets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(repairTargets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }

        }
        else {
            var source = creep.pos.findClosestByPath(FIND_SOURCES, {
                filter: (structure: Source) => {
                    return (structure.energy > 0 );
                }
            });
            if(source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
};
