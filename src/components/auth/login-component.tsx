import { LoginForm } from "@/components/auth/login-form"

export default function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center ounded-md text-primary-foreground">
              <img src="/icon.svg" alt="suitpress logo" className="w-28 h-48 ml-[-10px]" />
              {/* <GalleryVerticalEnd className="size-5" /> */}
            </div>
            Suitpress IAO
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      {/* <div className="relative hidden lg:block">
        <img
          src="/main-auth-image.webp"
          alt="Image"
          className="absolute inset-0 h-auto w-auto object-center dark:brightness-[0.2] dark:grayscale mt-auto mb-auto rounded-xl"
        />
      </div> */}
    </div>
  )
}
