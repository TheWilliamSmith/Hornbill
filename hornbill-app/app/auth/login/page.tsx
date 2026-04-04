import { Input } from "@/src/components/inputs/Input";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-lg p-4 border border-red-300 rounded-lg">
      <h1 className="text-red-500 text-2xl font-bold">Login Page</h1>
      <form className="flex flex-col gap-4 w-full">
        <div className="w-full">
          <label htmlFor="Email">Email</label>
          <input type="email" placeholder="Your email" required={true} className=" border border-red-500" />
        </div>
        <div className="w-full">
          <label htmlFor="Password">Password</label>
          <input type="password" placeholder="Your password" required={true} className="border border-red-500" />
        </div>
        <button type="submit" className="w-full bg-red-500 text-white rounded py-2 hover:bg-red-600 transition-colors">
          {" "}
          Login
        </button>
      </form>

      <p>
        New Here ?{" "}
        <a className="text-red-500" href="/auth/register">
          Create an account
        </a>
      </p>
    </div>
  );
}
