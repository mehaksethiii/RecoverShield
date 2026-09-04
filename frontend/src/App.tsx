import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Simulation from './pages/Simulation';
import AuditTrail from './pages/AuditTrail';
import Copilot from './pages/Copilot';

import Policies from './pages/Policies';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="simulation" element={<Simulation />} />
          <Route path="policies" element={<Policies />} />
          <Route path="audit" element={<AuditTrail />} />
          <Route path="copilot" element={<Copilot />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
