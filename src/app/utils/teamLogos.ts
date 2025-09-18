import { CHLTeamInfo } from '../types/chl';

/**
 * Get team logo URL based on team information
 * Uses CHL's Cloudinary CDN for real team logos
 */
export function getTeamLogo(team: CHLTeamInfo | { shortName: string; externalId?: string; country?: { code: string } }): string {
  const externalId = 'externalId' in team ? team.externalId : team.externalId;
  const shortName = 'shortName' in team ? team.shortName : team.shortName;
  
  // Use CHL's Cloudinary CDN for team logos
  if (externalId && externalId !== 'n/a') {
    return `https://res.cloudinary.com/chl-production/image/upload/c_fit,dpr_1.0,f_webp,g_center,h_50,q_auto,w_50/v1/chl-prod/assets/teams/${externalId}`;
  }
  
  // Fallback to generic logo if no externalId
  return getGenericTeamLogo(shortName);
}

/**
 * Get a generic team logo based on team short name and country
 */
function getGenericTeamLogo(shortName: string, countryCode?: string): string {
  // You can customize this to return different generic logos
  // based on country or team characteristics
  
  // For now, return a simple hockey puck icon as placeholder
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#1f2937" stroke="#374151" stroke-width="2"/>
      <circle cx="20" cy="20" r="12" fill="#6b7280"/>
      <text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" font-weight="bold">${shortName}</text>
    </svg>
  `)}`;
}

/**
 * Get team logo with fallback
 */
export function getTeamLogoWithFallback(team: CHLTeamInfo | { shortName: string; country?: { code: string } }): string {
  try {
    return getTeamLogo(team);
  } catch (error) {
    console.warn('Error getting team logo:', error);
    return getGenericTeamLogo('N/A');
  }
}
