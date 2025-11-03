'use client';

import { JSX, useCallback, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MENU_SIDEBAR } from '@/config/menu.config';
import { MenuConfig, MenuItem } from '@/config/types';
import { cn } from '@/lib/utils';
import {
  AccordionMenu,
  AccordionMenuClassNames,
  AccordionMenuGroup,
  AccordionMenuItem,
  AccordionMenuLabel,
  AccordionMenuSub,
  AccordionMenuSubContent,
  AccordionMenuSubTrigger,
} from '@/components/ui/accordion-menu';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/context/SessionContext';
import { logout } from '@/api/user';
import { useSettings } from '@/providers/settings-provider';

export function SidebarMenu() {
  const pathname = usePathname();
  const { settings } = useSettings();
  const [isHRManagementCollapsed, setIsHRManagementCollapsed] = useState(false);

  // Memoize matchPath to prevent unnecessary re-renders
  const matchPath = useCallback(
    (path: string): boolean =>
      path === pathname || (path.length > 1 && pathname.startsWith(path)),
    [pathname],
  );

  // Global classNames for consistent styling
  const classNames: AccordionMenuClassNames = {
    root: 'space-y-2 pr-3',
    group: 'gap-px',
    label:
      'uppercase text-xs font-medium text-muted-foreground/70 pt-2.25 pb-px',
    separator: '',
    item: 'h-8 hover:bg-transparent text-[#4b4b4b] hover:text-[#0D978B] data-[selected=true]:text-[#0D978B] data-[selected=true]:bg-[#D6EEEC] data-[selected=true]:font-medium',
    sub: '',
    subTrigger:
      'h-8 hover:bg-transparent text-[#4b4b4b] hover:text-[#0D978B] data-[selected=true]:text-[#0D978B] data-[selected=true]:bg-[#D6EEEC] data-[selected=true]:font-medium',
    subContent: 'py-0',
    indicator: '',
  };

  const buildMenu = (items: MenuConfig): JSX.Element[] => {
    let isInHRManagementSection = false;

    return items.map((item: MenuItem, index: number) => {
      if (item.heading) {
        // Check if this is the HR Management heading
        if (item.heading === 'HR Management') {
          isInHRManagementSection = true;
          return buildMenuHeading(item, index, true);
        }
        return buildMenuHeading(item, index, false);
      } else if (item.disabled) {
        // Check if this item should be hidden when HR Management is collapsed
        if (isInHRManagementSection && isHRManagementCollapsed) {
          // Check if this is "HR Settings" - this is the last item to hide
          if (item.title === 'HR Settings') {
            isInHRManagementSection = false; // End HR Management section after HR Settings
            return null; // Hide HR Settings when collapsed
          }
          // Hide all other items in HR Management section when collapsed
          return null;
        }
        // If we encounter HR Settings, end the section
        if (item.title === 'HR Settings') {
          isInHRManagementSection = false;
        }
        return buildMenuItemRootDisabled(item, index);
      } else {
        // Check if this item should be hidden when HR Management is collapsed
        if (isInHRManagementSection && isHRManagementCollapsed) {
          // Check if this is "HR Settings" - this is the last item to hide
          if (item.title === 'HR Settings') {
            isInHRManagementSection = false; // End HR Management section after HR Settings
            return null; // Hide HR Settings when collapsed
          }
          // Hide all other items in HR Management section when collapsed
          return null;
        }
        // If we encounter HR Settings, end the section
        if (item.title === 'HR Settings') {
          isInHRManagementSection = false;
        }
        return buildMenuItemRoot(item, index);
      }
    }).filter((item): item is JSX.Element => item !== null);
  };


  const buildMenuItemRoot = (item: MenuItem, index: number): JSX.Element => {
    if (item.children) {
      return (
        <AccordionMenuSub key={index} value={item.path || `root-${index}`}>
          <AccordionMenuSubTrigger className={`text-[12px]/[18px] font-medium px-[8px] py-[7px] ${settings.layouts.demo1.sidebarCollapse ? 'ml-[8px]' : ''}`}>
            {item.icon && <item.icon data-slot="accordion-menu-icon" />}
            <span data-slot="accordion-menu-title" className="whitespace-nowrap">{item.title}</span>
          </AccordionMenuSubTrigger>
          <AccordionMenuSubContent
            type="single"
            collapsible
            parentValue={item.path || `root-${index}`}
            className="ps-[30px]"
          >
            <AccordionMenuGroup>
              {buildMenuItemChildren(item.children, 1)}
            </AccordionMenuGroup>
          </AccordionMenuSubContent>
        </AccordionMenuSub>
      );
    } else {
      return (
        <AccordionMenuItem
          key={index}
          value={item.path || ''}
          className={`text-[12px]/[18px] font-medium px-[8px] py-[7px] ${settings.layouts.demo1.sidebarCollapse ? 'ml-[8px]' : ''}`}
        >
          <Link
            href={item.path || '#'}
            className="flex items-center gap-0"
          >
            {item.icon && <item.icon data-slot="accordion-menu-icon" className="w-[14px] h-[14px]" />}
            <span data-slot="accordion-menu-title" className="whitespace-nowrap">{item.title}</span>
          </Link>
        </AccordionMenuItem>
      );
    }
  };

  const buildMenuItemRootDisabled = (
    item: MenuItem,
    index: number,
  ): JSX.Element => {
    return (
      <AccordionMenuItem
        key={index}
        value={`disabled-${index}`}
        className="text-[12px]/[18px] font-medium"
      >
        {item.icon && <item.icon data-slot="accordion-menu-icon" />}
        <span data-slot="accordion-menu-title" className="whitespace-nowrap">{item.title}</span>
        {item.disabled && (
          <Badge variant="secondary" size="sm" className="ms-auto me-[-10px]">
            Soon
          </Badge>
        )}
      </AccordionMenuItem>
    );
  };

  const buildMenuItemChildren = (
    items: MenuConfig,
    level: number = 0,
  ): JSX.Element[] => {
    return items.map((item: MenuItem, index: number) => {
      if (item.disabled) {
        return buildMenuItemChildDisabled(item, index, level);
      } else {
        return buildMenuItemChild(item, index, level);
      }
    });
  };

  const buildMenuItemChild = (
    item: MenuItem,
    index: number,
    level: number = 0,
  ): JSX.Element => {
    if (item.children) {
      return (
        <AccordionMenuSub
          key={index}
          value={item.path || `child-${level}-${index}`}
        >
          <AccordionMenuSubTrigger className="text-[12px]/[18px]">
            {item.collapse ? (
              <span className="text-muted-foreground">
                <span className="hidden [[data-state=open]>span>&]:inline">
                  {item.collapseTitle}
                </span>
                <span className="inline [[data-state=open]>span>&]:hidden">
                  {item.expandTitle}
                </span>
              </span>
            ) : (
              <span className="whitespace-nowrap">{item.title}</span>
            )}
          </AccordionMenuSubTrigger>
          <AccordionMenuSubContent
            type="single"
            collapsible
            parentValue={item.path || `child-${level}-${index}`}
            className={cn(
              'ps-4',
              !item.collapse && 'relative',
              !item.collapse && (level > 0 ? '' : ''),
            )}
          >
            <AccordionMenuGroup>
              {buildMenuItemChildren(
                item.children,
                item.collapse ? level : level + 1,
              )}
            </AccordionMenuGroup>
          </AccordionMenuSubContent>
        </AccordionMenuSub>
      );
    } else {
      return (
        <AccordionMenuItem
          key={index}
          value={item.path || ''}
          className="text-[12px]/[18px]"
        >
          <div className="relative">
            <Link href={item.path || '#'} className="flex items-center text-[13px]/[20px] h-full py-[6px] whitespace-nowrap" prefetch>{item.title}</Link>
            <div className="absolute border-l border-[#ededed] border-b w-[10px] h-full top-[-14px] left-[-22px]"></div>
          </div>
        </AccordionMenuItem>
      );
    }
  };

  const buildMenuItemChildDisabled = (
    item: MenuItem,
    index: number,
    level: number = 0,
  ): JSX.Element => {
    return (
      <AccordionMenuItem
        key={index}
        value={`disabled-child-${level}-${index}`}
        className="text-[12px]/[18px]"
      >
        <span data-slot="accordion-menu-title" className="whitespace-nowrap">{item.title}</span>
        {item.disabled && (
          <Badge variant="secondary" size="sm" className="ms-auto me-[-10px]">
            Soon
          </Badge>
        )}
      </AccordionMenuItem>
    );
  };

  const buildMenuHeading = (item: MenuItem, index: number, isCollapsible: boolean = false): JSX.Element => {
    if (isCollapsible && item.heading === 'HR Management') {
      return (
        <div
          key={index}
          onClick={() => setIsHRManagementCollapsed(!isHRManagementCollapsed)}
          className={cn(
            'text-[11px]/[16px] text-[#a5a5a5] pt-[18px] mb-[8px] cursor-pointer select-none ',
            settings.layouts.demo1.sidebarCollapse ? 'ml-[14px] ' : 'pl-[8px]'
          )}
        >
          {settings.layouts.demo1.sidebarCollapse ? 'HR.M' : item.heading}
        </div>
      );
    }
    return <AccordionMenuLabel className={`text-[11px]/[16px] text-[#a5a5a5] pt-[18px] mb-[8px] ${settings.layouts.demo1.sidebarCollapse ? 'ml-[14px] ' : ''}`} key={index}>{item.heading}</AccordionMenuLabel>;
  };

  const { setSession, setLoading } = useSession();
  const router = useRouter();
  const handleLogout = async () => {
    setLoading(true);
    const response = await logout()
    if (response.data.status === true) {
      setSession({ token: "", authenticated: false })
      router.push('/signin')
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }

  return (
    <div className='flex flex-col justify-between '>
      <div className={`kt-scrollable-y-hover scrollbar-hidden flex grow shrink-0 pt-[48px] px-[${settings.layouts.demo1.sidebarCollapse ? '14px' : '24px'}] lg:max-h-[calc(100vh-5.5rem)]`}>
        <AccordionMenu
          selectedValue={pathname}
          matchPath={matchPath}
          type="single"
          collapsible
          classNames={classNames}
        >
          {buildMenu(MENU_SIDEBAR)}
        </AccordionMenu>

      </div>

    </div>
  );
}
