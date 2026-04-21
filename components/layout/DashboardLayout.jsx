"use client";
import { useState } from "react";
import Avatar from "@/components/ui/data/Avatar";
import Badge from "@/components/ui/data/Badge";
import Dropdown from "@/components/ui/navigation/Dropdown";
import Tooltip from "@/components/ui/data/Tooltip";

const NAV_ITEMS = [
	{
		divider: true,
		label: "UTAMA",
	},
	{
		key: "dashboard",
		label: "Dashboard",
		icon: "fa-chart-pie",
		href: "/dashboard",
	},
	{
		key: "pos",
		label: "Point of Sale",
		icon: "fa-cash-register",
		href: "/dashboard/pos",
	},
	{
		divider: true,
		label: "INVENTORI",
	},
	{
		key: "products",
		label: "Produk",
		icon: "fa-box",
		href: "/dashboard/products",
		badge: "124",
	},
	{
		key: "categories",
		label: "Kategori",
		icon: "fa-tags",
		href: "/dashboard/categories",
	},
	{
		key: "stock",
		label: "Stok & Gudang",
		icon: "fa-boxes-stacked",
		href: "/dashboard/stock",
		badge: "3",
		badgeVariant: "danger",
	},
	{
		key: "suppliers",
		label: "Supplier",
		icon: "fa-truck",
		href: "/dashboard/suppliers",
	},
	{
		divider: true,
		label: "PENJUALAN",
	},
	{
		key: "orders",
		label: "Pesanan",
		icon: "fa-receipt",
		href: "/dashboard/orders",
		badge: "12",
		badgeVariant: "warning",
		children: [
			{ key: "orders-all", label: "Semua Pesanan", href: "/dashboard/orders" },
			{
				key: "orders-pending",
				label: "Menunggu",
				href: "/dashboard/orders/pending",
			},
			{ key: "orders-done", label: "Selesai", href: "/dashboard/orders/done" },
		],
	},
	{
		key: "customers",
		label: "Pelanggan",
		icon: "fa-users",
		href: "/dashboard/customers",
	},
	{
		key: "promos",
		label: "Promo & Diskon",
		icon: "fa-percent",
		href: "/dashboard/promos",
	},
	{
		divider: true,
		label: "KEUANGAN",
	},
	{
		key: "finance",
		label: "Keuangan",
		icon: "fa-wallet",
		href: "/dashboard/finance",
		children: [
			{
				key: "finance-income",
				label: "Pemasukan",
				href: "/dashboard/finance/income",
			},
			{
				key: "finance-expense",
				label: "Pengeluaran",
				href: "/dashboard/finance/expense",
			},
			{
				key: "finance-report",
				label: "Laporan",
				href: "/dashboard/finance/report",
			},
		],
	},
	{
		key: "reports",
		label: "Laporan",
		icon: "fa-chart-bar",
		href: "/dashboard/reports",
	},
	{
		divider: true,
		label: "SISTEM",
	},
	{
		key: "users",
		label: "Pengguna",
		icon: "fa-user-shield",
		href: "/dashboard/users",
	},
	{
		key: "settings",
		label: "Pengaturan",
		icon: "fa-gear",
		href: "/dashboard/settings",
	},
];

