/** @jsxImportSource hono/jsx */

import { Child } from 'hono/jsx';
import { BaseLayout } from './BaseLayout.tsx';
import { Sidebar } from '../../modules/dashboard/views/Sidebar.view.tsx';
import { Button } from '../components/Button.tsx';
import { Icon } from '../components/Icon.tsx';
import { Bell, HelpCircle, Menu } from 'lucide';

type AuthenticatedLayoutProps = {
  children: Child;
  title: string;
};

export const AuthenticatedLayout = ({ children, title }: AuthenticatedLayoutProps) => (
  <BaseLayout title={title}>
    <Sidebar />

    {/* Main Content Area */}
    <main class='main-content-container flex-1 ml-0 md:ml-[280px] flex flex-col min-h-screen bg-surface-container relative transition-all duration-300 ease-in-out'>
      {/* Top App Header */}
      <header class='bg-[#F9F8F6] dark:bg-stone-950 w-full border-b-[3px] border-[#2D2A26] dark:border-stone-800 sticky top-0 z-40 flex items-center justify-between px-8 py-4 h-16 font-serif tracking-tight'>
        <div class='flex items-center gap-4'>
          <Button
            variant='ghost'
            onclick='window.toggleMobileSidebar()'
            class='md:hidden flex items-center justify-center p-2 rounded-full border-[3px] border-[#2D2A26] dark:border-stone-800 bg-[#F2EFE9] dark:bg-stone-900 shadow-[2px_2px_0px_#2D2A26] hover:scale-105 transition-all duration-200'
            title='Open Menu'
          >
            <Icon icon={Menu} class='w-5 h-5 text-[#2D2A26] dark:text-stone-300' />
          </Button>
        </div>
        <div class='flex-grow'></div>
        <div class='flex-1 flex justify-end items-center gap-4 text-[#2D2A26] dark:text-stone-100'>
          <Button variant='ghost'>
            <Icon icon={Bell} class='w-5 h-5' />
          </Button>
          <Button variant='ghost'>
            <Icon icon={HelpCircle} class='w-5 h-5' />
          </Button>
        </div>
      </header>

      {/* Canvas */}
      <div class='flex-1 w-full max-w-[1280px] mx-auto p-margin flex justify-center'>
        {children}
      </div>
    </main>
  </BaseLayout>
);
