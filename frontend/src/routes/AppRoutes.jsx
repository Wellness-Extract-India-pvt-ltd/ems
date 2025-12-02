import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import RequireAuth from '../auth/routes/RequireAuth';
import RequireRole from '../auth/routes/RequireRole';

import AuthRedirectHandler from '../auth/components/AuthRedirectHandler.jsx';
import AppLayout from '../layouts/AppLayout';
import DetailLayout from '../layouts/DetailLayout';
import Dashboard from '../pages/Dashboard'
import EmployeePage from '../pages/EmployeePage'
import AssetPage from '../pages/AssetsPage'
import EmployeeDetailsPage from '../pages/EmployeeDetailPage';
import AssignedAssets from '../components/Employees/EmployeeDetails/AssignedAssets';
import EmployeeLicenses from '../components/Employees/EmployeeDetails/Licenses'
import EmployeeTickets from '../components/Employees/EmployeeDetails/Tickets'
import Licenses from '../components/Employees/EmployeeDetails/Licenses';
import Tickets from '../components/Employees/EmployeeDetails/Tickets';
import LoginPage from '../components/LoginPage';
import SoftwarePage from '../pages/SoftwarePage';
import SoftwareDetailPage from '../pages/SoftwareDetailPage';
import TicketsPage from '../pages/TicketsPage';
import TicketDetailPage from '../pages/TicketDetailPage';
import LicensesPage from '../pages/LicensesPage';
import LicenseDetailPage from '../pages/LicenseDetailPage';
import AssetDetailPage from '../pages/AssetDetailPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import IntegrationsPage from '../pages/IntegrationsPage';
import SettingsPage from '../pages/SettingsPage';
import AddEmployeePage from '../pages/AddEmployeePage';

const AppRoutes = () => (
        <Router>
            <Routes>
                <Route path="/auth/redirect" element={<AuthRedirectHandler />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path='/login' element={<LoginPage />} />
                <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/employees" element={<RequireRole roles={['admin', 'manager']}><EmployeePage /></RequireRole>} />
                    <Route path="/employees/add" element={<RequireRole roles={['admin']}><AddEmployeePage /></RequireRole>} />
                    <Route path="/assets" element={<AssetPage />} />
                    <Route path="/assets/:id" element={<AssetDetailPage />} />
                    <Route path="/software" element={<SoftwarePage />} />
                    <Route path="/software/:id" element={<SoftwareDetailPage />} />
                    <Route path="/licenses" element={<LicensesPage />} />
                    <Route path="/licenses/:id" element={<LicenseDetailPage />} />
                    <Route path="/tickets" element={<TicketsPage />} />
                    <Route path="/tickets/:id" element={<TicketDetailPage />} />
                    <Route path="/audit-logs" element={<AuditLogsPage />} />
                    <Route path="integrations" element={<RequireRole roles={['admin', 'manager']}><IntegrationsPage /></RequireRole>} />
                    <Route path="/settings" element={<RequireRole roles={['admin']}><SettingsPage /></RequireRole>} />
                </Route>
                <Route element={<RequireAuth><DetailLayout /></RequireAuth>}>
                    <Route path="/employees/:id" element={<EmployeeDetailsPage />} >
                        <Route index element={<Navigate to="assets" replace />} />
                        <Route path="assets" element={<AssignedAssets />} />
                        <Route path="licenses" element={<EmployeeLicenses />} />
                        <Route path="tickets" element={<EmployeeTickets />} />
                    </Route>
                </Route>

                <Route path="*" element={<div className="p-6">404 - Page Not Found</div>} />
            </Routes>
        </Router>
    );

export default AppRoutes;