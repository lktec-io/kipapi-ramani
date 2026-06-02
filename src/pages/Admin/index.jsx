import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout      from './AdminLayout.jsx'
import AdminDashboard   from './AdminDashboard/index.jsx'
import UploadPlan       from './UploadPlan/index.jsx'
import ManageOrders     from './ManageOrders/index.jsx'

export default function AdminPage() {
  return (
    <AdminLayout>
      <Routes>
        <Route index          element={<AdminDashboard />} />
        <Route path="upload"  element={<UploadPlan />} />
        <Route path="orders"  element={<ManageOrders />} />
        <Route path="*"       element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  )
}
