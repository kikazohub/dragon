import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDragonByUser } from "@/lib/data";
import { ConfigureForm } from "@/components/ConfigureForm";

export default async function ConfigurePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const dragon = getDragonByUser(session.userId);
  if (dragon) redirect("/");

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold">Forjar un dragón</h1>
        <p className="mx-auto mt-2 max-w-lg text-zinc-400">
          Cada elección define a una criatura única que crecerá contigo día a día.
        </p>
      </div>
      <ConfigureForm />
    </div>
  );
}