export const DB_NAME = "biosphere"
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(email => email.trim())