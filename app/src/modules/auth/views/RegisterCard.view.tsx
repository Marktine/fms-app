/** @jsxImportSource hono/jsx */

export const RegisterCard = () => (
  <>
    <form hx-post="/auth/register" hx-target="#auth-card" hx-swap="outerHTML" class="space-y-4">
      <div class="flex flex-col gap-2">
        <label class="data-font text-xs font-bold uppercase tracking-widest text-[#2D2A26]">Email</label>
        <input type="email" name="email" class="earthbound-input" required />
      </div>
      <div class="flex flex-col gap-2">
        <label class="data-font text-xs font-bold uppercase tracking-widest text-[#2D2A26]">Password</label>
        <input type="password" name="password" class="earthbound-input" required />
      </div>
      <div class="flex flex-col gap-2">
        <label class="data-font text-xs font-bold uppercase tracking-widest text-[#2D2A26]">Confirm Password</label>
        <input type="password" name="confirm_password" class="earthbound-input" required />
      </div>
      <button type="submit" class="earthbound-button-primary w-full mt-4">
        CREATE ACCOUNT
      </button>
    </form>
    <div class="mt-6 text-center">
      <p class="text-sm text-[#444840]">
        Already have an account? <a href="/auth/login" class="underline font-bold">Login here</a>
      </p>
    </div>
  </>
);
