---
title: Setup & usage
nav: setup
permalink: /setup.html
---

# Setup & usage

Run the private Python package with the explicit odd-parity profile used in the captured session.

Requires **Python 3.11+**, a POSIX system (Linux or macOS), and authorized access to
the private repository. The transport uses nonblocking file descriptors and pyserial.

## Install

```sh
git clone git@github.com:NETIX-AI-OSS/velox-driver.git
cd velox-driver
uv sync --locked --group dev
```

## Configure the serial port

`velox.9600-odd.toml` contains:

```toml
port = "/dev/ttyAMA0"
baudrate = 9600
parity = "O"
bytesize = 8
stopbits = 1
panels = [1]
timeout = 5.0
poll_interval = 5.0
command_gap = 0.05
validate_checksum = false
correlate_commands = true
reconnect = true
reconnect_max_backoff = 8.0
```

Set the port to the gateway's actual RS232 UART and keep one process owner.
The library and legacy example default to parity **N**; the captured format is
**O**. A supplied TOML file overrides all serial and address CLI flags.

`poll_interval` is the delay after a complete sequential panel scan, not a strict
period between request starts. Timeouts add to a scan's duration. Poll timeouts
mark the affected panel offline; receive failures additionally trigger reconnect.

## Poll or listen

```sh
# One poll per configured panel
uv run velox --config velox.9600-odd.toml -v poll

# Continuous sequential polls and decoded JSON responses
uv run velox --config velox.9600-odd.toml -v run

# Passive reception; no transmissions
uv run velox --config velox.9600-odd.toml -v monitor
```

The passive monitor does not use the bus reconnect supervisor. This package does
not install a daemon or connect to MQTT/cloud telemetry.

## Configure point state in Python

```python
from velox.bus import VeloxBus
from velox.config import VeloxConfig

bus = VeloxBus(VeloxConfig.from_file("velox.9600-odd.toml"))
bus.panels[1].points[(1, 7)] = "normal"  # loop 1, device 7; local initial value

# In an async application:
# await bus.start()
# response = await bus.responses.get()
# ... consume responses and observe bus.panels ...
# await bus.stop()  # put this in your application's cleanup/finally block
```

The initial `normal` string is not measured status. Point keys are configured
through Python, not TOML or automatic discovery. Raw decoded events remain
observable without point configuration. Panel faults use independent flags.

See [Panel lifecycle](lifecycle.md) for stale values, single-status limitations,
reset behavior, and the distinction between communication and alarm state.

## Explicit controls

The API and CLI expose `silence` and `reset`. They send a single command and wait
for a correlated command reply. Outcome 2 is accepted. There are no automatic
command retries and no separate acknowledge command. Silence does not clear the
local alarm state or track the physical sounder state.

Packet construction matches the original artifact in the audited domain. Live
command acceptance and physical effects have not been validated. No live control
operations were performed for this publication.

## Offline verification

```sh
uv run pytest -q
uv run python tools/verify_publication.py
uv build
```

The suite has **62 tests** covering protocol behavior, lifecycle and pseudo-terminal
I/O. It does not open a physical panel port. To reproduce the Java factory audit,
supply JDK 17 and the reference artifact separately:

```sh
uv run python tools/check_java_parity.py /path/to/velox-rt.jar
```

The original JAR and Niagara runtime are not distributed. The oracle checks 1,536
request vectors. See the [validation record](validation.md) for its scope.
