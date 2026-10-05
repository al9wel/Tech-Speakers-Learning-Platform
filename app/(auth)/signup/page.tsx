import { signup } from "@/features/auth/server/actions"

export default function SignupPage() {
    return (
        <main className="bg-white text-black min-h-screen p-4">
            <h1>Student Sign Up</h1>

            <form>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                    />
                </div>

                <div className="mt-2">
                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                    />
                </div>

                <button formAction={signup} className="mt-4 px-6 py-3 text-lg font-bold bg-blue-600 text-white rounded cursor-pointer">
                    Sign up
                </button>
            </form>
        </main>
    )
}