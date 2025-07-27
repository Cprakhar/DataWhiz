export interface UserDetails {
    name: string
    email: string
    oauthProvider: "google" | "github" | ""
    avatar_url: string
}