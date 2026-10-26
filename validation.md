---
title: Validation & limits
nav: validation
permalink: /validation.html
---

# Validation & limits

Published 26 October 2026. This is a historical engineering record, not live status.

## Physical replies: 23 October 2026

After a signal-ground connection was added, the gateway received five empty poll
replies at 9600 8O1, address 1: two direct replays of original-JAR poll bytes,
followed by three polls through the Python bus. Total TX 40 bytes, RX 40 bytes.
All five additive checksums passed. None contained application records.

| Reply | Sender        | Request flag | Reply bytes               |
| ----- | ------------- | ------------ | ------------------------- |
| 1     | Direct replay | 08           | `02 00 28 00 01 00 29 03` |
| 2     | Direct replay | 48           | `02 00 68 00 01 00 69 03` |
| 3     | Python driver | 08           | `02 00 28 00 01 00 29 03` |
| 4     | Python driver | 48           | `02 00 68 00 01 00 69 03` |
| 5     | Python driver | 08           | `02 00 28 00 01 00 29 03` |

The first four are featured in [Captured replies](captures.md). There are
**two distinct received byte patterns, five actual replies**. Transmitted polls
are not counted as replies. No alarm, reset, silence, or power-fault event was
observed in this successful capture. The signal-ground change preceded success;
this single session does not establish a lasting resolution.

[Machine-readable capture](evidence/poll-replies.json) contains selected
protocol fields and timestamps from the original local records. Personal paths,
credentials, network identifiers and unrelated process metadata were excluded.
Direct-replay timing is relative to that session's start; Python timestamps are
UTC log timestamps. Latencies measure software enqueue/log timing, not an
instrumented wire measurement.

## Latest completed test: 26 October 2026

12:56:19–12:58:19 UTC, after a gateway reboot: **17 polls, 17 timeouts, TX 136
bytes, RX 0 bytes, zero decoded frames** at the same serial format and address.
The kernel UART counters agreed with the application counters. The UART was
released after the test. A preceding run interrupted by a reboot is excluded.

[Latest test summary](evidence/latest-test.json). The gateway network being
online did not establish panel communication. No current alarm state can be
concluded from this test.

## Code and reference evidence

- Package version 0.2.0. Published Python source is byte-for-byte unchanged from
  the tested implementation. [SHA-256 manifest](evidence/source-hashes.json).
- 62 automated tests cover protocol parsing, model transitions, lifecycle,
  concurrent transactions, timeouts, reconnects, echo rejection and POSIX serial
  behavior with pseudo-terminals. They do not constitute hardware validation.
- Original artifact SHA-256:
  `febbd05a3e298665e4ebfd6f700b35e3798290086bef19b68ab59b07a17e9e0d`.
- 1,536 combinations (256 addresses × 2 Q flags × 3 commands) matched the original
  factory, plus two audited fresh-start poll constructions. Original serialization
  wrote these bytes directly. Dependency-only shims supplied missing Niagara types;
  the original Velox packet-building classes were executed unchanged.
- The repository oracle reproduces the 1,536 factory comparisons when a reference
  JAR is supplied. The extended local serialization audit is summarized here; its
  proprietary binary and decompiled listing are not redistributed.
- JACE log photos show application subframes, including a reset indication followed
  by active battery-missing. They do not provide a complete received wire envelope.
  Test envelopes around those transcriptions are explicitly synthetic.

## Open validation items

Sustained RS232 operation after restart; actual alarm/fault activation and restoration;
silence/reset command responses and physical effects; panel clock/epoch behavior;
full Niagara runtime equivalence; unknown record meanings; delayed reply correlation;
initial status acquisition and recovery of events missed offline.

## Evidence levels

| Evidence                            | Supports                                        | Does not establish                                    |
| ----------------------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| Physical poll replies               | A real non-echo exchange at the tested settings | Alarm-free state, event delivery, restart reliability |
| Original-JAR audit                  | Request-byte fidelity in the tested domain      | Niagara runtime equivalence or control effects        |
| JACE application-log transcriptions | Mapped records and record ordering              | Full wire envelopes, checksums or current status      |
| Offline and pseudo-terminal tests   | Implemented parsing and lifecycle behavior      | Compatibility with every panel/firmware               |

## Deliberate corrections and remaining ambiguities

The Python reconstruction corrects big-endian address parsing, exact loop-and-device
matching, unsigned device numbers, and mixed-record parsing. It adds length checks,
bounded framing and explicit echo rejection. It intentionally differs from known
reference defects.

Polls match by address after excluding known transmitted echoes; they do not enforce
the observed response flags or matching Q. A delayed same-address reply can be
ambiguous. Command numbers remain zero by default; command correlation is inferred
from the reference decoder and remains unverified against a live control exchange.

A single point status cannot represent simultaneous alarm and fault conditions.
Inactive supported events can clear another status; reset indications clear state
regardless of their outcome. No initial snapshot, freshness expiry, durable storage
or missed-event catch-up exists. This is not a validated life-safety monitoring
system.

[Full private fidelity matrix](https://github.com/NETIX-AI-OSS/velox-driver/blob/main/docs/fidelity.md)
· [State-machine reference](https://github.com/NETIX-AI-OSS/velox-driver/blob/main/docs/state-machines.md)
