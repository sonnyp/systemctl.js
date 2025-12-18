# systemctl.js

[sysetmctl](https://man7.org/linux/man-pages/man1/systemctl.1.html) API for JavaScript. This is implemented using the [systemd D-Bus interface](https://www.freedesktop.org/software/systemd/man/latest/org.freedesktop.systemd1.html) so it's stable, faster and safer than spawning `systemctl` CLI.

## Usage

```sh
npm install systemctl.js
```

```js
import { Systemctl } from "systemctl.js";

const systemctl = new Systemctl()
await systemctl.init()

await systemctl.start('sshd')
await systemctl.stop('sshd')
await systemctl.disable(['sshd'])
await systemctl.enable(['sshd'])
await systemctl.reload()
```

If your app is not running as root (and it should not), you will encounter an authentication error. You can use [polkit](https://github.com/polkit-org/polkit) to allow access to the [necessary systemd permissions](https://www.freedesktop.org/software/systemd/man/latest/org.freedesktop.systemd1.html#Security).

```sh
# ⚠️ unsafe; this is just an example!
cp node_modules/systemctl.js/polkit.js /etc/polkit-1/rules.d/re.sonny.systemctl.rules
```
