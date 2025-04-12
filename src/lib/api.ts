import { Project } from "./types.js";

const TAKOS_BASE_URL = "https://context7.com";

/**
 * Fetches projects from the Takos API
 * @returns Array of projects or null if the request fails
 */
export async function fetchProjects(): Promise<Project[] | null> {
  try {
    const response = await fetch(`${TAKOS_BASE_URL}/api/projects`);
    if (!response.ok) {
      console.error(`Failed to fetch projects: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching projects:", error);
    return null;
  }
}

/**
 * Fetches documentation context for a specific library
 * @param libraryName The library name to fetch documentation for
 * @param tokens Number of tokens to retrieve (default: 5000)
 * @param topic Optional topic to rerank context for
 * @returns The documentation text or null if the request fails
 */
export async function fetchLibraryDocumentation(
  libraryName: string,
  tokens: number = 5000,
  topic: string = ""
): Promise<string | null> {
  try {
    // if libraryName has a "/" as the first character, remove it
    if (libraryName.startsWith("/")) {
      libraryName = libraryName.slice(1);
    }

    // Handle folders parameter
    let basePath = libraryName;
    let folders = "";
    if (libraryName.includes("?folders=")) {
      const [path, foldersParam] = libraryName.split("?folders=");
      basePath = path;
      folders = foldersParam;
    }
    let contextURL = `${TAKOS_BASE_URL}/${basePath}/llms.txt`;
    const params = [];
    if (folders) {
      params.push(`folders=${encodeURIComponent(folders)}`);
    }
    if (tokens) {
      params.push(`tokens=${tokens}`);
    }
    if (topic) {
      params.push(`topic=${encodeURIComponent(topic)}`);
    }
    if (params.length > 0) {
      contextURL += `?${params.join("&")}`;
    }

    const response = await fetch(contextURL);
    if (!response.ok) {
      console.error(`Failed to fetch documentation: ${response.status}`);
      return null;
    }
    const text = await response.text();
    if (!text || text === "No content available" || text === "No context data available") {
      return null;
    }
    return text;
  } catch (error) {
    console.error("Error fetching library documentation:", error);
    return null;
  }
}
