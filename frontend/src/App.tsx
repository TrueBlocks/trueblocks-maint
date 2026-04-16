import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Properties } from './pages/Properties';
import { Maintenance } from './pages/Maintenance';
import { Providers } from './pages/Providers';
import { Settings } from './pages/Settings';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './App.css';

function App() {
  return (
    <MantineProvider>
      <Notifications />
      <Router>
        <Routes>
          <Route element={<Layout><Dashboard /></Layout>} path="/" />
          <Route element={<Layout><Properties /></Layout>} path="/properties" />
          <Route element={<Layout><Maintenance /></Layout>} path="/maintenance" />
          <Route element={<Layout><Providers /></Layout>} path="/providers" />
          <Route element={<Layout><Settings /></Layout>} path="/settings" />
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;
