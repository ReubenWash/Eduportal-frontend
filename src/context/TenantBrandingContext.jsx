import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getPublicSchoolPortal } from '../api/schoolApi';

const TenantBrandingContext = createContext(null);

function getTenantSlug(hostname, rootDomain) {
  const root = String(rootDomain || '').trim().toLowerCase().replace(/^\.+|\.+$/g, '');
  const host = String(hostname || '').trim().toLowerCase().replace(/\.$/, '');
  if (!root || !host.endsWith(`.${root}`)) return null;

  const slug = host.slice(0, -(root.length + 1));
  if (!slug || slug.includes('.') || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return null;
  }
  return slug;
}

export function TenantBrandingProvider({ children }) {
  const rootDomain = import.meta.env.VITE_TENANT_ROOT_DOMAIN;
  const tenantSlug = useMemo(
    () => getTenantSlug(window.location.hostname, rootDomain),
    [rootDomain],
  );
  const [school, setSchool] = useState(null);
  const [status, setStatus] = useState(tenantSlug ? 'loading' : 'none');

  useEffect(() => {
    if (!tenantSlug) {
      setSchool(null);
      setStatus('none');
      return undefined;
    }

    let active = true;
    setSchool(null);
    setStatus('loading');

    getPublicSchoolPortal(tenantSlug)
      .then((portal) => {
        if (!active) return;
        if (!portal?.slug || portal.slug !== tenantSlug) {
          setStatus('not-found');
          return;
        }
        setSchool(portal);
        setStatus('ready');
      })
      .catch((error) => {
        if (!active) return;
        setStatus(error.response?.status === 404 ? 'not-found' : 'error');
      });

    return () => {
      active = false;
    };
  }, [tenantSlug]);

  useEffect(() => {
    if (status !== 'ready' || !school) return;
    const previousTitle = document.title;
    document.title = school.name;

    let favicon = document.querySelector("link[rel~='icon']");
    const createdFavicon = !favicon;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    const previousFavicon = favicon.href;
    if (school.logoUrl) favicon.href = school.logoUrl;

    return () => {
      document.title = previousTitle;
      if (createdFavicon) {
        favicon.remove();
      } else {
        favicon.href = previousFavicon;
      }
    };
  }, [school, status]);

  const value = useMemo(
    () => ({ school, slug: tenantSlug, status }),
    [school, tenantSlug, status],
  );

  return (
    <TenantBrandingContext.Provider value={value}>
      {children}
    </TenantBrandingContext.Provider>
  );
}

export function useTenantBranding() {
  const context = useContext(TenantBrandingContext);
  if (!context) {
    throw new Error('useTenantBranding must be used within TenantBrandingProvider');
  }
  return context;
}
