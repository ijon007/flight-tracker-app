import { DRAWER_HEADER, DRAWER_SQUISH, resist, snapHeight, tapTarget } from './flightDrawerSnap';

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

const mid = 240;
const tall = 700;
assert(snapHeight(100, min, tall, 0, mid) === min, 'near closed stays closed');
assert(snapHeight(220, min, tall, 0, mid) === mid, 'near the short sheet stays there');
assert(snapHeight(600, min, tall, 0, mid) === tall, 'near the tall sheet stays there');
assert(snapHeight(400, min, tall, 1200, mid) === mid, 'flick down drops one detent');
assert(snapHeight(400, min, tall, -1200, mid) === tall, 'flick up rises one detent');
assert(snapHeight(100, min, tall, -1200, mid) === mid, 'flick up from closed opens the short sheet');
assert(tapTarget(min, min, tall, mid) === mid, 'tap from closed opens the short sheet');
assert(tapTarget(mid, min, tall, mid) === tall, 'tap from short opens tall');
assert(tapTarget(tall, min, tall, mid) === min, 'tap from tall closes');

console.log('flightDrawerSnap ok');
