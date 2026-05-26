import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Profile from './pages/Profile'
import Classroom from './pages/Classroom'
import Quiz from './pages/Quiz'
import PBQ from './pages/PBQ'
import Tutor from './pages/Tutor'
import Progress from './pages/Progress'
import Flashcards from './pages/Flashcards'
import LPI1Room from './pages/LPI1Room'
import LinuxPlusRoom from './pages/LinuxPlusRoom'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'

function isOnboardingComplete(): boolean {
  return localStorage.getItem('trygit_onboarding_complete') === 'true'
}

// Wrapper that checks onboarding before showing content
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isOnboardingComplete()) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Onboarding is outside Layout — full screen, no sidebar */}
      <Route path="/onboarding" element={<OnboardingFlow />} />

      {/* All routes inside Layout */}
      <Route element={<Layout />}>
        {/* / renders Classroom DIRECTLY (no redirect) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Classroom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classroom"
          element={
            <ProtectedRoute>
              <Classroom />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/pbq" element={<PBQ />} />
        <Route path="/tutor" element={<Tutor />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/lpi1" element={<LPI1Room />} />
        <Route path="/linux-plus" element={<LinuxPlusRoom />} />
      </Route>
    </Routes>
  )
}
