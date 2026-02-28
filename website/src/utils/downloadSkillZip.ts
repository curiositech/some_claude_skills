/**
 * Downloads a pre-generated skill folder zip file
 * @param skillId The skill ID (e.g., 'skill-coach')
 * @param skillName The display name of the skill
 */
export async function downloadSkillZip(skillId: string, skillName: string): Promise<void> {
  try {
    // Use pre-generated zip from static files
    const zipUrl = `/downloads/skills/${skillId}.zip`;

    // Fetch the pre-generated zip
    const response = await fetch(zipUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch skill zip: ${response.status}`);
    }

    // Get the blob and trigger download
    const blob = await response.blob();

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${skillId}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading skill zip:', error);

    // Show error and direct user to GitHub folder
    const owner = 'curiositech';
    const repo = 'some_claude_skills';
    const branch = 'main';
    const githubFolderUrl = `https://github.com/${owner}/${repo}/tree/${branch}/.claude/skills/${skillId}`;

    const message = `Unable to download skill zip.\n\nPlease visit the GitHub folder to download manually:\n${githubFolderUrl}`;
    alert(message);
    window.open(githubFolderUrl, '_blank');

    throw error; // Re-throw so the button loading state stops
  }
}
