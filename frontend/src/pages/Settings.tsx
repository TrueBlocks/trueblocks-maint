import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  Group,
  Button,
  Switch,
  Select,
  TextInput,
  Tabs,
  Divider,
} from '@mantine/core';
import { useState, useEffect } from 'react';

export function Settings() {
  const [settings, setSettings] = useState({
    defaultProperty: '',
    soundEnabled: true,
    theme: 'light',
    emailAlerts: true,
    daysBeforeDue: '7',
    email: 'user@example.com',
  });

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('maint-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('maint-settings', JSON.stringify(settings));
    alert('Settings saved!');
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title>Settings</Title>
          <Text c="dimmed">Configure application preferences.</Text>
        </div>

        <Tabs defaultValue="general">
          <Tabs.List>
            <Tabs.Tab value="general">General</Tabs.Tab>
            <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
            <Tabs.Tab value="data">Data & Storage</Tabs.Tab>
            <Tabs.Tab value="advanced">Advanced</Tabs.Tab>
          </Tabs.List>

          {/* General Tab */}
          <Tabs.Panel value="general" pt="lg">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="lg">
                <div>
                  <Text fw={500} mb="sm">
                    Theme
                  </Text>
                  <Select
                    value={settings.theme}
                    onChange={(val) => setSettings({ ...settings, theme: val || 'light' })}
                    data={[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                    ]}
                    w={150}
                  />
                </div>

                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Sound Notifications</Text>
                    <Text size="sm" c="dimmed">
                      Play sounds for maintenance alerts
                    </Text>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onChange={(e) => setSettings({ ...settings, soundEnabled: e.currentTarget.checked })}
                  />
                </Group>

                <Divider />

                <Group justify="flex-end">
                  <Button onClick={handleSave}>Save</Button>
                </Group>
              </Stack>
            </Card>
          </Tabs.Panel>

          {/* Notifications Tab */}
          <Tabs.Panel value="notifications" pt="lg">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="lg">
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Email Alerts</Text>
                    <Text size="sm" c="dimmed">
                      Send email notifications for upcoming maintenance
                    </Text>
                  </div>
                  <Switch
                    checked={settings.emailAlerts}
                    onChange={(e) =>
                      setSettings({ ...settings, emailAlerts: e.currentTarget.checked })
                    }
                  />
                </Group>

                <TextInput
                  label="Email Address"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.currentTarget.value })}
                />

                <div>
                  <Text fw={500} mb="sm">
                    Days Before Due
                  </Text>
                  <TextInput
                    type="number"
                    value={settings.daysBeforeDue}
                    onChange={(e) => setSettings({ ...settings, daysBeforeDue: e.currentTarget.value })}
                    w={100}
                  />
                </div>

                <Divider />

                <Group justify="flex-end">
                  <Button onClick={handleSave}>Save</Button>
                </Group>
              </Stack>
            </Card>
          </Tabs.Panel>

          {/* Data & Storage Tab */}
          <Tabs.Panel value="data" pt="lg">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="lg">
                <div>
                  <Text fw={500} size="sm">
                    Database Location
                  </Text>
                  <Text c="dimmed" size="sm">
                    ~/.local/share/trueblocks/maint/maint.db
                  </Text>
                </div>

                <div>
                  <Text fw={500} size="sm">
                    Database Size
                  </Text>
                  <Text c="dimmed" size="sm">
                    2.3 MB
                  </Text>
                </div>

                <div>
                  <Text fw={500} size="sm">
                    Last Backup
                  </Text>
                  <Text c="dimmed" size="sm">
                    {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                  </Text>
                </div>

                <Divider />

                <Group>
                  <Button variant="light">Backup Now</Button>
                  <Button variant="light">Restore...</Button>
                </Group>
              </Stack>
            </Card>
          </Tabs.Panel>

          {/* Advanced Tab */}
          <Tabs.Panel value="advanced" pt="lg">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="lg">
                <div>
                  <Text fw={500} mb="sm">
                    Advanced Options
                  </Text>
                </div>

                <Group>
                  <Button
                    variant="light"
                    color="orange"
                    onClick={() => {
                      if (confirm('This will clear all window state. Continue?')) {
                        localStorage.clear();
                        location.reload();
                      }
                    }}
                  >
                    Clear Window State
                  </Button>
                </Group>

                <Group>
                  <Button
                    variant="light"
                    color="red"
                    onClick={() => {
                      if (confirm('This will reset all settings to defaults. Continue?')) {
                        localStorage.removeItem('maint-settings');
                        location.reload();
                      }
                    }}
                  >
                    Reset All Settings
                  </Button>
                </Group>

                <Divider />

                <div>
                  <Text fw={500} size="sm">
                    Version
                  </Text>
                  <Text c="dimmed" size="sm">
                    Maint v1.0.0
                  </Text>
                </div>
              </Stack>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
