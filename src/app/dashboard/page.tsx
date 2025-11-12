import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const metadata = {
  title: "Dashboard - BinBuddy",
  description: "Your BinBuddy dashboard",
};

// Get user role from token and redirect to appropriate dashboard
async function getUserRole() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return null;

    const decoded = jwt.verify(accessToken, JWT_SECRET) as { role: string };
    return decoded.role.toLowerCase();
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const role = await getUserRole();

  if (!role) {
    redirect("/login");
  }

  // Redirect to role-specific dashboard
  redirect(`/dashboard/${role}`);
}
