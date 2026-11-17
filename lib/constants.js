// Small shared constants (kept free of dependencies so client bundles stay light).
export const ORDER_ID_REGEX = /^EVT-\d{8}-[A-Z0-9]{5}$/;
export const EVENT_TYPES = ['wedding', 'engagement', 'reception', 'birthday', 'puberty', 'housewarming', 'religious', 'funeral', 'corporate', 'other'];
export const MAX_RENTAL_DAYS = 30;
export const ORDER_STATUSES = ['pending', 'accepted', 'cancelled', 'completed'];
