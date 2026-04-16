import { AppShell, Box, Text, Stack, Button, Group, Container } from '@mantine/core';
import { IconDashboard, IconBox, IconToolsOff, IconUserCheck, IconSettings } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './Layout.css';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  route: string;
  hotkey: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <IconDashboard size={20} />, route: '/', hotkey: 'Cmd+1' },
  { label: 'Properties', icon: <IconBox size={20} />, route: '/properties', hotkey: 'Cmd+2' },
  { label: 'Maintenance', icon: <IconToolsOff size={20} />, route: '/maintenance', hotkey: 'Cmd+3' },
  { label: 'Providers', icon: <IconUserCheck size={20} />, route: '/providers', hotkey: 'Cmd+4' },
  { label: 'Settings', icon: <IconSettings size={20} />, route: '/settings', hotkey: 'Cmd+5' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      const key = e.key;

      if (isMeta && key >= '1' && key <= '5') {
        e.preventDefault();
        const index = parseInt(key) - 1;
        if (index < navItems.length) {
          navigate(navItems[index].route);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <AppShell
      layout="default"
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: true } }}
      withBorder={false}
    >
      <AppShell.Navbar p="md" className="navbar">
        <Stack gap="sm">
          {navItems.map((item) => (
            <Button
              key={item.route}
              variant={location.pathname === item.route ? 'filled' : 'subtle'}
              onClick={() => navigate(item.route)}
              leftSection={item.icon}
              justify="flex-start"
              fullWidth
              className="nav-button"
            >
              <Group justify="space-between" grow>
                <Text>{item.label}</Text>
                <Text size="xs" opacity={0.6}>
                  {item.hotkey}
                </Text>
              </Group>
            </Button>
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main className="main-content">{children}</AppShell.Main>
    </AppShell>
  );
}
