import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Navbar, Sidebar, NavGroup, NavItem, Breadcrumb, BreadcrumbItem } from './Navigation';

const meta: Meta = {
  title: 'Organisms/Navigation',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Navigation components including Navbar, Sidebar, and Breadcrumbs.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Icons
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ProjectsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 via-purple-500 to-pink-500" />
    <span className="font-bold text-slate-900">elmer</span>
  </div>
);

export const NavbarDefault: Story = {
  render: () => (
    <Navbar logo={<Logo />}>
      <div className="flex-1 flex items-center justify-center max-w-xl mx-4">
        <div className="w-full relative">
          <SearchIcon />
          <input
            placeholder="Search..."
            className="w-full h-9 pl-10 pr-4 rounded-lg bg-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <BellIcon />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-purple-500" />
      </div>
    </Navbar>
  ),
};

export const NavbarGlass: Story = {
  render: () => (
    <div className="min-h-[200px] bg-gradient-to-br from-teal-500 via-purple-500 to-pink-500">
      <Navbar logo={<Logo />} glass sticky>
        <div className="flex items-center gap-4">
          <button className="text-sm text-slate-600 hover:text-slate-900">Dashboard</button>
          <button className="text-sm text-slate-600 hover:text-slate-900">Projects</button>
          <button className="text-sm text-slate-600 hover:text-slate-900">Settings</button>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200" />
        </div>
      </Navbar>
    </div>
  ),
};

export const SidebarDefault: Story = {
  render: () => (
    <div className="flex h-[500px]">
      <Sidebar>
        <div className="p-4">
          <Logo />
        </div>
        <NavGroup label="Main">
          <NavItem icon={<HomeIcon />} active>Dashboard</NavItem>
          <NavItem icon={<ProjectsIcon />} badge={<span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full">3</span>}>Projects</NavItem>
          <NavItem icon={<DocumentIcon />}>Documents</NavItem>
        </NavGroup>
        <NavGroup label="Settings">
          <NavItem icon={<SettingsIcon />}>Settings</NavItem>
        </NavGroup>
      </Sidebar>
      <main className="flex-1 p-6 bg-slate-50">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      </main>
    </div>
  ),
};

const CollapsibleSidebarTemplate = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div className="flex h-[500px]">
      <Sidebar collapsed={collapsed}>
        <div className="p-4 flex items-center justify-between">
          {!collapsed && <Logo />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </button>
        </div>
        <NavGroup label={!collapsed ? "Main" : undefined}>
          <NavItem icon={<HomeIcon />} active collapsed={collapsed}>Dashboard</NavItem>
          <NavItem icon={<ProjectsIcon />} collapsed={collapsed}>Projects</NavItem>
          <NavItem icon={<DocumentIcon />} collapsed={collapsed}>Documents</NavItem>
        </NavGroup>
        <NavGroup label={!collapsed ? "Settings" : undefined}>
          <NavItem icon={<SettingsIcon />} collapsed={collapsed}>Settings</NavItem>
        </NavGroup>
      </Sidebar>
      <main className="flex-1 p-6 bg-slate-50">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Click the arrow to collapse/expand the sidebar.</p>
      </main>
    </div>
  );
};

export const SidebarCollapsible: Story = {
  render: () => <CollapsibleSidebarTemplate />,
};

export const BreadcrumbDefault: Story = {
  render: () => (
    <div className="p-6">
      <Breadcrumb>
        <BreadcrumbItem href="#">Home</BreadcrumbItem>
        <BreadcrumbItem href="#">Projects</BreadcrumbItem>
        <BreadcrumbItem href="#">User Onboarding</BreadcrumbItem>
        <BreadcrumbItem current>PRD</BreadcrumbItem>
      </Breadcrumb>
    </div>
  ),
};

export const BreadcrumbCustomSeparator: Story = {
  render: () => (
    <div className="p-6">
      <Breadcrumb separator="›">
        <BreadcrumbItem href="#">Home</BreadcrumbItem>
        <BreadcrumbItem href="#">Settings</BreadcrumbItem>
        <BreadcrumbItem current>Account</BreadcrumbItem>
      </Breadcrumb>
    </div>
  ),
};

export const FullLayout: Story = {
  render: () => (
    <div className="flex flex-col h-[600px] bg-slate-50">
      <Navbar logo={<Logo />} sticky>
        <div className="flex-1 flex items-center justify-center max-w-xl mx-4">
          <input
            placeholder="Search..."
            className="w-full h-9 px-4 rounded-lg bg-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <BellIcon />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-purple-500" />
        </div>
      </Navbar>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar>
          <NavGroup label="Main">
            <NavItem icon={<HomeIcon />}>Dashboard</NavItem>
            <NavItem icon={<ProjectsIcon />} active>Projects</NavItem>
            <NavItem icon={<DocumentIcon />}>Documents</NavItem>
          </NavGroup>
        </Sidebar>
        <main className="flex-1 p-6 overflow-auto">
          <Breadcrumb className="mb-4">
            <BreadcrumbItem href="#">Home</BreadcrumbItem>
            <BreadcrumbItem href="#">Projects</BreadcrumbItem>
            <BreadcrumbItem current>User Onboarding</BreadcrumbItem>
          </Breadcrumb>
          <h1 className="text-2xl font-bold text-slate-900">User Onboarding</h1>
          <p className="text-slate-600 mt-2">Project details and documentation.</p>
        </main>
      </div>
    </div>
  ),
};
