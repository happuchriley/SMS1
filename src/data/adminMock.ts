export const studentStats = {
  total: 335,
  active: 272,
  inactive: 63,
  new: 1,
}

export const staffStats = {
  total: 28,
  active: 28,
  inactive: 0,
  new: 1,
}

export const classStatistics = [
  { id: '1', name: 'Basic 2', onRoll: 25 },
  { id: '2', name: 'Basic 3', onRoll: 26 },
  { id: '3', name: 'KG 2', onRoll: 31 },
  { id: '4', name: 'Nursery 1', onRoll: 20 },
  { id: '5', name: 'Nursery 2', onRoll: 22 },
  { id: '6', name: 'Basic 1', onRoll: 28 },
  { id: '7', name: 'KG 1', onRoll: 24 },
  { id: '8', name: 'Creche', onRoll: 18 },
  { id: '9', name: 'JHS 1', onRoll: 30 },
  { id: '10', name: 'JHS 2', onRoll: 27 },
  { id: '11', name: 'JHS 3', onRoll: 29 },
  { id: '12', name: 'Grade 1', onRoll: 23 },
  { id: '13', name: 'Grade 2', onRoll: 21 },
]

export const financialSummary = [
  { label: 'Total Sch Fees', amount: 0, variant: 'blue' as const },
  { label: 'Total Sch Fee', amount: 0, variant: 'green' as const },
  { label: 'Sch Fee Balance', amount: 0, variant: 'red' as const },
  { label: 'Other Fees (Bus Fees)', amount: 0, variant: 'teal' as const },
  { label: 'Other Fees (Feeding)', amount: 0, variant: 'lightgreen' as const },
  { label: 'Total Other Fees', amount: 0, variant: 'red' as const },
]

export const classOptions = [
  'Creche - Ages 1-2',
  'Grade 1 - Ages 6-7',
  'Grade 2 - Ages 7-8',
  'KG 1 - Ages 4-5',
  'KG 2 - Ages 5-6',
  'Nursery 1 - Ages 3-4',
  'Nursery 2 - Ages 4-5',
  'Basic 1',
  'Basic 2',
  'Basic 3',
  'JHS 1',
  'JHS 2',
  'JHS 3',
]

export const academicYearOptions = [
  '2024 / 2025',
  '2023 / 2024',
  '2022 / 2023',
  '2021 / 2022',
]

export const termOptions = ['Term 1', 'Term 2', 'Term 3']

export const feesFilterOptions = [
  'All',
  'Paid',
  'Partial',
  'Outstanding',
  'Overdue',
]

export interface StudentProfile {
  studentId: string
  fullName: string
  gender: string
  currentClass: string
  status: string
  password?: string
  basic: {
    firstName: string
    surname: string
    otherNames: string
    dateOfBirth: string
    national: string
    homeTown: string
    currentCountry: string
    currentCity: string
    religion: string
  }
  contact: {
    phone: string
    email: string
    address: string
  }
  guardian: {
    fatherName: string
    fatherContact: string
    motherName: string
    motherContact: string
    parentsAddress: string
    parentsEmail: string
  }
  admin: {
    entryClass: string
    adminDate: string
    programCourse: string
    affiliateHouse: string
  }
}

function parseFullName(fullName: string): { firstName: string; surname: string; otherNames: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 3) {
    return { surname: parts[0] ?? '', firstName: parts[1] ?? '', otherNames: parts.slice(2).join(' ') }
  }
  if (parts.length === 2) {
    return { surname: parts[0] ?? '', firstName: parts[1] ?? '', otherNames: '' }
  }
  return { surname: fullName, firstName: '', otherNames: '' }
}

export function studentRowToProfile(row: StudentRow): StudentProfile {
  const { firstName, surname, otherNames } = parseFullName(row.studentName)
  return {
    studentId: row.studentId,
    fullName: row.studentName,
    gender: row.gender,
    currentClass: row.currentClass,
    status: row.status,
    password: row.password,
    basic: {
      firstName,
      surname,
      otherNames,
      dateOfBirth: row.dateOfBirth,
      national: row.national,
      homeTown: 'N/A',
      currentCountry: row.national,
      currentCity: row.national === 'Ghana' ? 'Ghanaian - Accra' : row.national,
      religion: 'Christian',
    },
    contact: { phone: row.contact, email: '', address: '' },
    guardian: { fatherName: '', fatherContact: '', motherName: '', motherContact: '', parentsAddress: '', parentsEmail: '' },
    admin: { entryClass: row.entryClass, adminDate: row.adminDate, programCourse: 'General', affiliateHouse: '' },
  }
}

