import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { GatewayList } from './pages/gateway/GatewayList'
import { ToolList } from './pages/tool/ToolList'
import { ProtocolList } from './pages/protocol/ProtocolList'
import { AuthList } from './pages/auth/AuthList'
import { TestGateway } from './pages/test/TestGateway'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/gateway" element={<GatewayList />} />
        <Route path="/tool" element={<ToolList />} />
        <Route path="/protocol" element={<ProtocolList />} />
        <Route path="/auth" element={<AuthList />} />
        <Route path="/test" element={<TestGateway />} />
        <Route path="*" element={<Navigate to="/gateway" replace />} />
      </Route>
    </Routes>
  )
}

export default App
