import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDragonByUser } from "@/lib/data";
import { AuthForm } from "@/components/AuthForm";
import { Card } from "@/components/ui";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    const dragon = getDragonByUser(session.userId);
    redirect(dragon ? "/" : "/configure");
  }
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-10">
      <Card>
        <h1 className="text-2xl font-bold">Bienvenido de vuelta</h1>
        <p className="mb-5 mt-1 text-sm text-zinc-400">
          Tu dragón seguro te está esperando.
        </p>
        <AuthForm mode="login" />
      </Card>
      <p className="text-center text-sm text-zinc-500">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/signup" className="text-amber-400 hover:underline">
          Crea una
        </Link>
      </p>
    </div>
  );
}