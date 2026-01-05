import { User, Badge } from '../types/User.js';

export const BADGES_DEFINITIONS = [
  {
    id: 'novice',
    name: 'Novice',
    description: 'Terminer votre première tâche',
    icon: '🌟',
    condition: (user: User) => user.completedTasks >= 1,
  },
  {
    id: 'intermediate',
    name: 'Intermédiaire',
    description: 'Terminer 10 tâches',
    icon: '🚀',
    condition: (user: User) => user.completedTasks >= 10,
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Terminer 100 tâches',
    icon: '🏆',
    condition: (user: User) => user.completedTasks >= 100,
  },
  {
    id: 'on_fire',
    name: 'On Fire',
    description: 'Atteindre une série de 3 jours',
    icon: '🔥',
    condition: (user: User) => user.streak >= 3,
  },
  {
    id: 'unstoppable',
    name: 'Inarrêtable',
    description: 'Atteindre une série de 7 jours',
    icon: '⚡',
    condition: (user: User) => user.streak >= 7,
  },
  {
    id: 'level_5',
    name: 'Niveau 5',
    description: 'Atteindre le niveau 5',
    icon: '🎖️',
    condition: (user: User) => user.level >= 5,
  },
  {
    id: 'level_10',
    name: 'Niveau 10',
    description: 'Atteindre le niveau 10',
    icon: '👑',
    condition: (user: User) => user.level >= 10,
  },
  // Friend system ?
  // {
  //   id: 'social_butterfly',
  //   name: 'Papillon social',
  //   description: 'Inviter 5 amis',
  //   icon: '🦋',
  //   condition: (user: User) => (user.friendsInvited || 0) >= 5,
  // },
  {
    id: 'marathoner',
    name: 'Marathonien',
    description: 'Atteindre une série de 100 jours',
    icon: '🏃‍♂️',
    condition: (user: User) => user.streak >= 100,
  },
  // use task time data ?
  // {
  //   id: 'early_bird',
  //   name: 'Lève-tôt',
  //   description: 'Terminer une tâche avant 6h du matin',
  //   icon: '🌅',
  //   condition: (user: User) => user.earlyTasksCompleted >= 1,
  // },
];

export function checkNewBadges(user: User): Badge[] {
  const newBadges: Badge[] = [];
  const ownedBadgeIds = new Set((user.badges || []).map(b => b.id));

  for (const def of BADGES_DEFINITIONS) {
    if (!ownedBadgeIds.has(def.id) && def.condition(user)) {
      newBadges.push({
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        obtainedAt: new Date()
      });
    }
  }
  return newBadges;
}
