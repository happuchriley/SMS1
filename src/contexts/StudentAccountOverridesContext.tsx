import { createContext, useCallback, useContext, useState } from 'react'
import type { StudentProfile } from '@/data/adminMock'

type ProfilePatch = Partial<
  Pick<StudentProfile, 'fullName' | 'gender' | 'currentClass' | 'status'> & {
    basic: Partial<StudentProfile['basic']>
    contact: Partial<StudentProfile['contact']>
    guardian: Partial<StudentProfile['guardian']>
    admin: Partial<StudentProfile['admin']>
  }
>

type StudentAccountOverridesContextValue = {
  getProfileOverride: (studentId: string) => ProfilePatch | undefined
  setProfileOverride: (studentId: string, patch: ProfilePatch) => void
  getPasswordOverride: (studentId: string) => string | undefined
  setPasswordOverride: (studentId: string, password: string) => void
}

const StudentAccountOverridesContext = createContext<StudentAccountOverridesContextValue | null>(null)

export function StudentAccountOverridesProvider({ children }: { children: React.ReactNode }) {
  const [profileOverrides, setProfileOverrides] = useState<Record<string, ProfilePatch>>({})
  const [passwordOverrides, setPasswordOverrides] = useState<Record<string, string>>({})

  const getProfileOverride = useCallback((studentId: string) => profileOverrides[studentId], [profileOverrides])
  const getPasswordOverride = useCallback((studentId: string) => passwordOverrides[studentId], [passwordOverrides])

  const setProfileOverride = useCallback((studentId: string, patch: ProfilePatch) => {
    setProfileOverrides((prev) => ({ ...prev, [studentId]: { ...prev[studentId], ...patch } }))
  }, [])

  const setPasswordOverride = useCallback((studentId: string, password: string) => {
    setPasswordOverrides((prev) => ({ ...prev, [studentId]: password }))
  }, [])

  return (
    <StudentAccountOverridesContext.Provider
      value={{
        getProfileOverride,
        setProfileOverride,
        getPasswordOverride,
        setPasswordOverride,
      }}
    >
      {children}
    </StudentAccountOverridesContext.Provider>
  )
}

export function useStudentAccountOverrides(): StudentAccountOverridesContextValue {
  const ctx = useContext(StudentAccountOverridesContext)
  if (!ctx) {
    return {
      getProfileOverride: () => undefined,
      setProfileOverride: () => {},
      getPasswordOverride: () => undefined,
      setPasswordOverride: () => {},
    }
  }
  return ctx
}

export function mergeProfileWithOverrides(
  profile: StudentProfile,
  profileOverride: ProfilePatch | undefined,
  passwordOverride: string | undefined
): StudentProfile {
  if (!profileOverride && passwordOverride === undefined) return profile
  const merged: StudentProfile = {
    ...profile,
    ...(profileOverride || {}),
    basic: { ...profile.basic, ...(profileOverride?.basic || {}) },
    contact: { ...profile.contact, ...(profileOverride?.contact || {}) },
    guardian: { ...profile.guardian, ...(profileOverride?.guardian || {}) },
    admin: { ...profile.admin, ...(profileOverride?.admin || {}) },
    ...(passwordOverride !== undefined ? { password: passwordOverride } : {}),
  }
  return merged
}
