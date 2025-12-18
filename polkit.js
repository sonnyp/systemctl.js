/* globals polkit */

// ⚠️ unsafe; this is just an example!

// https://www.freedesktop.org/software/polkit/docs/latest/polkit.8.html#polkit-rules
// https://www.freedesktop.org/software/systemd/man/latest/org.freedesktop.systemd1.html#Security

const allowed_actions = [
  "org.freedesktop.systemd1.manage-units",
  "org.freedesktop.systemd1.manage-unit-files",
];

polkit.addRule(function (action /*, subject*/) {
  if (allowed_actions.indexOf(action.id) > -1) {
    return polkit.Result.YES;
  }

  return polkit.Result.NO;
});
