import Input from "@/components/ui/Input";

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-lg p-4 border border-gray-300 rounded-lg">
      <h1 className="text-gray-500 text-2xl font-bold">Register Page</h1>
      <form className="flex flex-col gap-4 w-full">
        <div className="w-full">
          <Input
            type="email"
            label="Email"
            placeholder="Your email"
            required={true}
            className=" border border-gray-500"
          />
        </div>
        <div className="w-full">
          <Input
            type="password"
            label="Password"
            placeholder="Your password"
            required={true}
            className="border border-gray-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gray-500 text-white rounded py-2 hover:bg-gray-600 transition-colors"
        >
          {" "}
          Register
        </button>
      </form>

      <p>
        Already have an account?{" "}
        <a className="text-gray-500" href="/auth/login">
          Login
        </a>
      </p>
    </div>
  );
}
