export const rolePaths = {
    student: '/student',
    teacher: '/teacher',
    admin: '/admin',
    supervisor: '/supervisor',
    counselor: '/counselor',
} as const

export type AppRole = keyof typeof rolePaths

export function isAppRole(value: string): value is AppRole {
    return value in rolePaths
}