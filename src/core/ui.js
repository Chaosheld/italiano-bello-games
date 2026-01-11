export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else node.setAttribute(k, v);
  });
  children.flat().forEach((c) => {
    if (c == null) return;
    node.append(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return node;
}

export function clear(node) {
  node.innerHTML = "";
}
