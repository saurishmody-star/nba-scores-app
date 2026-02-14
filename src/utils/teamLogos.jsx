/**
 * Get team logo URL from ESPN CDN
 * @param {string} teamTricode - Team abbreviation (e.g., "LAL", "GSW")
 * @returns {string} - URL to team logo or null for special teams
 */
export const getTeamLogoUrl = (teamTricode) => {
  if (!teamTricode) return null;

  // All-Star and special game teams don't have logos in ESPN CDN
  const specialTeams = ['WLD', 'STR', 'USA', 'WORLD', 'EAST', 'WEST'];
  if (specialTeams.includes(teamTricode.toUpperCase())) {
    return null; // Will use fallback styling
  }

  // ESPN CDN team logos - uses tricodes and is more reliable
  return `https://a.espncdn.com/i/teamlogos/nba/500/${teamTricode.toLowerCase()}.png`;
};

/**
 * Team logo component with fallback
 */
export const TeamLogo = ({ tricode, size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const logoUrl = getTeamLogoUrl(tricode);

  if (!logoUrl) {
    return (
      <div className={`${sizes[size]} ${className} bg-gray-200 rounded-full flex items-center justify-center`}>
        <span className="text-xs font-bold text-gray-500">{tricode}</span>
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${tricode} logo`}
      className={`${sizes[size]} ${className} object-contain`}
      onError={(e) => {
        // Fallback to tricode text if image fails to load
        e.target.style.display = 'none';
        e.target.parentElement.innerHTML = `
          <div class="${sizes[size]} ${className} bg-gray-200 rounded-full flex items-center justify-center">
            <span class="text-xs font-bold text-gray-500">${tricode}</span>
          </div>
        `;
      }}
    />
  );
};
