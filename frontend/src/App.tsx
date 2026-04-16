import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PropertiesPage } from './pages/PropertiesPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { ProvidersPage } from './pages/ProvidersPage';
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
                <MaintenancePage />
              </Layout>
            }
          />
          <Route
            path="/maintenance/:id"
            element={
              <Layout>
                <MaintenancePage />
              </Layout>
            }
          />
          <Route
            path="/providers"
            element={
              <Layout>
                <ProvidersPage />
              </Layout>
            }
          />
          <Route
            path="/providers/:id"
            element={
              <Layout>
                <ProvidersPage />
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
