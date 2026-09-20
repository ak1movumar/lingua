type Id = number | string;
export const queryKeys = {
  notifications: ['notifications'] as const,
  languages: ['languages'] as const,
  me: ['me'] as const,
  users: ['users'] as const,
  user: (id: Id) => ['user', id] as const,
  friends: ['friends'] as const,
  friendRequests: ['friendRequests'] as const,
  chats: ['chats'] as const,
  chat: (id: Id) => ['chat', id] as const,
  chatMembers: (id: Id) => ['chatMembers', id] as const,
  messages: (id: Id) => ['messages', id] as const,
  reactions: (chatId: Id, messageId: Id) =>
    ['reactions', chatId, messageId] as const,
  courses: ['courses'] as const,
  course: (id: Id) => ['course', id] as const,
  lessons: (courseId: Id) => ['lessons', courseId] as const,
  progress: ['progress'] as const,
  lesson: (id: Id) => ['lesson', id] as const,
  exercises: (id: Id) => ['exercises', id] as const,
  xp: (id: Id) => ['xp', id] as const,
  streak: (id: Id) => ['streak', id] as const,
};
