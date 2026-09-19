"use client";

import { useActionState } from "react";
import { signupAction, loginAction } from "@/app/actions";
import { Button, Input, Label, ErrorBox } from "@/components/ui";

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const isSignup = mode === "signup";
  const action = isSignup ? signupAction : loginAction;
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label>Nombre de usuario</Label>
        <Input name="username" placeholder="tú apodo" autoComplete="username" maxLength={24} />
      </div>
      <div>
        <Label>Contraseña</Label>
        <Input name="password" type="password" placeholder="••••••••" autoComplete={isSignup ? "new-password" : "current-password"} />
      </div>
      {isSignup && (
        <div>
          <Label>Repite la contraseña</Label>
          <Input name="confirm" type="password" placeholder="••••••••" autoComplete="new-password" />
        </div>
      )}
      <ErrorBox>{state?.error}</ErrorBox>
      <Button disabled={pending} className="mt-2">
        {pending ? "Un momento..." : isSignup ? "Crear mi cuenta" : "Entrar"}
      </Button>
    </form>
  );
}