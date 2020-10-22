export const roleAttacker = {

    run: function(creep: Creep) {
        if (creep.room.name === "W49S46") {
            creep.moveTo(15,49);
          }
          else {
            const enemyCreep= creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            const enemySpawns= creep.room.find(FIND_HOSTILE_SPAWNS);
            if (enemyCreep) {
                if(creep.attack(enemyCreep) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(enemyCreep);
                }
            }
            else if (creep.attack(enemySpawns[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(enemySpawns[0]);
            }
            creep.say('GL HF!', true);
          }
    }
};
