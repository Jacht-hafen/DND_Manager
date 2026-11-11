import '@fluentui/web-components/button.js';
import '@fluentui/web-components/badge.js';
import '@fluentui/web-components/message-bar.js';
import '@fluentui/web-components/spinner.js';
import { setTheme } from '@fluentui/web-components/theme/set-theme.js';
import { webLightTheme } from '@fluentui/tokens';

// Keep Runenwerk's paper and burgundy palette within Fluent's interaction system.
setTheme({
  ...webLightTheme,
  fontFamilyBase: 'Arial, Helvetica, sans-serif',
  colorBrandBackground: '#792825',
  colorBrandBackgroundHover: '#65211f',
  colorBrandBackgroundPressed: '#501a18',
  colorBrandBackgroundSelected: '#65211f',
  colorBrandForeground1: '#792825',
  colorBrandForeground2: '#65211f',
  colorBrandForeground2Hover: '#501a18',
  colorBrandForeground2Pressed: '#401513',
  colorBrandStroke1: '#792825',
  colorBrandStroke2: '#d9b8b3',
  colorBrandBackground2: '#f4e9e6',
  colorNeutralForeground1: '#252524',
  colorNeutralForeground2: '#625f5b',
  colorNeutralBackground1: '#ffffff',
  colorNeutralBackground1Hover: '#f0eee8',
  colorNeutralBackground1Pressed: '#e6e2da',
  colorNeutralBackground1Selected: '#eee8e0',
  colorNeutralStroke1: '#c4beb5',
  colorNeutralStroke2: '#d9d5cf',
  borderRadiusMedium: '6px',
});

const pending = new WeakMap();

// Submit buttons and fields stay native for implicit Enter submission,
// browser validation, FormData, autofill and password-manager support.
export function setFormBusy(form, busy) {
  if (busy) {
    if (pending.has(form)) return;
    const buttons = [...form.querySelectorAll('button[type="submit"], button:not([type])')];
    const states = buttons.map(button => ({ button, disabled: button.disabled }));
    const spinner = document.createElement('fluent-spinner');
    spinner.setAttribute('size', 'tiny');
    spinner.setAttribute('appearance', 'inverted');
    spinner.setAttribute('aria-hidden', 'true');
    buttons[0]?.prepend(spinner);
    states.forEach(({ button }) => { button.disabled = true; });
    form.setAttribute('aria-busy', 'true');
    pending.set(form, { states, spinner });
  } else {
    const state = pending.get(form);
    state?.spinner.remove();
    state?.states.forEach(({ button, disabled }) => { button.disabled = disabled; });
    form.removeAttribute('aria-busy');
    pending.delete(form);
  }
}

export function showNotice(container, text, error = false) {
  const notice = document.createElement('fluent-message-bar');
  notice.setAttribute('intent', error ? 'error' : 'info');
  notice.setAttribute('layout', 'multiline');
  notice.setAttribute('role', error ? 'alert' : 'status');
  notice.textContent = text;
  container.replaceChildren(notice);
}
