import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve('dist/assets/collon.css'), 'utf8');
const html = readFileSync(resolve('dist/index.html'), 'utf8');

function declarations(selector, last = true) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [...css.matchAll(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`, 'g'))];
  assert.ok(matches.length, `Missing CSS rule: ${selector}`);
  return (last ? matches.at(-1) : matches[0])[1];
}
function token(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, 'i'));
  assert.ok(match, `Missing color token: ${name}`);
  return match[1];
}
function luminance(hex) {
  const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('Collon header lockup has a compact wordmark and mark without changing the artwork', () => {
  assert.ok(html.includes('logo(28)'), 'header mark should render at 28px');
  const word = [...css.matchAll(/\.brand-word\s*\{([^}]+)\}/g)].find(match => /width:/.test(match[1]))?.[1];
  assert.ok(word, 'wordmark sizing rule is missing');
  assert.match(word, /width:\s*(?:7\d|8[0-4])px/);
  assert.match(word, /collon-wordmark\.svg/);
  assert.ok(/@media\(max-width:899px\)[\s\S]*?\.brand-word\{width:(?:6\d|7[0-4])px/.test(css), 'mobile wordmark should be compact');
});

test('both themes have one accessible indigo action and readable supporting text', () => {
  const light = declarations(':root');
  const dark = declarations(':root[data-theme="dark"]');
  for (const block of [light, dark]) {
    const page = token(block, '--brand-page');
    const surface = token(block, '--brand-surface');
    const text = token(block, '--brand-text');
    const muted = token(block, '--brand-muted');
    const action = token(block, '--brand-action');
    const actionText = token(block, '--brand-action-text');
    assert.ok(contrast(page, text) >= 4.5);
    assert.ok(contrast(surface, muted) >= 4.5);
    assert.ok(contrast(action, actionText) >= 4.5);
    assert.notEqual(action.toLowerCase(), text.toLowerCase(), 'actions should not be monochrome');
    token(block, '--brand-mint');
    token(block, '--brand-amber');
  }
});

test('the color roles reach navigation, daily, discovery, quiz, modes and competition', () => {
  assert.match(declarations('.docknav .dock-link.on'), /background:var\(--brand-action\)/);
  assert.match(declarations('.hero-daily-cta'), /background:var\(--brand-action\)/);
  assert.match(declarations('.daily-stage'), /--brand-mint/);
  assert.match(declarations('.kxh'), /--brand-feature/);
  assert.match(declarations('.mqlist .mqb'), /--brand-feature/);
  assert.match(declarations('.tkh,.tkb,.tkb.d,.tkb.w,.tkb.l,.tkb.r'), /--brand-feature/);
  assert.match(declarations('.lbtab.on,.lbchip.on'), /--brand-action/);
  assert.match(declarations('.bar i'), /--brand-action/);
});
