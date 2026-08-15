const API_URL = import.meta.env.VITE_BACKEND_URL;

export interface SiteSettings {
  siteName: string;
  siteNameSecondPart: string;
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  ctaTagline: string;
  siteDescription: string;
  featuredRoomsTitle: string;
  featuredRoomsDescription: string;
  roomsPageTitle: string;
  roomsPageSubtitle: string;
  roomsSectionTitle: string;
  roomsSectionDescription: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
}

const defaultSettings: SiteSettings = {
  siteName: 'Asili',
  siteNameSecondPart: 'Village',
  heroTitle: "Escape to Nature's",
  heroSubtitle: 'Luxury Embrace',
  heroTagline: 'Where warm wood meets wild nature. Experience boutique luxury at Asili Village.',
  ctaTagline: 'Discover the harmony of nature and luxury at Asili Village.',
  siteDescription:
    'A luxury boutique resort nestled in nature, offering an unforgettable escape with warm hospitality and premium amenities.',
  featuredRoomsTitle: 'Our Signature Villas',
  featuredRoomsDescription:
    'Each villa is designed to provide an unforgettable experience, blending natural elements with modern luxury.',
  roomsPageTitle: 'Our Luxury Villas',
  roomsPageSubtitle:
    'Choose from our collection of thoughtfully designed villas, each offering a unique blend of comfort and natural beauty.',
  roomsSectionTitle: 'Our Signature Villas',
  roomsSectionDescription:
    'Each villa is designed to provide an unforgettable experience, blending natural elements with modern luxury.',
  contactAddress: '123 Nature Road, Thailand',
  contactPhone: '+66 123 456 789',
  contactEmail: 'hello@asilivillage.com',
};

interface SettingRow {
  key: string;
  value: string;
  type?: string;
}

/**
 * Shared in-flight promise.
 *
 * Header, Footer and the page component all ask for settings on mount. Without
 * this they would each issue their own request; with it they share one.
 * Previously getAll() also fanned out to 16 per-key endpoints — this uses the
 * single GET /api/settings collection endpoint instead.
 */
let settingsCache: Promise<Record<string, string>> | null = null;

const fetchSettingsMap = (): Promise<Record<string, string>> => {
  if (!settingsCache) {
    settingsCache = fetch(`${API_URL}/api/settings`)
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: SettingRow[]) =>
        Array.isArray(rows)
          ? rows.reduce<Record<string, string>>((acc, row) => {
              if (row?.key) acc[row.key] = row.value;
              return acc;
            }, {})
          : {}
      )
      .catch((error) => {
        console.error('Error fetching settings:', error);
        // Reset so a later mount can retry rather than caching the failure
        settingsCache = null;
        return {};
      });
  }
  return settingsCache;
};

/** Non-empty value or the fallback (a blank row shouldn't blank the UI). */
const pick = (map: Record<string, string>, key: string, fallback: string) => {
  const value = map[key];
  return value !== undefined && value !== null && value !== '' ? value : fallback;
};

export const settingsAPI = {
  async getAll(): Promise<SiteSettings> {
    const map = await fetchSettingsMap();

    return {
      siteName: pick(map, 'site_name', defaultSettings.siteName),
      siteNameSecondPart: pick(map, 'site_name_second_part', defaultSettings.siteNameSecondPart),
      heroTitle: pick(map, 'hero_title', defaultSettings.heroTitle),
      heroSubtitle: pick(map, 'hero_subtitle', defaultSettings.heroSubtitle),
      heroTagline: pick(map, 'hero_tagline', defaultSettings.heroTagline),
      ctaTagline: pick(map, 'cta_tagline', defaultSettings.ctaTagline),
      siteDescription: pick(map, 'site_description', defaultSettings.siteDescription),
      featuredRoomsTitle: pick(map, 'featured_rooms_title', defaultSettings.featuredRoomsTitle),
      featuredRoomsDescription: pick(
        map,
        'featured_rooms_description',
        defaultSettings.featuredRoomsDescription
      ),
      roomsPageTitle: pick(map, 'rooms_page_title', defaultSettings.roomsPageTitle),
      roomsPageSubtitle: pick(map, 'rooms_page_subtitle', defaultSettings.roomsPageSubtitle),
      roomsSectionTitle: pick(map, 'rooms_section_title', defaultSettings.roomsSectionTitle),
      roomsSectionDescription: pick(
        map,
        'rooms_section_description',
        defaultSettings.roomsSectionDescription
      ),
      contactAddress: pick(map, 'contact_address', defaultSettings.contactAddress),
      contactPhone: pick(map, 'contact_phone', defaultSettings.contactPhone),
      contactEmail: pick(map, 'contact_email', defaultSettings.contactEmail),
    };
  },

  /**
   * Read an arbitrary key (e.g. uploaded image paths) from the same payload,
   * so image lookups no longer need their own request that 404s when unset.
   * Returns an absolute URL for image paths, or null when not configured.
   */
  async getImageUrl(key: string): Promise<string | null> {
    const map = await fetchSettingsMap();
    const value = map[key];
    if (!value) return null;
    return value.startsWith('http') ? value : `${API_URL}${value}`;
  },

  /** Drop the cache so the next read refetches (after an admin edit). */
  refresh() {
    settingsCache = null;
  },
};
