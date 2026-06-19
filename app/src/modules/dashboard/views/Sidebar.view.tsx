/** @jsxImportSource hono/jsx */

import { Fragment } from 'hono/jsx';
import { Icon } from '../../../ui/components/Icon.tsx';
import { Button } from '../../../ui/components/Button.tsx';
import {
  ChevronLeft,
  Flag,
  LayoutDashboard,
  LogOut,
  Plus,
  Receipt,
  Settings,
  User,
  Wallet,
  X,
} from 'lucide';

export const Sidebar = () => (
  <Fragment>
    {/* Mobile Sidebar Backdrop */}
    <div
      id='sidebar-backdrop'
      class='fixed inset-0 bg-[#2D2A26]/40 dark:bg-black/60 z-40 transition-opacity duration-300 md:hidden opacity-0 pointer-events-none [.sidebar-mobile-open_&]:opacity-100 [.sidebar-mobile-open_&]:pointer-events-auto'
      onclick='window.closeMobileSidebar()'
    />

    <nav class='sidebar-container flex -translate-x-full md:translate-x-0 w-[280px] h-screen border-r-[3px] border-[#2D2A26] dark:border-stone-800 bg-[#F2EFE9] dark:bg-stone-900 fixed left-0 top-0 flex-col py-8 z-50 transition-all duration-300 ease-in-out'>
      {/* Desktop Collapse Toggle Button (Floating) */}
      <button
        type='button'
        onclick='window.toggleSidebar()'
        class='sidebar-toggle-btn absolute top-20 -right-4 w-8 h-8 rounded-full border-[3px] border-[#2D2A26] dark:border-stone-800 bg-[#F2EFE9] dark:bg-stone-900 hover:bg-[#F9F8F6] dark:hover:bg-stone-800 flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#2D2A26] z-50 md:flex hidden hover:scale-105 transition-all duration-200'
        title='Toggle Sidebar'
      >
        <Icon icon={ChevronLeft} class='w-4 h-4 text-[#2D2A26] dark:text-stone-300' />
      </button>

      {/* Mobile Close Button (Top Right Inside Sidebar) */}
      <button
        type='button'
        onclick='window.closeMobileSidebar()'
        class='absolute top-4 right-4 w-8 h-8 rounded-full border-[3px] border-[#2D2A26] dark:border-stone-800 bg-[#F2EFE9] dark:bg-stone-900 hover:bg-[#F9F8F6] dark:hover:bg-stone-800 flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#2D2A26] z-50 md:hidden hover:scale-105 transition-all duration-200'
        title='Close Sidebar'
      >
        <Icon icon={X} class='w-4 h-4 text-[#2D2A26] dark:text-stone-300' />
      </button>

      <div class='sidebar-header px-8 mb-xl flex flex-col gap-xs transition-all duration-300'>
        <div class='w-16 h-16 rounded-full border-[3px] border-[#2D2A26] bg-primary-fixed flex items-center justify-center overflow-hidden mb-sm shadow-[4px_4px_0px_#2D2A26] flex-shrink-0 transition-all duration-300'>
          <Icon icon={User} class='w-8 h-8 text-[#2D2A26]' />
        </div>
        <h1 class='sidebar-text text-2xl font-black text-[#2D2A26] dark:text-stone-100 tracking-tight font-h2 whitespace-nowrap transition-all duration-300'>
          Earthbound Matte
        </h1>
        <p class='sidebar-text font-body-md text-body-md text-outline whitespace-nowrap transition-all duration-300'>
          Personal Ledger
        </p>
      </div>

      <Button variant='primary' class='sidebar-button mx-8 mb-8 transition-all duration-300'>
        <Icon icon={Plus} class='w-5 h-5 flex-shrink-0' />
        <span class='sidebar-text whitespace-nowrap'>New Entry</span>
      </Button>

      <div class='flex flex-col gap-2 w-full font-serif text-lg font-bold'>
        {/* Active Tab: Ledger */}
        <a
          class='sidebar-link flex items-center gap-4 bg-[#6B7F62] text-white border-[3px] border-[#2D2A26] shadow-[4px_4px_0px_#2D2A26] mx-4 my-2 px-4 py-3 rounded-lg transition-all duration-300'
          href='#'
        >
          <Icon icon={LayoutDashboard} class='w-5 h-5 flex-shrink-0' />
          <span class='sidebar-text whitespace-nowrap'>Ledger</span>
        </a>
        {/* Inactive Tabs */}
        <a
          class='sidebar-link flex items-center gap-4 text-[#2D2A26] dark:text-stone-300 hover:bg-[#F9F8F6] mx-4 my-2 px-4 py-3 transition-all hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg duration-300'
          href='#'
        >
          <Icon icon={Receipt} class='w-5 h-5 flex-shrink-0' />
          <span class='sidebar-text whitespace-nowrap'>Exchanges</span>
        </a>
        <a
          class='sidebar-link flex items-center gap-4 text-[#2D2A26] dark:text-stone-300 hover:bg-[#F9F8F6] mx-4 my-2 px-4 py-3 transition-all hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg duration-300'
          href='#'
        >
          <Icon icon={Wallet} class='w-5 h-5 flex-shrink-0' />
          <span class='sidebar-text whitespace-nowrap'>Allocations</span>
        </a>
        <a
          class='sidebar-link flex items-center gap-4 text-[#2D2A26] dark:text-stone-300 hover:bg-[#F9F8F6] mx-4 my-2 px-4 py-3 transition-all hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg duration-300'
          href='#'
        >
          <Icon icon={Flag} class='w-5 h-5 flex-shrink-0' />
          <span class='sidebar-text whitespace-nowrap'>Milestones</span>
        </a>
        <a
          class='sidebar-link flex items-center gap-4 text-[#2D2A26] dark:text-stone-300 hover:bg-[#F9F8F6] mx-4 my-2 px-4 py-3 transition-all hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg duration-300'
          href='#'
        >
          <Icon icon={Settings} class='w-5 h-5 flex-shrink-0' />
          <span class='sidebar-text whitespace-nowrap'>Preferences</span>
        </a>
      </div>

      {/* Logout Button */}
      <div class='sidebar-logout-container mt-auto px-4 w-full font-serif text-lg font-bold transition-all duration-300'>
        <button
          type='button'
          class='sidebar-logout flex items-center gap-4 text-[#A83232] dark:text-red-400 hover:bg-[#FCEBEB] dark:hover:bg-red-950/30 w-[calc(100%-2rem)] mx-4 px-4 py-3 transition-all rounded-lg cursor-pointer text-left border-none bg-transparent duration-300'
          hx-post='/auth/logout'
        >
          <Icon icon={LogOut} class='w-5 h-5 flex-shrink-0' />
          <span class='sidebar-text whitespace-nowrap'>Logout</span>
        </button>
      </div>
    </nav>
  </Fragment>
);