export function getStudentProfile(studentId: string): StudentProfile | null {
  const list = studentsListAll.find((r) => r.studentId === studentId)
  if (list) {
    return studentRowToProfile(list)
  }
  const classNames = CLASS_LIST_BASE_NAMES
  const idx = studentId.match(/\d+/)?.[0]
  const i = idx ? parseInt(idx, 10) - 1 : 0
  const fullName = classNames[i % classNames.length] ?? 'Unknown Student'
  const { firstName, surname, otherNames } = parseFullName(fullName)
  return {
    studentId,
    fullName,
    gender: i % 2 === 0 ? 'Male' : 'Female',
    currentClass: 'Basic 2',
    status: 'Active',
    password: 'mjtP5B',
    basic: {
      firstName,
      surname,
      otherNames,
      dateOfBirth: '21-Jun-2017',
      national: 'Ghanaian',
      homeTown: 'N/A',
      currentCountry: 'Ghanaian',
      currentCity: 'Ghanaian - Accra',
      religion: 'Christian',
    },
    contact: { phone: '', email: '', address: '' },
    guardian: { fatherName: '', fatherContact: '', motherName: '', motherContact: '', parentsAddress: '', parentsEmail: '' },
    admin: { entryClass: 'KG 1', adminDate: '05-Sep-2018', programCourse: 'General', affiliateHouse: '' },
  }
}

export type ClassStatRow = { id: string; name: string; onRoll: number }
export type FinancialItem = { label: string; amount: number; variant: 'blue' | 'green' | 'red' | 'teal' | 'lightgreen' }

/** Returns class statistics filtered by selected class (option label e.g. "Basic 2" or "Creche - Ages 1-2") */
export function getFilteredClassStatistics(selectedClass: string): ClassStatRow[] {
  if (!selectedClass.trim()) return classStatistics
  return classStatistics.filter(
    (row) =>
      selectedClass === row.name ||
      selectedClass.startsWith(row.name + ' ') ||
      selectedClass.startsWith(row.name + '-')
  )
}

/** Returns student/staff stats adjusted for dashboard filters (year, term, class, fees) */
export function getFilteredStudentStats(
  _academicYear: string,
  term: string,
  selectedClass: string,
  _fees: string
): { total: number; active: number; inactive: number; new: number } {
  if (selectedClass.trim()) {
    const match = classStatistics.find(
      (row) =>
        selectedClass === row.name ||
        selectedClass.startsWith(row.name + ' ') ||
        selectedClass.startsWith(row.name + '-')
    )
    if (match)
      return { total: match.onRoll, active: match.onRoll, inactive: 0, new: 0 }
  }
  const base = { ...studentStats }
  if (term === 'Term 1') base.new = 3
  else if (term === 'Term 2') base.new = 1
  else if (term === 'Term 3') base.new = 0
  return base
}

export function getFilteredStaffStats(
  _academicYear: string,
  _term: string,
  selectedClass: string,
  _fees: string
): { total: number; active: number; inactive: number; new: number } {
  if (!selectedClass.trim()) return staffStats
  return staffStats
}

