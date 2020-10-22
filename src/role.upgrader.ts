export const roleUpgrader = {

    // Fun fact: upgrade distance is 3
    /** @param {Creep} creep **/
    run: function(creep: Creep) {

        if(creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.working && creep.room.controller) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            var source = creep.pos.findClosestByRange(FIND_SOURCES, {
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
