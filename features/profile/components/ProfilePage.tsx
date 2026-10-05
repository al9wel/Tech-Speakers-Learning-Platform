import Link from 'next/link'
import { updateProfile, changePassword } from '@/features/profile/server/actions'
import type { AppRole } from '@/lib/auth/roles'

interface ProfilePageProps {
    email: string
    fullName: string | null
    role: AppRole
    createdAt: string
    backUrl: string
    errorMessage?: string
    successMessage?: string
}

export function ProfilePage({
    email,
    fullName,
    role,
    createdAt,
    backUrl,
    errorMessage,
    successMessage,
}: ProfilePageProps) {
    const formattedDate = createdAt
        ? createdAt.replace('T', ' ').substring(0, 19)
        : '-'

    return (
        <main className="bg-white text-black min-h-screen p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold">My Profile</h1>
                <Link
                    href={backUrl}
                    className="px-5 py-2.5 bg-gray-200 text-black font-semibold rounded border border-gray-400 hover:bg-gray-300"
                >
                    Back to Dashboard
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

            {/* Profile Information (read-only) */}
            <div className="mb-8 p-6 bg-gray-50 border-2 border-gray-300 rounded">
                <h2 className="text-2xl font-bold mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="font-bold text-gray-600">Role:</p>
                        <p className="text-lg capitalize font-semibold px-3 py-1 bg-gray-200 rounded border border-gray-300 inline-block mt-1">
                            {role}
                        </p>
                    </div>
                    <div>
                        <p className="font-bold text-gray-600">Account Created:</p>
                        <p className="text-lg mt-1">{formattedDate}</p>
                    </div>
                </div>
            </div>

            {/* Edit Profile Form */}
            <div className="mb-8 p-6 bg-gray-50 border-2 border-gray-300 rounded">
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Edit Profile</h2>
                <form action={updateProfile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="full_name" className="block font-bold mb-1">
                                Full Name:
                            </label>
                            <input
                                id="full_name"
                                name="full_name"
                                type="text"
                                defaultValue={fullName ?? ''}
                                placeholder="Your full name"
                                className="w-full p-3 border-2 border-gray-400 rounded text-base"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block font-bold mb-1">
                                Email:
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                defaultValue={email}
                                className="w-full p-3 border-2 border-gray-400 rounded text-base"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white text-lg font-bold rounded cursor-pointer hover:bg-blue-700"
                    >
                        Save Profile
                    </button>
                </form>
            </div>

            {/* Change Password Form */}
            <div className="p-6 bg-gray-50 border-2 border-gray-300 rounded">
                <h2 className="text-2xl font-bold mb-4 text-orange-700">Change Password</h2>
                <form action={changePassword}>
                    <div className="mb-4" style={{ maxWidth: 400 }}>
                        <label htmlFor="new_password" className="block font-bold mb-1">
                            New Password:
                        </label>
                        <input
                            id="new_password"
                            name="new_password"
                            type="password"
                            required
                            placeholder="Min 6 characters"
                            className="w-full p-3 border-2 border-gray-400 rounded text-base"
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-6 py-3 bg-orange-600 text-white text-lg font-bold rounded cursor-pointer hover:bg-orange-700"
                    >
                        Change Password
                    </button>
                </form>
            </div>
        </main>
    )
}