/** Financial summary amounts vary by academic year, term, and fees filter for demo */
export function getFilteredFinancialSummary(
  academicYear: string,
  term: string,
  fees: string
): FinancialItem[] {
  const base = financialSummary.map((item) => ({ ...item }))
  const hasFilter = !!academicYear.trim() || !!term.trim() || (!!fees.trim() && fees !== 'All')
  if (!hasFilter) {
    return base.map((item) => ({ ...item, amount: 0 }))
  }
  const yearMultiplier =
    academicYear === '2024 / 2025' ? 1
    : academicYear === '2023 / 2024' ? 0.92
    : academicYear === '2022 / 2023' ? 0.85
    : academicYear === '2021 / 2022' ? 0.78
    : 1
  const termMultiplier = term === 'Term 1' ? 0.35 : term === 'Term 2' ? 0.35 : term === 'Term 3' ? 0.3 : 0.33
  const amounts: Record<string, number> = {
    'Total Sch Fees': Math.round(125000 * yearMultiplier),
    'Total Sch Fee': Math.round(118500 * yearMultiplier),
    'Sch Fee Balance': Math.round(6500 * yearMultiplier),
    'Other Fees (Bus Fees)': Math.round(28500 * yearMultiplier * termMultiplier),
    'Other Fees (Feeding)': Math.round(42000 * yearMultiplier * termMultiplier),
    'Total Other Fees': Math.round(70500 * yearMultiplier * termMultiplier),
  }
  if (fees === 'Paid') {
    amounts['Total Sch Fees'] = Math.round(amounts['Total Sch Fees'] * 0.72)
    amounts['Total Sch Fee'] = Math.round(amounts['Total Sch Fee'] * 0.72)
    amounts['Sch Fee Balance'] = 0
  } else if (fees === 'Outstanding' || fees === 'Overdue') {
    amounts['Sch Fee Balance'] = Math.round(amounts['Sch Fee Balance'] * 1.4)
  } else if (fees === 'Partial') {
    amounts['Sch Fee Balance'] = Math.round(amounts['Sch Fee Balance'] * 0.6)
  }
  return base.map((item) => ({ ...item, amount: amounts[item.label] ?? 0 }))
}

export interface StudentRow {
  no: number
  studentId: string
  password: string
  studentName: string
  gender: string
  dateOfBirth: string
  contact: string
  national: string
  entryClass: string
  currentClass: string
  status: 'Active' | 'Left'
  adminDate: string
}

export interface ClassListRow {
  no: number
  studentId: string
  studentName: string
  gender: string
  dateOfBirth: string
  contact: string
  national: string
  class: string
  status: string
  adminDate: string
}

export interface ParentListRow {
  no: number
  studentId: string
  studentName: string
  gender: string
  class: string
  mother: string
  father: string
  email: string
  resAddress: string
}

const PARENTS_MOCK_MOTHERS = [
  'Samira Mansuru (N/A)',
  'Mrs Sarah (0248365713)',
  'Ama Konadu (0241234001)',
  'Abena Osei (0209876543)',
  'Adwoa Nyarko (0551234567)',
  'Akua Frimpong (N/A)',
  'Comfort Agyeman (0245551234)',
  'Gifty Appiah (0509876123)',
  'Joyce Mensah (0248765432)',
  'Patricia Owusu (0543210987)',
]
const PARENTS_MOCK_FATHERS = [
  'Mr. Mansuru (0245108013)',
  'John Gbaguidi (0244289386)',
  'Kofi Mensah (0201234567)',
  'Yaw Boateng (0559876543)',
  'Samuel Koranteng (0246543210)',
  'Emmanuel Owusu (N/A)',
  'Daniel Ampofo (0501234876)',
  'Michael Danso (0247890123)',
  'Benjamin Sarpong (0543216540)',
  'Joseph Osei (0249012345)',
]
const PARENTS_MOCK_EMAILS = [
  'n/a@gmail.com',
  'gbaguidijohnrodrigue@gmail.com',
  'konadu.ama@yahoo.com',
  'osei.abena@gmail.com',
  'nyarko.adwoa@outlook.com',
  'frimpong.akua@gmail.com',
  'agyeman.comfort@yahoo.com',
  'appiah.gifty@gmail.com',
  'mensah.joyce@outlook.com',
  'owusu.patricia@gmail.com',
]
const PARENTS_MOCK_ADDRESSES = ['Oyarifa Gravel Pit', 'East Legon', 'Dzorwulu', 'Tema Community 25', 'Accra New Town', 'Labone', 'Cantonments', 'Dansoman', 'Kokomlemle', 'Adenta']

export function getParentsListRows(): ParentListRow[] {
  const base = studentsListAll
  const rows: ParentListRow[] = []
  for (let i = 0; i < 335; i++) {
    const b = base[i % base.length]!
    const j = i % PARENTS_MOCK_MOTHERS.length
    rows.push({
      no: i + 1,
      studentId: `BOAK${String(i + 1).padStart(4, '0')}`,
      studentName: b.studentName,
      gender: b.gender,
      class: b.currentClass,
      mother: PARENTS_MOCK_MOTHERS[j]!,
      father: PARENTS_MOCK_FATHERS[j]!,
      email: PARENTS_MOCK_EMAILS[j]!,
      resAddress: PARENTS_MOCK_ADDRESSES[i % PARENTS_MOCK_ADDRESSES.length]!,
    })
  }
  return rows
}

