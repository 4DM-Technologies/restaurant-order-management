import { getAccessToken } from '@/services/apiClient';
import { WS_BASE_URL } from '@/services/config';
import { log } from '@/services/logger';

const WS_BASE: string = WS_BASE_URL;

type LiveListener = (payload: unknown) => void;

const channels: { menu?: WebSocket; orders?: WebSocket } = {};
let menuListeners = new Set<LiveListener>();
let ordersListeners = new Set<LiveListener>();
let menuReconnectPending = false;
let ordersReconnectPending = false;

type ListenerBucket = { listeners: Set<LiveListener>; key: 'menu' | 'orders' };

function connect(bucket: ListenerBucket, onReconnectQueued: (queued: boolean) => void) {
  const token = getAccessToken();
  const url = `${WS_BASE}/ws/${bucket.key}?token=${encodeURIComponent(token ?? '')}`;
  log.info('liveClient', `connecting ws/${bucket.key}`);
  const ws = new WebSocket(url);

  ws.onopen = () => {
    log.info('liveClient', `ws/${bucket.key} open`);
    onReconnectQueued(false);
  };

  ws.onmessage = (event: MessageEvent) => {
    let msg: unknown = null;
    try {
      msg = JSON.parse(String(event.data));
    } catch {
      return;
    }
    log.debug('liveClient', `ws/${bucket.key} message`, msg);
    bucket.listeners.forEach((fn) => fn(msg));
  };

  ws.onclose = () => {
    log.warn('liveClient', `ws/${bucket.key} closed`);
    if (channels[bucket.key] === ws) channels[bucket.key] = undefined;
    if (bucket.listeners.size > 0) {
      onReconnectQueued(true);
      log.info('liveClient', `ws/${bucket.key} reconnect queued (2s)`);
      setTimeout(() => connect(bucket, onReconnectQueued), 2000);
    }
  };

  ws.onerror = () => ws.close();

  channels[bucket.key] = ws;
}

function subscribe(
  bucket: ListenerBucket,
  reconnectPending: () => boolean,
  queueReconnect: (v: boolean) => void,
  fn: LiveListener,
): () => void {
  bucket.listeners.add(fn);
  if (!channels[bucket.key] && !reconnectPending()) {
    connect(bucket, queueReconnect);
  }
  return () => {
    bucket.listeners.delete(fn);
    if (bucket.listeners.size === 0) {
      channels[bucket.key]?.close();
      channels[bucket.key] = undefined;
      queueReconnect(false);
    }
  };
}

export interface MenuLivePayload {
  event: 'menu_updated' | 'menu_item_updated' | 'ping';
}

export interface OrdersLivePayload {
  event: 'order_updated' | 'order_created' | 'ping';
}

export function subscribeMenu(fn: LiveListener): () => void {
  return subscribe(
    { listeners: menuListeners, key: 'menu' },
    () => menuReconnectPending,
    (v) => {
      menuReconnectPending = v;
    },
    fn,
  );
}

export function subscribeOrders(fn: LiveListener): () => void {
  return subscribe(
    { listeners: ordersListeners, key: 'orders' },
    () => ordersReconnectPending,
    (v) => {
      ordersReconnectPending = v;
    },
    fn,
  );
}