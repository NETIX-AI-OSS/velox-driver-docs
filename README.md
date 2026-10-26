# NETIX Velox documentation

**[Read the documentation site](https://netix-ai-oss.github.io/velox-driver-docs/)**
· **[Private driver](https://github.com/NETIX-AI-OSS/velox-driver)**

Plain Markdown with Mermaid architecture, sequence and state diagrams.
Read the same documents directly on GitHub:

| Document                        | Contents                                                                |
| ------------------------------- | ----------------------------------------------------------------------- |
| [Overview](index.md)            | Architecture, settings and scope                                        |
| [Protocol](protocol.md)         | Bytes, framing and transaction state machines                           |
| [Panel lifecycle](lifecycle.md) | Startup, events, fire, silence, reset, faults and recovery              |
| [Captured replies](captures.md) | Four featured replies, complete five-reply capture, JACE transcriptions |
| [Setup](setup.md)               | Configuration, CLI, Python API and checks                               |
| [Validation](validation.md)     | Evidence, fidelity and unresolved limitations                           |

Five physical replies were captured at 9600 8O1/address 1: two distinct byte
patterns and zero application records. Four are featured; all five are retained
in [the JSON evidence](evidence/poll-replies.json). The later unsuccessful reboot
test is preserved too. These are historical observations, not live panel status.

This public repository mirrors `site/` from the private `NETIX-AI-OSS/velox-driver`
repository. It contains documentation only. GitHub Pages builds the `main` branch
root with Jekyll. Mermaid source renders natively on GitHub and through a pinned
Mermaid 12.2.0 renderer on the website. No custom application is required.

## Preview

With Ruby and Bundler installed:

```sh
bundle install
bundle exec jekyll serve --baseurl '' --host 127.0.0.1
```

Keep source changes in the private repository's `site/` first, then mirror only
that directory. Preserve the distinction between physical replies, log
transcriptions, reference behavior and synthetic examples.