const CLASS_LIST_BASE_NAMES = [
  'Tuntaiya Mansuru Tahiru',
  'Samuel Koranteng K.',
  'Ama Serwaa Bonsu',
  'Kofi Mensah J.',
  'Abena Osei Yaw',
  'Kwame Asante D.',
  'Adwoa Nyarko P.',
  'Yaw Boateng R.',
  'Akua Frimpong M.',
  'Emmanuel Owusu S.',
  'Efia Kumi N.',
  'Daniel Ampofo T.',
  'Akosua Addo L.',
  'Joseph Osei B.',
  'Mensah Grace A.',
  'David Asare K.',
  'Comfort Agyeman F.',
  'Michael Danso H.',
  'Gifty Appiah V.',
  'Stephen Bekoe C.',
  'Joyce Mensah W.',
  'Benjamin Sarpong E.',
  'Patricia Owusu G.',
  'Samuel Agyapong I.',
  'Ruth Asante O.',
]

export function getClassListRows(className: string, total = 25): ClassListRow[] {
  return Array.from({ length: total }, (_, i) => ({
    no: i + 1,
    studentId: `BOAK${String(i + 1).padStart(4, '0')}`,
    studentName: CLASS_LIST_BASE_NAMES[i % CLASS_LIST_BASE_NAMES.length]!,
    gender: i % 2 === 0 ? 'Male' : 'Female',
    dateOfBirth: ['21-Jun-2017', '15-Mar-2016', '08-Nov-2015', '30-Jan-2017', '14-Jul-2019'][i % 5]!,
    contact: `024${String(1000000 + i).slice(-7)}`,
    national: 'Ghanaian',
    class: className,
    status: 'Active',
    adminDate: ['05-Sep-2018', '12-Jan-2017', '03-Aug-2019', '20-Oct-2016', '01-Sep-2020'][i % 5]!,
  }))
}

export interface PromotionRow {
  no: number
  studentId: string
  studentName: string
  dateOfBirth: string
  contact: string
  entryClass: string
  currentClass: string
  promoteTo: string
}

const PROMOTION_BASE_NAMES = [
  'Tuntalya Mansuru Tahiru',
  'Samuel Koranteng K.',
  'Ama Serwaa Bonsu',
  'Kofi Mensah J.',
  'Abena Osei Yaw',
  'Kwame Asante D.',
  'Adwoa Nyarko P.',
  'Yaw Boateng R.',
  'Akua Frimpong M.',
  'Emmanuel Owusu S.',
  'Efia Kumi N.',
  'Daniel Ampofo T.',
  'Akosua Addo L.',
  'Joseph Osei B.',
  'Mensah Grace A.',
  'David Asare K.',
  'Comfort Agyeman F.',
  'Michael Danso H.',
  'Gifty Appiah V.',
  'Stephen Bekoe C.',
  'Joyce Mensah W.',
  'Benjamin Sarpong E.',
  'Patricia Owusu G.',
  'Samuel Agyapong I.',
  'Ruth Asante O.',
]

const PROMOTION_CLASSES = ['Basic 1', 'Basic 2', 'Basic 3', 'KG 1', 'KG 2', 'JHS 1', 'JHS 2', 'JHS 3']

export function getPromotionRows(className: string, total = 25): PromotionRow[] {
  return Array.from({ length: total }, (_, i) => {
    const current = className
    const classIndex = PROMOTION_CLASSES.indexOf(current)
    const nextClass = classIndex >= 0 && classIndex < PROMOTION_CLASSES.length - 1
      ? PROMOTION_CLASSES[classIndex + 1]!
      : current
    return {
      no: i + 1,
      studentId: `BOAKD${String(i + 1).padStart(3, '0')}`,
      studentName: PROMOTION_BASE_NAMES[i % PROMOTION_BASE_NAMES.length]!,
      dateOfBirth: ['2017-06-21', '2016-03-15', '2015-11-08', '2017-01-30', '2019-07-14'][i % 5]!,
      contact: `024${String(1000000 + i).slice(-7)}`,
      entryClass: ['Basic 1', 'KG 2', 'Nursery 1', 'Basic 1', 'KG 1'][i % 5]!,
      currentClass: current,
      promoteTo: nextClass,
    }
  })
}

