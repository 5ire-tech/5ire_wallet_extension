export const CONTENT_SCRIPT = "fire-contentscript";
export const INPAGE = "fire-inpage";
export const BACKGROUND = "fire-background";

let counter = 0;

export function getId() {
  return `5IRE.${Date.now()}.${++counter}`;
}
