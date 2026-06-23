/** @jsxImportSource hono/jsx */

export const LoginCard = () => (
  <>
    <form hx-post='/auth/login' hx-target='#auth-card' hx-swap='outerHTML' class='space-y-4'>
      <div class='flex flex-col gap-2'>
        <label class='data-font text-xs font-bold uppercase tracking-widest text-[#2D2A26]'>
          Email
        </label>
        <input type='email' name='email' class='earthbound-input' required />
      </div>
      <div class='flex flex-col gap-2'>
        <label class='data-font text-xs font-bold uppercase tracking-widest text-[#2D2A26]'>
          Password
        </label>
        <input type='password' name='password' class='earthbound-input' required />
      </div>
      <button type='submit' class='earthbound-button-primary w-full mt-4'>
        ENTER VAULT
      </button>
    </form>
    <div class='mt-6 text-center'>
      <p class='text-sm text-[#444840]'>
        New collector? <a href='/auth/register' class='underline font-bold'>Register here</a>
      </p>
    </div>
  </>
);