function SidebarNav({ collapsed, activeKey }) {
	const [openGroups, setOpenGroups] = useState({
		orders: false,
		finance: false,
	});

	const toggleGroup = (key) => setOpenGroups((v) => ({ ...v, [key]: !v[key] }));

	return (
		<nav className="flex-1 overflow-y-auto py-2 px-2">
			{NAV_ITEMS.map((item, i) => {
				// divider
				if (item.divider) {
					return (
						<div key={i} className="mt-4 mb-1 px-2">
							{!collapsed && (
								<span
									className="text-[10px] font-semibold tracking-widest uppercase"
									style={{ color: "var(--color-text-muted)" }}
								>
									{item.label}
								</span>
							)}
							{collapsed && (
								<div
									className="h-px mx-1"
									style={{ background: "var(--color-border)" }}
								/>
							)}
						</div>
					);
				}

				const isActive = activeKey === item.key;
				const hasChildren = item.children?.length > 0;
				const isOpen = openGroups[item.key];

				const itemClass = [
					"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 no-underline group relative",
					collapsed ? "justify-center" : "",
					isActive ? "text-white" : "hover:bg-[var(--color-bg-subtle)]",
				]
					.filter(Boolean)
					.join(" ");

				const iconClass = [
					"flex items-center justify-center w-[18px] text-[15px] flex-shrink-0 transition-colors",
					isActive
						? "text-white"
						: "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]",
				].join(" ");

				const navItem = (
					<div key={item.key}>
						<a
							href={hasChildren ? undefined : item.href}
							className={itemClass}
							style={isActive ? { background: "var(--color-primary)" } : {}}
							onClick={hasChildren ? () => toggleGroup(item.key) : undefined}
						>
							<span className={iconClass}>
								<i className={`fa-solid ${item.icon}`} />
							</span>

							{!collapsed && (
								<>
									<span
										className="flex-1 truncate"
										style={{
											color: isActive ? "#fff" : "var(--color-text-primary)",
										}}
									>
										{item.label}
									</span>
									{item.badge && (
										<Badge
											variant={
												isActive
													? "secondary"
													: (item.badgeVariant ?? "primary")
											}
											size="sm"
											pill
										>
											{item.badge}
										</Badge>
									)}
									{hasChildren && (
										<i
											className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200`}
											style={{
												color: isActive
													? "rgba(255,255,255,.7)"
													: "var(--color-text-muted)",
												transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
											}}
										/>
									)}
								</>
							)}

							{/* collapsed badge dot */}
							{collapsed && item.badge && (
								<span
									className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full flex-shrink-0"
									style={{
										background:
											item.badgeVariant === "danger"
												? "var(--color-danger)"
												: "var(--color-primary)",
									}}
								/>
							)}
						</a>

						{/* sub items */}
						{hasChildren && isOpen && !collapsed && (
							<div
								className="ml-[30px] mt-1 mb-1 flex flex-col gap-0.5 border-l pl-3"
								style={{ borderColor: "var(--color-border)" }}
							>
								{item.children.map((child) => (
									<a
										key={child.key}
										href={child.href}
										className="flex items-center gap-2 px-2 py-2 rounded-md text-[13px] transition-colors no-underline"
										style={{ color: "var(--color-text-secondary)" }}
										onMouseEnter={(e) =>
											(e.currentTarget.style.color =
												"var(--color-text-primary)")
										}
										onMouseLeave={(e) =>
											(e.currentTarget.style.color =
												"var(--color-text-secondary)")
										}
									>
										<i
											className="fa-solid fa-circle text-[5px] flex-shrink-0"
											style={{ color: "var(--color-text-muted)" }}
										/>
										{child.label}
									</a>
								))}
							</div>
						)}
					</div>
				);

				// wrap with tooltip when collapsed
				if (collapsed) {
					return (
						<Tooltip key={item.key} content={item.label} placement="right">
							{navItem}
						</Tooltip>
					);
				}

				return navItem;
			})}
		</nav>
	);
}

export default function DashboardLayout({
	children,
	activeKey = "dashboard",
	onLogout,
}) {
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	const handleLogout = async () => {
		await fetch("/api/auth/logout", { method: "POST" });
		window.location.href = "/login";
	};

	const sidebarWidth = collapsed ? 64 : 240;

	return (
		<div
			className="flex h-screen overflow-hidden"
			style={{ background: "var(--color-bg-tertiary)" }}
		>
			{/* ── SIDEBAR ── */}
			{/* mobile backdrop */}
			{mobileOpen && (
				<div
					className="fixed inset-0 z-40 md:hidden"
					style={{ background: "rgba(0,0,0,.45)" }}
					onClick={() => setMobileOpen(false)}
				/>
			)}

			<aside
				className="flex flex-col h-full z-50 transition-all duration-200 flex-shrink-0"
				style={{
					width: sidebarWidth,
					background: "var(--color-bg-primary)",
					borderRight: "1px solid var(--color-border)",
				}}
			>
				{/* brand */}
				<div
					className="flex items-center gap-3 px-3 flex-shrink-0 h-14"
					style={{ borderBottom: "1px solid var(--color-border)" }}
				>
					<div
						className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
						style={{ background: "var(--color-primary)" }}
					>
						<i className="fa-solid fa-store" />
					</div>
					{!collapsed && (
						<div className="flex-1 min-w-0">
							<div
								className="text-[15px] font-bold truncate"
								style={{ color: "var(--color-text-primary)" }}
							>
								TokoKu
							</div>
							<div
								className="text-[11px]"
								style={{ color: "var(--color-text-muted)" }}
							>
								Retail Management
							</div>
						</div>
					)}
					<button
						type="button"
						className="flex items-center justify-center w-7 h-7 rounded-md transition-colors flex-shrink-0"
						style={{
							color: "var(--color-text-muted)",
							background: "transparent",
							border: "none",
							cursor: "pointer",
						}}
						onClick={() => setCollapsed((v) => !v)}
						onMouseEnter={(e) =>
							(e.currentTarget.style.background = "var(--color-bg-subtle)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.background = "transparent")
						}
					>
						<i
							className={`fa-solid fa-${collapsed ? "chevron-right" : "chevron-left"} text-xs`}
						/>
					</button>
				</div>

				{/* nav */}
				<SidebarNav collapsed={collapsed} activeKey={activeKey} />

				{/* user profile */}
				<div
					className="flex-shrink-0 p-3"
					style={{ borderTop: "1px solid var(--color-border)" }}
				>
					{collapsed ? (
						<Tooltip content="Budi Santoso — Owner" placement="right">
							<div className="flex justify-center cursor-pointer">
								<Avatar
									name="Budi Santoso"
									size="sm"
									color="primary"
									status="online"
								/>
							</div>
						</Tooltip>
					) : (
						<Dropdown
							trigger={
								<div
									className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-colors"
									style={{ background: "var(--color-bg-subtle)" }}
									onMouseEnter={(e) =>
										(e.currentTarget.style.background = "var(--color-bg-muted)")
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.background =
											"var(--color-bg-subtle)")
									}
								>
									<Avatar
										name="Budi Santoso"
										size="sm"
										color="primary"
										status="online"
									/>
									<div className="flex-1 min-w-0">
										<div
											className="text-[13px] font-medium truncate"
											style={{ color: "var(--color-text-primary)" }}
										>
											Budi Santoso
										</div>
										<div
											className="text-[11px]"
											style={{ color: "var(--color-text-muted)" }}
										>
											Owner
										</div>
									</div>
									<i
										className="fa-solid fa-ellipsis-vertical text-xs flex-shrink-0"
										style={{ color: "var(--color-text-muted)" }}
									/>
								</div>
							}
							align="right"
							placement="top"
							items={[
								{
									label: "Profil Saya",
									icon: <i className="fa-solid fa-user" />,
									onClick: () => {},
								},
								{
									label: "Pengaturan",
									icon: <i className="fa-solid fa-gear" />,
									onClick: () => {},
								},
								{ divider: true },
								{
									label: "Keluar",
									icon: <i className="fa-solid fa-right-from-bracket" />,
									onClick: handleLogout,
									danger: true,
								},
							]}
						/>
					)}
				</div>
			</aside>

			{/* ── MAIN AREA ── */}
			<div className="flex flex-col flex-1 min-w-0 overflow-hidden">
				{/* topbar */}
				<header
					className="flex items-center gap-4 px-5 flex-shrink-0 h-14 sticky top-0 z-30"
					style={{
						background: "var(--color-bg-primary)",
						borderBottom: "1px solid var(--color-border)",
					}}
				>
					{/* mobile menu toggle */}
					<button
						type="button"
						className="flex md:hidden items-center justify-center w-8 h-8 rounded-lg"
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							color: "var(--color-text-secondary)",
						}}
						onClick={() => setMobileOpen((v) => !v)}
					>
						<i className="fa-solid fa-bars" />
					</button>

					{/* page title slot — filled by children via context or prop */}
					<div className="flex-1 flex items-center gap-2 min-w-0">
						<div
							className="text-[15px] font-semibold truncate"
							style={{ color: "var(--color-text-primary)" }}
						>
							Dashboard
						</div>
						<Badge variant="success" size="sm" dot>
							Online
						</Badge>
					</div>

					{/* right slot */}
					<div className="flex items-center gap-2">
						{/* search */}
						<button
							type="button"
							className="hidden sm:flex items-center gap-2 px-3 h-8 rounded-lg text-sm transition-colors"
							style={{
								background: "var(--color-bg-subtle)",
								border: "1px solid var(--color-border)",
								color: "var(--color-text-muted)",
								cursor: "pointer",
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.borderColor =
									"var(--color-border-hover)")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.borderColor = "var(--color-border)")
							}
						>
							<i className="fa-solid fa-magnifying-glass text-xs" />
							<span className="text-[13px]">Cari...</span>
							<span
								className="ml-2 flex items-center gap-0.5 text-[10px]"
								style={{ color: "var(--color-text-muted)" }}
							>
								<kbd
									style={{
										background: "var(--color-bg-muted)",
										border: "1px solid var(--color-border)",
										borderRadius: 4,
										padding: "1px 5px",
										fontSize: 10,
										fontFamily: "inherit",
									}}
								>
									⌘K
								</kbd>
							</span>
						</button>

						{/* notif */}
						<Tooltip content="Notifikasi" placement="bottom">
							<div className="relative">
								<button
									type="button"
									className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
									style={{
										background: "none",
										border: "none",
										cursor: "pointer",
										color: "var(--color-text-secondary)",
									}}
									onMouseEnter={(e) =>
										(e.currentTarget.style.background =
											"var(--color-bg-subtle)")
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.background = "none")
									}
								>
									<i className="fa-solid fa-bell text-sm" />
								</button>
								<span
									className="absolute top-1 right-1 w-2 h-2 rounded-full border-2"
									style={{
										background: "var(--color-danger)",
										borderColor: "var(--color-bg-primary)",
									}}
								/>
							</div>
						</Tooltip>

						{/* dark mode */}
						<Tooltip content="Ganti tema" placement="bottom">
							<button
								type="button"
								className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
								style={{
									background: "none",
									border: "none",
									cursor: "pointer",
									color: "var(--color-text-secondary)",
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.background = "var(--color-bg-subtle)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background = "none")
								}
							>
								<i className="fa-solid fa-moon text-sm" />
							</button>
						</Tooltip>

						{/* divider */}
						<div
							className="w-px h-5 mx-1"
							style={{ background: "var(--color-border)" }}
						/>

						{/* avatar */}
						<Dropdown
							trigger={
								<div className="flex items-center gap-2 cursor-pointer select-none">
									<Avatar name="Budi Santoso" size="sm" color="primary" />
									<div className="hidden sm:block">
										<div
											className="text-[13px] font-medium leading-none mb-0.5"
											style={{ color: "var(--color-text-primary)" }}
										>
											Budi S.
										</div>
										<div
											className="text-[11px]"
											style={{ color: "var(--color-text-muted)" }}
										>
											Owner
										</div>
									</div>
									<i
										className="fa-solid fa-chevron-down text-[10px]"
										style={{ color: "var(--color-text-muted)" }}
									/>
								</div>
							}
							align="right"
							items={[
								{
									label: "Profil Saya",
									icon: <i className="fa-solid fa-user" />,
									onClick: () => {},
								},
								{
									label: "Pengaturan",
									icon: <i className="fa-solid fa-gear" />,
									onClick: () => {},
								},
								{
									label: "Bantuan",
									icon: <i className="fa-solid fa-circle-question" />,
									onClick: () => {},
								},
								{ divider: true },
								{
									label: "Keluar",
									icon: <i className="fa-solid fa-right-from-bracket" />,
									onClick: handleLogout,
									danger: true,
								},
							]}
						/>
					</div>
				</header>

				{/* page content */}
				<main className="flex-1 overflow-y-auto p-6">{children}</main>
			</div>
		</div>
	);
}
