import { AuthFormData } from "@/types/auth"
import { AppError } from "@/types/error"

export const Login = async (form: AuthFormData) => {
	const res = await fetch('api/auth/login', {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({
			email: form.email,
			password: form.password
		})
	})
	if (!res.ok) {
		const err: AppError = await res.json()
		throw err
	}
	return res.json()
}

export const Register = async (form: AuthFormData) => {
	const res = await fetch('api/auth/register', {
		method: "POST",
		headers: { "Content-Type" : "application/json" },
		credentials: "include",
		body: JSON.stringify({
			email: form.email,
			name: form.name,
			password: form.password
		})
	})
	if (!res.ok) {
		const err: AppError = await res.json()
		throw err
	}
	return res.json()
}

export const Google = () => {
	window.location.href = "/api/auth/oauth/signin?provider=google"
}

export const GitHub = () => {
	window.location.href = "/api/auth/oauth/signin?provider=github"
}