import { redirect } from "next/navigation";

// Signup and login are a single unified auth page now: "Continue with Google"
// logs in existing users and creates an account for new ones. Keep this route
// as a redirect so old links/bookmarks to /signup still work.
export default function SignupPage() {
  redirect("/login");
}
