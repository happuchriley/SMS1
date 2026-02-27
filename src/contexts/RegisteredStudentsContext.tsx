import { createContext, useCallback, useContext, useState } from 'react'
import type { StudentRow } from '@/data/adminMock'

type RegisteredStudentsContextValue = {
  registeredStudents: StudentRow[]
  addRegisteredStudent: (student: Omit<StudentRow, 'no'>) => void
}

const RegisteredStudentsContext = createContext<RegisteredStudentsContextValue | null>(null)

export function RegisteredStudentsProvider({ children }: { children: React.ReactNode }) {
  const [registeredStudents, setRegisteredStudents] = useState<StudentRow[]>([])

  const addRegisteredStudent = useCallback((student: Omit<StudentRow, 'no'>) => {
    setRegisteredStudents((prev) => {
      const no = prev.length + 1
      return [...prev, { ...student, no }]
    })
  }, [])

  return (
    <RegisteredStudentsContext.Provider value={{ registeredStudents, addRegisteredStudent }}>
      {children}
    </RegisteredStudentsContext.Provider>
  )
}

export function useRegisteredStudents(): RegisteredStudentsContextValue {
  const ctx = useContext(RegisteredStudentsContext)
  if (!ctx) {
    return {
      registeredStudents: [],
      addRegisteredStudent: () => {},
    }
  }
  return ctx
}
