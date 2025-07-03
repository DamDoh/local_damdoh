import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  // This file is now just a placeholder to satisfy the build system.
  // The actual message loading is happening in the root layout.
  // This is a workaround for persistent build errors.
  return {
    messages: (await import(`./src/messages/${locale}/common.json`)).default
    messages: (await import(`/home/user/studio/src/messages/${locale}.json`)).default
  };
});
