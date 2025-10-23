import { Home, Building2, Wallet2, Coins, Lock, Shield, Activity, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Link, useLocation } from 'wouter';

export function AppSidebar() {
  const { t } = useTranslation();
  const [location] = useLocation();

  const items = [
    {
      title: t('nav.home'),
      url: '/',
      icon: Home,
    },
    {
      title: t('nav.originator'),
      url: '/originator',
      icon: Building2,
    },
    {
      title: t('nav.investor'),
      url: '/investor',
      icon: Wallet2,
    },
    {
      title: t('nav.stablecoin'),
      url: '/stablecoin',
      icon: Coins,
    },
    {
      title: t('nav.crossborder'),
      url: '/crossborder',
      icon: Globe,
    },
    {
      title: t('nav.custody'),
      url: '/custody',
      icon: Lock,
    },
    {
      title: t('nav.governance'),
      url: '/governance',
      icon: Shield,
    },
    {
      title: t('nav.transactions'),
      url: '/transactions',
      icon: Activity,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(252,95%,62%)] to-[hsl(270,85%,65%)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">AT</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold">AgroToken</h2>
            <p className="text-xs text-muted-foreground">Powered by Kaleido</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs uppercase tracking-wider">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.url === '/' ? 'home' : item.url.slice(1)}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
