import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PropertiesPage } from './pages/PropertiesPage';
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
          <Route
            path="/"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/properties"
            element={
              <Layout>
                <PropertiesPage />
              </Layout>
            }
          />
          <Route
            path="/properties/:id"
            element={
              <Layout>
                <PropertiesPage />
              </Layout>
            }
          />
          <Route
            path="/maintenance"
            element={
              <Layout>
                <Maintenance />
              </Layout>
            }
          />
          <Route
            path="/maintenance/:id"
            element={
              <Layout>
                <Maintenance />
              </Layout>
            }
          />
          <Route
            path="/providers"
            element={
              <Layout>
                <Providers />
              </Layout>
            }
          />
          <Route
            path="/providers/:id"
            element={
              <Layout>
                <Providers />
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout>
                <Settings />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;
