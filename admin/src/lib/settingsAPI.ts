const API_URL = import.meta.env.VITE_BACKEND_URL;

export interface SiteSettings {
  siteName: string;
  siteNameSecondPart: string;
}

const defaultSettings: SiteSettings = {
  siteName: 'Asili',
  siteNameSecondPart: 'Village',
};

interface SettingRow {
  key: string;
  value: string;
}

/**
 * Shared in-flight promise over the collection endpoint.
 *
 * This previously hit /api/settings/site_name and
 * /api/settings/site_name_second_part separately, which logged two 404s on
 * every load until those rows existed. One request to /api/settings returns
 * everything and never 404s on a missing key.
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
      .catch(() => {
        settingsCache = null; // allow a retry rather than caching the failure
        return {};
      });
  }
  return settingsCache;
};

const pick = (map: Record<string, string>, key: string, fallback: string) => {
  const value = map[key];
  return value !== undefined && value !== null && value !== '' ? value : fallback;
};

export const settingsAPI = {
  async getSiteNameParts(): Promise<{ firstName: string; secondPart: string }> {
    const map = await fetchSettingsMap();
    return {
      firstName: pick(map, 'site_name', defaultSettings.siteName),
      secondPart: pick(map, 'site_name_second_part', defaultSettings.siteNameSecondPart),
    };
  },

  async getSiteName(): Promise<string> {
    const { firstName, secondPart } = await this.getSiteNameParts();
    return `${firstName} ${secondPart}`;
  },

  /** Drop the cache so the next read refetches (after saving settings). */
  refresh() {
    settingsCache = null;
  },
};
