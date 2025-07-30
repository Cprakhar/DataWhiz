import z from "zod";

export const loginSchema = z.object({
    email: z.email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"),
})

export const registerSchema = loginSchema.extend({
    name: z.string().min(1, "Name field is required")
})