const STUDENT_LIST_NAMES = [
  'Tuntaiya Mansuru Tahiru',
  'Samuel Koranteng K.',
  'Ama Serwaa Bonsu',
  'Kofi Mensah J.',
  'Abena Osei Yaw',
  'Kwame Asante D.',
  'Adwoa Nyarko P.',
  'Yaw Boateng R.',
  'Akua Frimpong M.',
  'Emmanuel Owusu S.',
]

export const studentsListAll: StudentRow[] = [
  { no: 1, studentId: 'BOAK0001', password: 'mYB5B', studentName: STUDENT_LIST_NAMES[0]!, gender: 'Male', dateOfBirth: '01 Jun 2017', contact: '0241234567', national: 'Ghana', entryClass: 'KG 1', currentClass: 'Basic 2', status: 'Active', adminDate: '05 Sep 2015' },
  { no: 2, studentId: 'BOAK0002', password: 'xK9pL', studentName: STUDENT_LIST_NAMES[1]!, gender: 'Female', dateOfBirth: '15 Mar 2016', contact: '0242345678', national: 'Ghana', entryClass: 'Nursery 1', currentClass: 'Basic 1', status: 'Active', adminDate: '12 Jan 2016' },
  { no: 3, studentId: 'BOAK0003', password: 'qR2mN', studentName: STUDENT_LIST_NAMES[2]!, gender: 'Male', dateOfBirth: '22 Aug 2018', contact: '0243456789', national: 'Ghana', entryClass: 'Creche', currentClass: 'KG 1', status: 'Active', adminDate: '03 Aug 2019' },
  { no: 4, studentId: 'BOAK0004', password: 'wP4vB', studentName: STUDENT_LIST_NAMES[3]!, gender: 'Female', dateOfBirth: '08 Nov 2015', contact: '0244567890', national: 'Ghana', entryClass: 'KG 2', currentClass: 'Basic 3', status: 'Left', adminDate: '10 Feb 2014' },
  { no: 5, studentId: 'BOAK0005', password: 'tY7cX', studentName: STUDENT_LIST_NAMES[4]!, gender: 'Male', dateOfBirth: '30 Jan 2017', contact: '0245678901', national: 'Ghana', entryClass: 'Nursery 2', currentClass: 'Basic 2', status: 'Active', adminDate: '15 Mar 2016' },
  { no: 6, studentId: 'BOAK0006', password: 'zA1fG', studentName: STUDENT_LIST_NAMES[5]!, gender: 'Female', dateOfBirth: '14 Jul 2019', contact: '0246789012', national: 'Ghana', entryClass: 'Creche', currentClass: 'Nursery 1', status: 'Active', adminDate: '01 Sep 2020' },
  { no: 7, studentId: 'BOAK0007', password: 'bN3hJ', studentName: STUDENT_LIST_NAMES[6]!, gender: 'Male', dateOfBirth: '05 Apr 2016', contact: '0247890123', national: 'Ghana', entryClass: 'KG 1', currentClass: 'Basic 1', status: 'Active', adminDate: '20 Aug 2017' },
  { no: 8, studentId: 'BOAK0008', password: 'dK6lM', studentName: STUDENT_LIST_NAMES[7]!, gender: 'Female', dateOfBirth: '19 Dec 2018', contact: '0248901234', national: 'Ghana', entryClass: 'Nursery 1', currentClass: 'KG 2', status: 'Active', adminDate: '07 Jan 2019' },
  { no: 9, studentId: 'BOAK0009', password: 'fH8nP', studentName: STUDENT_LIST_NAMES[8]!, gender: 'Male', dateOfBirth: '11 Feb 2017', contact: '0249012345', national: 'Ghana', entryClass: 'KG 2', currentClass: 'Basic 2', status: 'Left', adminDate: '14 Jun 2016' },
  { no: 10, studentId: 'BOAK0010', password: 'jQ0rS', studentName: STUDENT_LIST_NAMES[9]!, gender: 'Female', dateOfBirth: '27 Sep 2016', contact: '0240123456', national: 'Ghana', entryClass: 'Nursery 2', currentClass: 'Basic 1', status: 'Active', adminDate: '22 Oct 2017' },
]
