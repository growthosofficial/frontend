import Link from "next/link"
import { useState, useEffect } from "react"
import {
  Settings,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Search,
  Pencil,
  Bot,
  FolderPlus,
  Folder,
  User2,
  BookOpen,
  Grid3X3,
  Menu,
  X
} from "lucide-react"

export default function SidebarNavigation({ currentPage = "knowledge" }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsExpanded(false)
        setIsMobileOpen(false)
      } else {
        setIsExpanded(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen)
    } else {
      setIsExpanded(!isExpanded)
    }
  }

  const closeMobileMenu = () => {
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }

  const sections = [
    {
      title: "Favorites",
      items: [
        { href: "/profile", icon: <User2 size={18} />, label: "Profile" },
        {
          href: "/knowledge",
          icon: <BookOpen size={18} />,
          label: "Knowledge",
          active: currentPage === "knowledge"
        },
      ]
    },
    {
      title: "Actions",
      items: [
        {
          href: "/curate",
          icon: <Search size={18} />,
          label: "Curate",
          active: currentPage === "curate"
        },
        {
          href: "/selfTest",
          icon: <Pencil size={18} />,
          label: "Self Test",
          active: currentPage === "test"
        },
        {
          href: "/agents",
          icon: <Bot size={18} />,
          label: "Agents",
          active: currentPage === "agents"
        }
      ]
    },
    {
      title: "Workspace",
      items: [
        ...[1, 2, 3].map(n => ({
          href: `/workspace/${n}`,
          icon: <Folder size={18} />,
          label: `Workspace ${n}`
        })),
        {
          href: "/workspace/new",
          icon: <FolderPlus size={18} />,
          label: "New Workspace",
          dark: true
        }
      ]
    }
  ]

  // Mobile overlay
  if (isMobile && isMobileOpen) {
    return (
      <>
        {/* Mobile overlay */}
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
        
        {/* Mobile sidebar */}
        <aside className="fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-50 lg:hidden transform transition-transform duration-300">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-lime-200">
              <h1 className="text-xl font-bold text-lime-500">GrowthOS</h1>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-lg hover:bg-lime-50 transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              {sections.map(({ title, items }) => (
                <NavSection
                  key={title}
                  title={title}
                  items={items}
                  isExpanded={true}
                  onItemClick={closeMobileMenu}
                />
              ))}
            </nav>

            {/* Mobile Onboarding */}
            <div className="p-4 border-t border-lime-200">
              <Link
                href="/onboarding"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-lime-100 text-lime-700 hover:bg-lime-200 transition-colors font-medium"
              >
                <Grid3X3 size={18} className="text-lime-600" />
                <span>Onboarding</span>
              </Link>
            </div>
          </div>
        </aside>
      </>
    )
  }

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-30 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg lg:hidden"
        >
          <Menu size={20} className="text-gray-700" />
        </button>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col transition-all duration-300 ease-in-out
          h-screen overflow-hidden
          ${isExpanded ? "w-72" : "w-20"}
          bg-white/95 backdrop-blur-xl shadow-xl
        `}
      >
        {/* Header */}
        <div className="flex items-center h-16 px-4 border-b border-lime-200 flex-shrink-0">
          {isExpanded ? (
            <div className="flex items-center justify-between w-full">
              <h1 className="text-xl font-bold text-lime-500">GrowthOS</h1>
              <div className="flex gap-1">
                <button className="p-2 rounded-lg hover:bg-lime-50 transition-colors">
                  <Settings size={18} className="text-gray-600" />
                </button>
                <button className="p-2 rounded-lg hover:bg-lime-50 transition-colors">
                  <HelpCircle size={18} className="text-gray-600" />
                </button>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-lime-50 transition-colors"
                  title="Collapse sidebar"
                >
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-lime-50 transition-colors"
                title="Expand sidebar"
              >
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          {sections.map(({ title, items }) => (
            <NavSection
              key={title}
              title={title}
              items={items}
              isExpanded={isExpanded}
            />
          ))}
        </nav>

        {/* Onboarding Button */}
        <div className="p-4 border-t border-lime-200 flex-shrink-0">
          <Link
            href="/onboarding"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl bg-lime-100 text-lime-700 
              hover:bg-lime-200 transition-colors font-medium
              ${!isExpanded && "justify-center"}
            `}
            title={!isExpanded ? "Onboarding" : undefined}
          >
            <Grid3X3 size={18} className="text-lime-600 flex-shrink-0" />
            {isExpanded && <span>Onboarding</span>}
          </Link>
        </div>
      </aside>
    </>
  )
}

function NavSection({ title, items, isExpanded, onItemClick }) {
  return (
    <section className="mb-6 last:mb-0">
      <div className="space-y-1">
        {items.map(item => (
          <NavItem 
            key={item.label} 
            {...item} 
            isExpanded={isExpanded}
            onClick={onItemClick}
          />
        ))}
      </div>
    </section>
  )
}

function NavItem({
  href,
  icon,
  label,
  isExpanded,
  active = false,
  dark = false,
  customStyle,
  onClick
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
        group relative overflow-hidden min-w-0
        ${
          customStyle
            ? ""
            : dark
            ? "bg-lime-600 text-white hover:bg-lime-700"
            : active
            ? "bg-lime-50 text-lime-700 border border-lime-200"
            : "text-gray-700 hover:bg-lime-50 hover:text-gray-900"
        }
        ${!isExpanded && "justify-center"}
      `}
      style={customStyle}
      aria-current={active ? "page" : undefined}
      title={!isExpanded ? label : undefined}
    >
      {/* Active indicator */}
      {active && isExpanded && !customStyle && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-lime-500 rounded-r-full" />
      )}
      
      <div className={`
        flex items-center gap-3 min-w-0 flex-1
        ${customStyle ? "text-white" : dark ? "text-white" : active ? "text-lime-600" : "text-gray-600 group-hover:text-gray-700"}
      `}>
        <div className="flex-shrink-0">
          {icon}
        </div>
        {isExpanded && (
          <span className="font-medium text-sm truncate">{label}</span>
        )}
      </div>
    </Link>
  )
}