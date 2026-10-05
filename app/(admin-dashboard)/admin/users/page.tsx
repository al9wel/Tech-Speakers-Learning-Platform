import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import { isAppRole, type AppRole } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import { createUser, updateUser, deleteUser } from '@/features/users/server/actions'

interface UsersPageProps {
    searchParams: Promise<{
        edit?: string
        error?: string
        success?: string
    }>
}

const ROLES: AppRole[] = ['student', 'teacher', 'admin', 'supervisor', 'counselor']

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
    const { user: currentAdmin } = await requireRole('admin')

    const params = await searchParams
    const editId = params.edit
    const errorMessage = params.error
    const successMessage = params.success

    const admin = createAdminClient()

    // 1. Fetch users from Supabase Auth Admin API
    const { data: authUsersData, error: authError } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
    })

    // 2. Fetch profiles from database
    const { data: profiles, error: profilesError } = await admin
        .from('profiles')
        .select('id, full_name, role, created_at')

    const loadError = authError || profilesError ? 'Unable to load users' : null

    // 3. Merge Auth users with profiles
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

    const users = (authUsersData?.users ?? []).map((u) => {
        const p = profileMap.get(u.id)
        return {
            id: u.id,
            email: u.email ?? '',
            full_name: p?.full_name ?? '',
            role: (p?.role && isAppRole(p.role) ? p.role : 'student') as AppRole,
            created_at: p?.created_at || u.created_at,
        }
    })

    const editingUser = editId ? users.find((u) => u.id === editId) : null

    return (
        <main className="bg-white text-black min-h-screen p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold">User Management</h1>
                <Link
                    href="/admin"
                    className="px-5 py-2.5 bg-gray-200 text-black font-semibold rounded border border-gray-400 hover:bg-gray-300"
                >
                    Back to Admin Dashboard
                </Link>
            </div>

            {errorMessage && (
                <div className="mb-6 p-4 bg-red-100 border-2 border-red-400 text-red-800 rounded font-semibold text-lg">
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="mb-6 p-4 bg-green-100 border-2 border-green-400 text-green-800 rounded font-semibold text-lg">
                    {successMessage}
                </div>
            )}

            {loadError && (
                <div className="mb-6 p-4 bg-red-100 border-2 border-red-400 text-red-800 rounded font-semibold text-lg">
                    {loadError}
                </div>
            )}

            {/* Form Section: Edit User or Add User */}
            <div className="mb-10 p-6 bg-gray-50 border-2 border-gray-300 rounded">
                {editingUser ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-blue-700">Edit User: {editingUser.email}</h2>
                            <Link
                                href="/admin/users"
                                className="px-4 py-2 bg-gray-300 text-black font-semibold rounded hover:bg-gray-400"
                            >
                                Cancel Edit
                            </Link>
                        </div>

                        <form action={updateUser}>
                            <input type="hidden" name="user_id" value={editingUser.id} />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label htmlFor="edit_full_name" className="block font-bold mb-1">
                                        Full Name:
                                    </label>
                                    <input
                                        id="edit_full_name"
                                        name="full_name"
                                        type="text"
                                        defaultValue={editingUser.full_name}
                                        className="w-full p-3 border-2 border-gray-400 rounded text-base"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="edit_email" className="block font-bold mb-1">
                                        Email:
                                    </label>
                                    <input
                                        id="edit_email"
                                        name="email"
                                        type="email"
                                        required
                                        defaultValue={editingUser.email}
                                        className="w-full p-3 border-2 border-gray-400 rounded text-base"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="edit_role" className="block font-bold mb-1">
                                        Role:
                                    </label>
                                    <select
                                        id="edit_role"
                                        name="role"
                                        defaultValue={editingUser.role}
                                        className="w-full p-3 border-2 border-gray-400 rounded text-base bg-white"
                                    >
                                        {ROLES.map((r) => (
                                            <option key={r} value={r}>
                                                {r}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-blue-600 text-white text-lg font-bold rounded cursor-pointer hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                                <Link
                                    href="/admin/users"
                                    className="px-6 py-3 bg-gray-200 text-black text-lg font-bold rounded border border-gray-400 hover:bg-gray-300 inline-block text-center"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold mb-2 text-green-700">Add New User</h2>
                        <p className="text-gray-700 mb-4">
                            New user will be created with default temporary password:{' '}
                            <span className="font-bold bg-yellow-200 px-2 py-0.5 rounded border border-yellow-400">
                                123456789
                            </span>
                        </p>

                        <form action={createUser}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label htmlFor="add_full_name" className="block font-bold mb-1">
                                        Full Name:
                                    </label>
                                    <input
                                        id="add_full_name"
                                        name="full_name"
                                        type="text"
                                        placeholder="e.g. Ali Ahmed"
                                        className="w-full p-3 border-2 border-gray-400 rounded text-base"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="add_email" className="block font-bold mb-1">
                                        Email:
                                    </label>
                                    <input
                                        id="add_email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="user@example.com"
                                        className="w-full p-3 border-2 border-gray-400 rounded text-base"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="add_role" className="block font-bold mb-1">
                                        Role:
                                    </label>
                                    <select
                                        id="add_role"
                                        name="role"
                                        defaultValue="student"
                                        className="w-full p-3 border-2 border-gray-400 rounded text-base bg-white"
                                    >
                                        {ROLES.map((r) => (
                                            <option key={r} value={r}>
                                                {r}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="px-6 py-3 bg-green-600 text-white text-lg font-bold rounded cursor-pointer hover:bg-green-700 mt-2"
                            >
                                Add User
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Users Table */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Existing Users ({users.length})</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border-2 border-gray-400 text-left">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-400 text-lg">
                                <th className="p-3 border border-gray-300">Full Name</th>
                                <th className="p-3 border border-gray-300">Email</th>
                                <th className="p-3 border border-gray-300">Role</th>
                                <th className="p-3 border border-gray-300">Created At</th>
                                <th className="p-3 border border-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-500 font-semibold">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => {
                                    const isCurrentAdmin = u.id === currentAdmin.id
                                    const formattedDate = u.created_at
                                        ? u.created_at.replace('T', ' ').substring(0, 19)
                                        : '-'

                                    return (
                                        <tr
                                            key={u.id}
                                            className={`border-b border-gray-300 hover:bg-gray-50 ${
                                                editId === u.id ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            <td className="p-3 border border-gray-300 font-medium">
                                                {u.full_name || <span className="text-gray-400 italic">None</span>}
                                                {isCurrentAdmin && (
                                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                                                        You
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 border border-gray-300">{u.email}</td>
                                            <td className="p-3 border border-gray-300">
                                                <span className="capitalize font-semibold px-2.5 py-1 rounded bg-gray-200 text-black border border-gray-300">
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-3 border border-gray-300 text-sm">{formattedDate}</td>
                                            <td className="p-3 border border-gray-300">
                                                <div className="flex gap-2 items-center">
                                                    <Link
                                                        href={`/admin/users?edit=${u.id}`}
                                                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded text-sm hover:bg-blue-700"
                                                    >
                                                        Edit
                                                    </Link>

                                                    <form action={deleteUser} className="inline m-0">
                                                        <input type="hidden" name="user_id" value={u.id} />
                                                        <button
                                                            type="submit"
                                                            disabled={isCurrentAdmin}
                                                            title={isCurrentAdmin ? 'You cannot delete yourself' : undefined}
                                                            className={`px-4 py-2 font-bold rounded text-sm ${
                                                                isCurrentAdmin
                                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                                                            }`}
                                                        >
                                                            Delete
                                                        </button>
                                                    </form>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}
