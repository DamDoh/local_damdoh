
// Use type safe message keys with `next-intl`
// This file provides TypeScript with a clear structure for your translation files,
// preventing type-checking errors that can crash the application.

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type Messages = typeof import('./messages/en.json');

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface IntlMessages extends Messages {}
