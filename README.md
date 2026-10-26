# NETIX Velox driver documentation

Published site: <https://netix-ai-oss.github.io/velox-driver-docs/>

This is the public documentation-only mirror of `site/` in the private
`NETIX-AI-OSS/velox-driver` repository. The Python implementation is not in this
public repository. GitHub Pages serves the root of the `main` branch.

The site covers protocol framing, transaction/state behavior, the full integration
lifecycle, setup, reference fidelity and validation limits. Four captured replies
are featured; `evidence/poll-replies.json` preserves all five observed replies
(two unique patterns, no application events). `evidence/latest-test.json` preserves
the later unsuccessful post-reboot result. All records are historical.

Preview with `python3 -m http.server 8765 --bind 127.0.0.1` and open
`http://127.0.0.1:8765`. No build step or external JavaScript dependency is required.
The interactive elements are documentation simulations and cannot contact a panel.

Update the private canonical site first, then mirror only its `site/` contents here.
Keep the distinction between physical captures, application-log transcriptions,
reference-code behavior and synthetic examples explicit.
