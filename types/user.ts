export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "guest"
  status: "active" | "inactive"
  lastActive: string
  dateCreated: string
}
