import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STORY_PUZZLES } from '../public/story-puzzles.js';
import { applyAction, defaultData, PUZZLES } from '../netlify/functions/engine.mjs';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { STORY_BY_ID } from '../public/story-puzzles.js';

test('library renders all new tasks and live views keep solution controls with the DM', () => {
  const source = readFileSync(new URL('../public/runenwerk-main-20261030.js', import.meta.url), 'utf8')
    .split("if (location.hash.startsWith('#puzzle-'))")[0]
    .replace(/^import .*;\r?\n/gm, '');
  const context = vm.createContext({
    STORY_PUZZLES, STORY_BY_ID, URLSearchParams,
    createClient: () => ({}), location: { search: '' },
    localStorage: { getItem: () => null }, document: { addEventListener() {} }
  });
  vm.runInContext(source, context);
  assert.match(vm.runInContext('home()', context), /18 Rätsel/);
  for (const p of STORY_PUZZLES) {
    context.fixture = { puzzle: p.id, data: defaultData(), you: { role: 'a' }, phase: 'playing' };
    context.puzzleId = p.id;
    const detail = vm.runInContext('selectedLibrary = puzzleId; libraryDetail()', context);
    assert.ok(detail.includes(p.name));
    assert.match(detail, /<details><summary>Tipp anzeigen/);
    assert.match(detail, /<details><summary>Lösung anzeigen/);
    const player = vm.runInContext('room = fixture; puzzle()', context);
    assert.ok(!player.includes('Lösung anzeigen'));
    assert.ok(!player.includes('Tipp anzeigen'));
    const dm = vm.runInContext("room.you.role = 'dm'; puzzle()", context);
    assert.match(dm, /Lösung anzeigen/);
  }
});

test('all ten story puzzles can be selected, awarded and reset by the DM', () => {
  assert.equal(STORY_PUZZLES.length, 10);
  assert.equal(PUZZLES.length, 18);
  for (const p of STORY_PUZZLES) {
    const dm = { id: 'host', role: 'dm' };
    let room = { puzzle: 'runes', phase: 'lobby', data: defaultData() };
    room = applyAction(room, dm, { type: 'select', puzzle: p.id });
    assert.equal(room.puzzle, p.id);
    assert.equal(room.phase, 'playing');
    assert.throws(() => applyAction(room, { role: 'a' }, { type: 'solve' }));
    room = applyAction(room, dm, { type: 'solve' });
    assert.ok(room.data.solved.includes(p.id));
    room = applyAction(room, dm, { type: 'reset' });
    assert.ok(!room.data.solved.includes(p.id));
    assert.ok(p.task && p.solution && p.hint && p.materials && p.campaign);
  }
});

test('alchemist clues allow exactly one arrangement', () => {
  const permutations = a => a.length ? a.flatMap((v, i) => permutations(a.filter((_, j) => i !== j)).map(rest => [v, ...rest])) : [[]];
  const matches = [];
  for (const colors of permutations(['rot', 'blau', 'grün'])) {
    for (const contents of permutations(['Heiltrank', 'Schlaftrank', 'Wasser'])) {
      if (colors[2] === 'grün' && contents[colors.indexOf('rot')] === 'Schlaftrank' && contents.indexOf('Heiltrank') === colors.indexOf('grün') - 1) matches.push({ colors, contents });
    }
  }
  assert.deepEqual(matches, [{ colors: ['rot', 'blau', 'grün'], contents: ['Schlaftrank', 'Heiltrank', 'Wasser'] }]);
});

test('turning seven tiles balances suns for every possible selection', () => {
  for (let suns = 0; suns <= 7; suns++) {
    const selected = [...Array(suns).fill(true), ...Array(7 - suns).fill(false)];
    const remaining = [...Array(7 - suns).fill(true), ...Array(6 + suns).fill(false)];
    assert.equal(selected.length + remaining.length, 20);
    assert.equal(selected.map(v => !v).filter(Boolean).length, remaining.filter(Boolean).length);
  }
});
