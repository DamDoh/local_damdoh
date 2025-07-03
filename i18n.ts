import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  // This file is now only used to make the middleware happy.
  // The actual message loading is done in the layout file.
  // We return a minimal object here.
  return {
    messages: {}
  };
});