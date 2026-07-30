/**
 * Where a sale originated. Orders created before this field existed have no
 * `channel` at all, so every read treats a missing value as ONLINE.
 */
export enum OrderChannel {
    ONLINE = 'ONLINE',
    POS = 'POS',
}
