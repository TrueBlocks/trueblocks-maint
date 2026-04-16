import { Container, Title, Text, Card, Group, Stack, Grid } from '@mantine/core';

export function Dashboard() {
  return (
    <Container size="xl" py="xl">
      <Title>Dashboard</Title>
      <Text c="dimmed" mb="lg">
        At-a-glance overview of your properties and maintenance schedule.
      </Text>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Title order={3}>Total Properties</Title>
              <Text size="xl" fw={700}>
                3
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Title order={3}>Total Systems</Title>
              <Text size="xl" fw={700}>
                12
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Title order={3}>Overdue Tasks</Title>
              <Text size="xl" fw={700} c="red">
                2
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
