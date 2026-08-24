import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AppearanceProvider } from '@/context/AppearanceContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PublicRoute } from '@/components/auth/PublicRoute'

import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { LogoutConfirmPage } from '@/pages/LogoutConfirmPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { DesignSystemPage } from '@/pages/DesignSystemPage'

export function App() {
  return (
    <AppearanceProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Design System Ruleset Showcase */}
            <Route path="/design-system" element={<DesignSystemPage />} />

            {/* Public Auth Routes (Redirects to /dashboard if logged in) */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />

            {/* Logout Confirmation Screen */}
            <Route path="/logout-confirm" element={<LogoutConfirmPage />} />

            {/* Protected Dashboard Route (Redirects to /login if unauthenticated) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </AppearanceProvider>
  )
}

export default App
