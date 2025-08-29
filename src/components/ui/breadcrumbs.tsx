import { Link, useLocation, matchPath, useSearchParams } from "react-router-dom";

const BREADCRUMB_MAP: Record<string, string> = {
  "/": "Home",
  "/products": "Products",
  "/product/:id": "Product",
  "/dashboard": "Dashboard",
  "/cart": "Cart",
};

// Dashboard section labels
const DASHBOARD_SECTION_LABELS: Record<string, string> = {
  'overview': 'Overview',
  'products': 'Products',
  'add-product': 'Add Product',
  'categories': 'Categories',
  'banners': 'Banners',
  'orders': 'Orders',
  'customers': 'Customers',
  'reviews': 'Reviews',
  'blog': 'Blog',
  'comments': 'Comments',
  'contacts': 'Contacts',
  'newsletter': 'Newsletter',
  'campaigns': 'Campaigns',
  'security': 'Security',
  'rate-limits': 'Rate Limits',
  'bulk-import': 'Bulk Import',
  'settings': 'Settings',
  'upload-diagnostics': 'Upload Diagnostics',
};

function getBreadcrumbs(pathname: string, searchParams?: URLSearchParams) {
  const crumbs: { path: string; label: string }[] = [];
  let path = "";
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [{ path: "/", label: "Home" }];
  segments.forEach((seg, idx) => {
    path += "/" + seg;
    // Try to match dynamic routes
    let label = BREADCRUMB_MAP[path];
    if (!label && path.match(/^\/product\//)) label = "Product";
    if (!label && path.match(/^\/dashboard/)) label = "Dashboard";
    if (!label && path.match(/^\/cart/)) label = "Cart";
    if (!label) label = seg.charAt(0).toUpperCase() + seg.slice(1);
    
    // Add search parameters to dashboard path
    if (path === "/dashboard" && searchParams?.get('section')) {
      const section = searchParams.get('section');
      const sectionLabel = DASHBOARD_SECTION_LABELS[section || ''] || section;
      crumbs.push({ path, label });
      crumbs.push({ 
        path: `${path}?section=${section}`, 
        label: sectionLabel 
      });
      return;
    }
    
    crumbs.push({ path, label });
  });
  return [{ path: "/", label: "Home" }, ...crumbs];
}

export function Breadcrumbs() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Don't show breadcrumbs on the home page
  if (location.pathname === "/") {
    return null;
  }
  
  const breadcrumbs = getBreadcrumbs(location.pathname, searchParams);
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6">
      <nav className="text-sm text-gray-500 py-2" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1">
          {breadcrumbs.map((crumb, idx) => (
            <li key={crumb.path} className="flex items-center">
              {idx > 0 && <span className="mx-1">/</span>}
              {idx < breadcrumbs.length - 1 ? (
                <Link to={crumb.path} className="hover:underline text-gray-600 hover:text-gray-900">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
