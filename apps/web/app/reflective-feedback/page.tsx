import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ReflectiveFeedbackDisplay from "@/components/reflective-feedback/ReflectiveFeedbackDisplay";

export const metadata = {
  title: "Reflective Feedback | WisdomOS",
  description: "Track your growth across multiple dimensions with engaged awareness",
};

export default async function ReflectiveFeedbackPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/reflective-feedback");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <ReflectiveFeedbackDisplay />
    </div>
  );
}
