import {
  BookOpen,
  ChartNoAxesCombined,
  House,
  MessageCircle,
  Settings2,
  UserRound,
  UsersRound,
  Globe2,
} from 'lucide-react';
export const navigation = [
  { key: 'dashboard', href: '/dashboard', icon: House, group: 'learning' },
  { key: 'courses', href: '/courses', icon: BookOpen, group: 'learning' },
  {
    key: 'progress',
    href: '/progress',
    icon: ChartNoAxesCombined,
    group: 'learning',
  },
  { key: 'friends', href: '/friends', icon: UsersRound, group: 'connect' },
  { key: 'community', href: '/community', icon: Globe2, group: 'connect' },
  { key: 'chats', href: '/chats', icon: MessageCircle, group: 'connect' },
  { key: 'profile', href: '/profile', icon: UserRound, group: 'account' },
  { key: 'settings', href: '/settings', icon: Settings2, group: 'account' },
] as const;
export type NavigationKey = (typeof navigation)[number]['key'];
export const mobileKeys: NavigationKey[] = [
  'dashboard',
  'courses',
  'community',
  'chats',
  'profile',
];
