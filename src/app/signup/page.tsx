import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDragonByUser } from "@/lib/data";
import { AuthForm } from "@/components/AuthForm";
import { Card } from "@/components/ui";

export default async function SignupPage() {
  const session = await getSession();
  if (session) {
    const dragon = getDragonByUser(session.userId);
    redirect(dragon ? "/" : "/configure");
  }
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-10">
      <Card>
        <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
        <p className="mb-5 mt-1 text-sm text-zinc-400">
          Tu dragón convivirá contigo durante muchos días. Empecemos.
        </p>
        <AuthForm mode="signup" />
      </Card>
      <p className="text-center text-sm text-zinc-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-amber-400 hover:underline">
          Entra aquí
        </Link>
      </p>
    </div>
  );
}