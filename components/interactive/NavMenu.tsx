import {
  BookOpen,
  Bot,
  GraduationCap,
  HelpCircle,
  Link as LuLink,
  Puzzle,
  Rocket,
  Settings,
  SquareLibrary,
  User,
  Users,
  VenetianMask,
  Workflow,
} from 'lucide-react';
import { TbMessageCirclePlus } from 'react-icons/tb';
import { Item } from '../jrg/appwrapper/NavMain';

export const items: Item[] = [
  {
    title: 'New Chat',
    url: '/chat',
    icon: TbMessageCirclePlus,
    isActive: true,
  },
  {
    title: 'Agent Management',
    icon: Bot,
    items: [
      {
        title: 'Prompt Library',
        icon: SquareLibrary,
        url: '/settings/prompts',
      },
      {
        title: 'Chain Library',
        icon: LuLink,
        url: '/settings/chains',
      },
      {
        title: 'Training',
        icon: GraduationCap,
        url: '/settings/training',
        queryParams: {
          mode: 'user',
        },
      },
      {
        title: 'Extensions',
        icon: Puzzle,
        url: '/settings/extensions',
        queryParams: {
          tab: 'extensions',
          mode: 'user',
        },
      },
      {
        title: 'Abilities',
        icon: Workflow,
        url: '/settings/extensions',
        queryParams: {
          tab: 'abilities',
          mode: 'user',
        },
      },
      {
        title: 'Settings',
        icon: Settings,
        url: '/settings', // Still need to split off provider settings and add agent rename functionality on a new page
      },
    ],
  },
  {
    title: 'Team Management',
    icon: Users,
    items: [
      {
        title: 'Team',
        icon: User,
        url: '/team',
      },
      {
        title: 'Team Training',
        icon: GraduationCap,
        url: '/settings/training',
        queryParams: {
          mode: 'company',
        },
      },
      {
        title: 'Team Extensions',
        icon: Puzzle,
        url: '/settings/extensions',
        queryParams: {
          tab: 'extensions',
          mode: 'company',
        },
      },
      {
        title: 'Team Abilities',
        icon: Workflow,
        url: '/settings/extensions',
        queryParams: {
          tab: 'abilities',
          mode: 'company',
        },
      },
      {
        title: 'Team Settings',
        icon: Settings,
        url: '/settings',
        queryParams: {
          mode: 'company',
        },
      },
    ],
  },
  {
    title: 'Documentation',
    icon: BookOpen,
    items: [
      {
        title: 'Getting Started',
        icon: Rocket,
        url: '/docs/getting-started',
      },
      {
        title: 'API Reference',
        icon: BookOpen,
        url: '/docs/api-reference',
      },
      {
        title: 'Support',
        icon: HelpCircle,
        url: '/docs/support',
      },
      {
        title: 'Privacy Policy',
        icon: VenetianMask,
        url: '/docs/privacy',
      },
    ],
  },
];
