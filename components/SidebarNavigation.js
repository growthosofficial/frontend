import Link from "next/link"
import { useState } from "react"
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
  Grid3X3
} from "lucide-react"

export default function SidebarNavigation({ currentPage = "knowledge" }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const toggleSidebar = () => setIsExpanded(v => !v)

  const sections = [
    {
      title: "Favorites",
      items: [
        { 
          href: "/profile", 
          icon: <User2 size={16} />, 
          label: "User",
          active: currentPage === "profile"
        },
        {
          href: "/knowledge",
          icon: <BookOpen size={16} />,
          label: "Knowledge List",
          active: currentPage === "knowledge"
        },
      ]
    },
    {
      title: "Actions",
      items: [
        {
          href: "/curate",
          icon: <Search size={16} />,
          label: "Curate Knowledge",
          active: currentPage === "curate"
        },
        {
          href: "/selfTest",
          icon: <Pencil size={16} />,
          label: "Self Test",
          active: currentPage === "test"
        },
        {
          href: "/agents",
          icon: <Bot size={16} />,
          label: "Deploy Agents",
          active: currentPage === "agents"
        }
      ]
    },
    {
      title: "Workspace",
      items: [
        ...[1, 2, 3].map(n => ({
          href: `/workspace/${n}`,
          icon: <Folder size={16} />,
          label: `Workspace ${n}`
        })),
        {
          href: "/workspace/new",
          icon: <FolderPlus size={16} />,
          label: "Add Workspace",
          dark: true
        }
      ]
    }
  ]

  return (
    <aside
      className={`
        relative flex flex-col transition-all duration-300
        h-screen p-3
        ${isExpanded ? "w-64" : "w-16"}
        bg-black/40 backdrop-blur-md shadow-xl border-r border-white/20
      `}
    >
      {/* Header */}
      <div
        className={`flex items-center h-12 px-4 border-b border-white/30
          ${isExpanded ? "justify-between" : "justify-center"}`}
      >
        {/* Left: title & action icons only when expanded */}
        {isExpanded && (
          <>
            <h1 className="text-lg font-bold text-lime-300">GrowthOS</h1>
            <div className="flex gap-1">
              <button className="bg-white/20 rounded-full p-1 hover:bg-white/30 transition">
                <Settings size={16} className="text-white" />
              </button>
              <button className="bg-white/20 rounded-full p-1 hover:bg-white/30 transition">
                <HelpCircle size={16} className="text-white" />
              </button>
            </div>
          </>
        )}

        {/* Toggle: always rendered, placed by the flex container */}
        <button
          onClick={toggleSidebar}
          className="bg-white/20 rounded-full p-1 hover:bg-white/30 transition"
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? <ChevronLeft size={16} className="text-white" /> : <ChevronRight size={16} className="text-white" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="mt-4 flex-1 overflow-y-auto">
        {sections.map(({ title, items }) => (
          <NavSection
            key={title}
            title={title}
            items={items}
            isExpanded={isExpanded}
          />
        ))}
      </nav>

      {/* Onboarding Button at Bottom */}
      <div className="mt-auto pt-4 flex justify-center">
        <Link
          href="/onboarding"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-lime-300 text-slate-700 hover:bg-lime-200 transition-colors text-xs font-semibold shadow"
          title="Go to Onboarding"
        >
          <Grid3X3 size={16} className="text-slate-600" />
          {isExpanded && <span>Onboarding</span>}
        </Link>
      </div>
    </aside>
  )
}

function NavSection({ title, items, isExpanded }) {
  return (
    <section className="mb-4">
      <div className="border-b border-white/30 pt-0 pb-4">
        {isExpanded && (
          <div className="pb-2">
            <h3 className="text-white/90 text-sm font-medium">{title}</h3>
          </div>
        )}
        <div className="flex flex-col space-y-3">
          {items.map(item => (
            <NavItem key={item.label} {...item} isExpanded={isExpanded} />
          ))}
        </div>
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
  dark = false
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center justify-between px-3 py-2 rounded-xl h-10 transition-all
        ${
          dark
            ? "bg-gray-800 text-white hover:bg-gray-700"
            : active
            ? "bg-lime-300 text-slate-700 hover:bg-lime-200 shadow-lg"
            : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
        }
        ${active && !dark ? "ring-2 ring-lime-400" : ""}
        ${active && dark ? "ring-2 ring-white" : ""}
      `}
      aria-current={active ? "page" : undefined}
      title={!isExpanded ? label : undefined}
    >
      <div className="flex items-center gap-2">
        <div className={dark ? "text-white" : active ? "text-slate-600" : "text-white"}>
          {icon}
        </div>
        {isExpanded && <span className="truncate w-full">{label}</span>}
      </div>
      {isExpanded && (
        <ChevronRight size={16} className={`${dark ? "text-gray-400" : active ? "text-slate-500" : "text-white/70"} transform rotate-90`} />
      )}
    </Link>
  )
}