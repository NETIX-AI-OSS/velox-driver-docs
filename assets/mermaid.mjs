// Render fenced Mermaid in Markdown. Preserve source if the renderer is unavailable.
const blocks = [
  ...document.querySelectorAll("code.language-mermaid, .language-mermaid code"),
];
if (blocks.length) {
  try {
    const { default: mermaid } = await import(
      "https://cdn.jsdelivr.net/npm/mermaid@12.2.0/dist/mermaid.esm.min.mjs"
    );
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      themeVariables: {
        primaryColor: "#e4eee7",
        primaryTextColor: "#213c3a",
        primaryBorderColor: "#71998b",
        lineColor: "#54786c",
        secondaryColor: "#f4e6d7",
        tertiaryColor: "#edf1f5",
        background: "#ffffff",
      },
    });
    for (const [index, block] of blocks.entries()) {
      const source = block.textContent;
      const wrapper =
        block.closest("div.highlighter-rouge") || block.closest("pre");
      try {
        const { svg } = await mermaid.render(`diagram-${index}`, source);
        const figure = document.createElement("div");
        figure.className = "mermaid";
        figure.innerHTML = svg;
        const details = document.createElement("details");
        details.className = "diagram-source";
        const summary = document.createElement("summary");
        summary.textContent = "View Mermaid source";
        wrapper.replaceWith(figure, details);
        details.append(summary, wrapper);
      } catch (error) {
        const notice = document.createElement("p");
        notice.className = "diagram-error";
        notice.textContent =
          "Diagram could not render; its Markdown source is shown below.";
        wrapper.before(notice);
        console.error("Mermaid diagram failed", error);
      }
    }
  } catch (error) {
    console.error("Mermaid unavailable; source remains visible", error);
  }
}
