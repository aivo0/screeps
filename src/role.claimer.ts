export const roleClaimer = {

    run: function(creep: Creep) {
        if (creep.room.name === "W49S46") {
            creep.moveTo(49,28);
          }
          else {
            if(creep.room.controller && creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
            if(creep.room.controller && !creep.room.controller.my) {
                if(creep.attackController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
            creep.say('GL HF!', true);
          }
    }
};
