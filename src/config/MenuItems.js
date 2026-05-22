import { 
  LayoutGrid, UserRoundCog, UsersRound, MessageCircle, Bell, 
  Building2, FileCheckCorner, ChartColumn, 
} from 'lucide-react';

export const MENU_ITEMS = [
  { icon: LayoutGrid, path: '/projectsdashboard', label: 'Dashboard' },
  { icon: UserRoundCog, path: '/accountsmanage', label: 'User Accounts Management' },
  { icon: UsersRound, path: '/studentteams', label: 'StudentTeams' },
  { icon: MessageCircle, path: '/chat', label: 'Chat' },
  { icon: Bell, path: '/notifications', label: 'Notifications' },
  { icon: Building2, path: '/academicentitymanagement', label: 'Academic Entity Management' },
  { icon: FileCheckCorner, path: '/proposalreviewandapproval', label: 'Proposal Review & Approval' },
  { icon: ChartColumn, path: '/statistics', label: 'Statistics' },
];