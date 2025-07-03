import {getRequestConfig} from 'next-intl/server';
 
// This file is now only used to satisfy the middleware and does not
// actively load messages for the layout, as that is now handled
// directly in the layout file for improved stability.
export default getRequestConfig(async ({locale}) => ({
  // Messages are loaded in /src/app/[locale]/layout.tsx
}));
