// Vite's relative base keeps public files inside the current GitHub Pages project.
export function publicUrl(path) {
  return import.meta.env.BASE_URL + path.replace(/^\/+/, '');
}
