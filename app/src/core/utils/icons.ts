import type { IconNode } from "lucide";
export type { IconNode };

export function renderIcon(iconNode: IconNode, extraClasses = ""): string {
  const childrenString = iconNode
    .map(([cTag, cAttrs]) => {
      const cAttrStr = Object.entries(cAttrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
      return `<${cTag} ${cAttrStr}></${cTag}>`;
    })
    .join("");

  const svgAttrs = {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    class: `lucide-icon ${extraClasses}`.trim(),
  };

  const svgAttrString = Object.entries(svgAttrs)
    .map(([key, val]) => `${key}="${val}"`)
    .join(" ");

  return `<svg ${svgAttrString}>${childrenString}</svg>`;
}
