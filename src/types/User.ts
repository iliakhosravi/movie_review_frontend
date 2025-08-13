export interface User {
  id: string | number
  name: string
  last_name?: string
  phone_number?: string
  email: string
  password?: string
  avatarUrl?: string
  bio?: string
  is_admin: boolean
  token?: string
}
