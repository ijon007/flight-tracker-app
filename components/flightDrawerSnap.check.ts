import { DRAWER_HEADER, DRAWER_SQUISH, resist, snapHeight } from './flightDrawerSnap';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const min = DRAWER_HEADER;
const max = 420;

assert(snapHeight(100, min, max, 0) === min, 'near min settles minimized');
assert(snapHeight(400, min, max, 0) === max, 'near max settles open');
assert(snapHeight(200, min, max, 1200) === min, 'flick down minimizes');
assert(snapHeight(200, min, max, -1200) === max, 'flick up opens');
assert(resist(min, min, max) === min, 'min stays');
assert(resist(max, min, max) === max, 'max stays');
assert(resist(min - 200, min, max) >= min - DRAWER_SQUISH, 'floor holds');
assert(resist(min - 200, min, max) < min, 'pull past min resists');
assert(resist(max + 80, min, max) > max, 'pull past max resists');

console.log('flightDrawerSnap ok');
