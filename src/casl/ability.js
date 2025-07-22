// import { createMongoAbility } from '@casl/ability';

// export const ability = createMongoAbility([]);

// // Function to update ability
// export const updateAbility = permissions => {
//   ability.update(permissions);
// };

import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export const ability = new createMongoAbility();

export function updateAbility(permissions) {
  const { can, rules } = new AbilityBuilder(createMongoAbility);

  permissions.forEach(perm => {
    can(perm.action, perm.subject);
  });

  ability.update(rules);
}
