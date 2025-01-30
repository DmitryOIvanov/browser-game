export function createAttackProfile(damage, overkillFactor, freePierce){
    return {
        damage: damage,
        overkillFactor: overkillFactor,
        freePierce: freePierce,
        expired: false
};
}

export function createDefenseProfile(hp){
    return {
        maxHP: hp,
        hp: hp,
        expired: false
    };
}

export function attackAndDefend(attackProfile, defenseProfile){
    defenseProfile.hp -= attackProfile.damage;
    if(defenseProfile.hp <= 0){
        defenseProfile.expired = true;
    }
    if(attackProfile.freePierce > 0){
        attackProfile.freePierce--;
    }else{
        attackProfile.damage -= attackProfile.overkillFactor * defenseProfile.maxHP;
        if(attackProfile.damage <= 0){
            attackProfile.expired = true;
        }
    }
}