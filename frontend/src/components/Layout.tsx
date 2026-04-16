import { AppShell, Box, Text, Stack, Button, Group, Container, Divider } from '@mantine/core';
import { IconDashboard, IconBox, IconToolsOff, IconUserCheck, IconCalendar, IconSettings } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { SaveWindowGeometry, SaveLastRoute, GetLastRoute } from '../hooks/useApi';
import './Layout.css';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  route: string;
  hotkey: string;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', icon: <IconDashboard size={20} />, route: '/', hotkey: 'Cmd+1' },
  { label: 'Properties', icon: <IconBox size={20} />, route: '/properties', hotkey: 'Cmd+2' },
  { label: 'Maintenance', icon: <IconToolsOff size={20} />, route: '/maintenance', hotkey: 'Cmd+3' },
  { label: 'Providers', icon: <IconUserCheck size={20} />, route: '/providers', hotkey: 'Cmd+4' },
  { label: 'Calendar', icon: <IconCalendar size={20} />, route: '/calendar', hotkey: 'Cmd+5' },
];

const settingsNav: NavItem = { label: 'Settings', icon: <IconSettings size={20} />, route: '/settings', hotkey: 'Cmd+6' };

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastHotkeyRef = useRef<string | null>(null);
  const lastHotkeyTimeRef = useRef<number>(0);
  const hasInitializedRef = useRef(false);

  // Load last route on app startup
  useEffect(() => {
    if (hasInitializedRef.current) return; // Only run once
    hasInitializedRef.current = true;

    const loadLastRoute = async () => {
      try {
        const lastRoute = await GetLastRoute();
        if (lastRoute && lastRoute !== '/') {
          navigate(lastRoute);
        }
      } catch (err) {
        console.error('Failed to load last route:', err);
      }
    };

    loadLastRoute();
  }, [navigate]);

  // Save route whenever location changes
  useEffect(() => {
    const saveRoute = async () => {
      try {
        await SaveLastRoute(location.pathname);
      } catch (err) {
        console.error('Failed to save route:', err);
      }
    };

    saveRoute();
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      // Handle Cmd+R for refresh
      if (isMeta && key === 'r') {
        e.preventDefault();
        window.location.reload();
        return;
      }

      // Handle Cmd+1-6 for navigation with cycling on double-tap
      if (isMeta && key >= '1' && key <= '6') {
        e.preventDefault();
        const allItems = [...mainNavItems, settingsNav];
        const index = parseInt(key) - 1;
        if (index < allItems.length) {
          const targetRoute = allItems[index].route;
          const now = Date.now();
          const timeSinceLastHotkey = now - lastHotkeyTimeRef.current;
          
          // If same hotkey pressed within 500ms, toggle list/detail
          if (lastHotkeyRef.current === key && timeSinceLastHotkey < 500) {
            const pathname = location.pathname;
            // If we're on the page's list, go to detail of first item
            if (pathname === targetRoute || !pathname.startsWith(targetRoute)) {
              navigate(`${targetRoute}/1`);
            } else {
              // If we're on detail, go back to list
              navigate(targetRoute);
            }
          } else {
            // First press - navigate to page list view
            navigate(targetRoute);
          }
          
          lastHotkeyRef.current = key;
          lastHotkeyTimeRef.current = now;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location]);

  // Save window geometry when window is resized or moved
  useEffect(() => {
    const handleWindowResize = () => {
      // Debounce the save to avoid excessive calls
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        try {
          SaveWindowGeometry(
            window.screenX,
            window.screenY,
            window.innerWidth,
            window.innerHeight
          );
        } catch (err) {
          console.error('Failed to save window geometry:', err);
        }
      }, 500);
    };

    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('move', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('move', handleWindowResize);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AppShell
      layout="default"
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: true } }}
      header={{ height: 60 }}
      footer={{ height: 50 }}
      withBorder={false}
    >
      <AppShell.Header p="md" className="app-header">
        <Group justify="space-between" h="100%">
          <Text fw={600} size="lg">Maint — House Maintenance Manager</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" className="navbar">
        <Stack gap="sm" justify="space-between" h="100%">
          <Stack gap="sm">
            {mainNavItems.map((item) => (
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

          <Stack gap="sm">
            <Divider />
            <Button
              variant={location.pathname === settingsNav.route ? 'filled' : 'subtle'}
              onClick={() => navigate(settingsNav.route)}
              leftSection={settingsNav.icon}
              justify="flex-start"
              fullWidth
              className="nav-button"
            >
              <Group justify="space-between" grow>
                <Text>{settingsNav.label}</Text>
                <Text size="xs" opacity={0.6}>
                  {settingsNav.hotkey}
                </Text>
              </Group>
            </Button>
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main className="main-content">{children}</AppShell.Main>

      <AppShell.Footer p="md" className="app-footer">
        <Group justify="space-between" h="100%">
          <Text size="xs" c="dimmed">
            Maint v1.0.0
          </Text>
          <Text size="xs" c="dimmed">
            {new Date().toLocaleDateString()}
          </Text>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}
