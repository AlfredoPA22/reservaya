import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'reservaya_company';
const SLUG_KEY = 'reservaya_slug';
const NAME_KEY = 'reservaya_company_name';

const isObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

export interface CompanyProfile {
  name: string;
  image: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  tagline: string;
}

interface CompanyContextType {
  companyId: string | null;
  slug: string | null;
  profile: CompanyProfile | null;
  refreshProfile: () => void;
}

const CompanyContext = createContext<CompanyContextType>({
  companyId: null,
  slug: null,
  profile: null,
  refreshProfile: () => {},
});

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [slug, setSlug] = useState<string | null>(() => localStorage.getItem(SLUG_KEY));
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  const fetchProfile = useCallback((id: string) => {
    axios.get(`${import.meta.env.VITE_API_URL}/business-profile/public?companyId=${id}`)
      .then(({ data }) => {
        const storedName = localStorage.getItem(NAME_KEY) || '';
        setProfile({
          name: data.name || storedName,
          image: data.image || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          description: data.description || '',
          tagline: data.tagline || '',
        });
      })
      .catch(() => {});
  }, []);

  // When user logs in, sync their companyId
  useEffect(() => {
    if (user?.companyId && !companyId) {
      localStorage.setItem(STORAGE_KEY, user.companyId);
      setCompanyId(user.companyId);
    }
  }, [user?.companyId]);

  // Load business profile whenever companyId is set
  useEffect(() => {
    if (companyId) fetchProfile(companyId);
  }, [companyId]);

  // Resolve ?company= URL param
  useEffect(() => {
    const param = searchParams.get('company');
    if (!param) return;

    if (isObjectId(param)) {
      localStorage.setItem(STORAGE_KEY, param);
      setCompanyId(param);
      axios.get(`${import.meta.env.VITE_LANDING_URL}/company/info/${param}`)
        .then(({ data }) => {
          if (data.slug) { localStorage.setItem(SLUG_KEY, data.slug); setSlug(data.slug); }
          if (data.name) localStorage.setItem(NAME_KEY, data.name);
        })
        .catch(() => {});
    } else {
      axios.get(`${import.meta.env.VITE_LANDING_URL}/company/by-slug/${param}`)
        .then(({ data }) => {
          localStorage.setItem(STORAGE_KEY, data.companyId);
          localStorage.setItem(SLUG_KEY, data.slug);
          localStorage.setItem(NAME_KEY, data.name);
          setCompanyId(data.companyId);
          setSlug(data.slug);
        })
        .catch(() => {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(SLUG_KEY);
          localStorage.removeItem(NAME_KEY);
          setCompanyId(null);
          setSlug(null);
        });
    }
  }, [searchParams]);

  const refreshProfile = useCallback(() => {
    if (companyId) fetchProfile(companyId);
  }, [companyId, fetchProfile]);

  return (
    <CompanyContext.Provider value={{ companyId, slug, profile, refreshProfile }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);
