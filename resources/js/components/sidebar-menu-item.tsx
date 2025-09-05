"use client"
import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { MenuItem } from "@/types/ui"

interface SidebarMenuItemProps {
  item: MenuItem
  isOpen?: boolean
  onToggle?: () => void
  level?: number
}

export function SidebarMenuItemComponent({ item, isOpen = false, onToggle, level = 0 }: SidebarMenuItemProps) {
  const hasChildren = item.children && item.children.length > 0
  const isSubItem = level > 0

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              className={cn("w-full group/menu-item", item.disabled && "opacity-50 cursor-not-allowed")}
              disabled={item.disabled}
            >
              {item.icon && <item.icon className="size-4 shrink-0" />}
              <span className="flex-1 truncate">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs shrink-0">
                  {item.badge}
                </Badge>
              )}
              <ChevronRight
                className={cn("size-4 shrink-0 transition-transform duration-200", isOpen && "rotate-90")}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent className="transition-all duration-200 ease-in-out">
            <SidebarMenuSub>
              {item.children?.map((child) => (
                <SidebarMenuItemComponent key={child.id} item={child} level={level + 1} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  const MenuButton = (
    <SidebarMenuButton
      asChild={!!item.url}
      isActive={item.isActive}
      className={cn("w-full group/menu-item", item.disabled && "opacity-50 cursor-not-allowed", isSubItem && "pl-6")}
      disabled={item.disabled}
      onClick={item.onClick}
    >
      {item.url ? (
        <a href={item.url} className="flex items-center gap-2 w-full">
          {item.icon && <item.icon className="size-4 shrink-0" />}
          <span className="flex-1 truncate">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs shrink-0">
              {item.badge}
            </Badge>
          )}
        </a>
      ) : (
        <>
          {item.icon && <item.icon className="size-4 shrink-0" />}
          <span className="flex-1 truncate">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs shrink-0">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </SidebarMenuButton>
  )

  if (isSubItem) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild={!!item.url} isActive={item.isActive}>
          {item.url ? (
            <a href={item.url} className="flex items-center gap-2 w-full">
              {item.icon && <item.icon className="size-4 shrink-0" />}
              <span className="flex-1 truncate">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs shrink-0">
                  {item.badge}
                </Badge>
              )}
            </a>
          ) : (
            <>
              {item.icon && <item.icon className="size-4 shrink-0" />}
              <span className="flex-1 truncate">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs shrink-0">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    )
  }

  return <SidebarMenuItem>{MenuButton}</SidebarMenuItem>
}
