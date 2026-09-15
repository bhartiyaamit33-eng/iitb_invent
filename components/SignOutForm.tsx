import type { ReactNode } from "react";

export function SignOutForm({
  className,
  buttonClassName,
  children = "Sign out",
}: {
  className?: string;
  buttonClassName: string;
  children?: ReactNode;
}) {
  return (
    <form action="/logout" method="post" className={className}>
      <button type="submit" className={buttonClassName} data-testid="sign-out">
        {children}
      </button>
    </form>
  );
}
