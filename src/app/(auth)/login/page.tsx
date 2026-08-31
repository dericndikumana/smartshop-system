import LoginClient from "./login-client"

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const isSuspended = searchParams.error === "suspended"

  return <LoginClient isSuspended={isSuspended} />
}
