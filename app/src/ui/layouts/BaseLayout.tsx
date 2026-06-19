/** @jsxImportSource hono/jsx */

import { Child } from 'hono/jsx';

type BaseLayoutProps = {
  children: Child;
  title: string;
  bodyClass?: string;
};

export const BaseLayout = ({ children, title, bodyClass = '' }: BaseLayoutProps) => (
  <html class='light' lang='en'>
    <head>
      <meta charset='UTF-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <title>{title} | FMS</title>
      <script src='/static/vendor/htmx.min.js' defer></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
        // Check local storage for sidebar state immediately to prevent flicker
        (function() {
          try {
            const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
            if (isCollapsed) {
              document.documentElement.classList.add('sidebar-collapsed');
            }
          } catch (e) {}
        })();

        window.toggleSidebar = function() {
          const isCollapsed = document.documentElement.classList.toggle('sidebar-collapsed');
          localStorage.setItem('sidebar-collapsed', isCollapsed ? 'true' : 'false');
        };

        window.toggleMobileSidebar = function() {
          document.documentElement.classList.toggle('sidebar-mobile-open');
        };

        window.closeMobileSidebar = function() {
          document.documentElement.classList.remove('sidebar-mobile-open');
        };

        document.addEventListener('htmx:beforeOnLoad', function (evt) {
          if (evt.detail.xhr.status === 400 || evt.detail.xhr.status === 422) {
            evt.detail.shouldSwap = true;
            evt.detail.isError = false;
          }
        });
      `,
        }}
      />
      <link
        href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap'
        rel='stylesheet'
      />
      <link
        href='https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&amp;family=Fraunces:opsz,wght@9..144,500;9..144,600&amp;family=DM+Sans:wght@400;500;700&amp;display=swap'
        rel='stylesheet'
      />
      <script src='https://cdn.tailwindcss.com?plugins=forms,container-queries'></script>
      <script src='/static/scripts/tailwind_config.js'></script>
      <link href='/static/styles/custom_tailwind.css' rel='stylesheet' />
    </head>
    <body
      class={`bg-[#F2EFE9] text-on-surface font-body-md min-h-screen flex selection:bg-primary-fixed selection:text-on-primary-fixed ${bodyClass}`}
    >
      {children}
      <div
        id='toaster-container'
        class='fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none'
      >
      </div>
    </body>
  </html>
);
