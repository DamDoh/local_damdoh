import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  // This is a minimal configuration to isolate the build issue.
  // It only returns a static placeholder. If the build succeeds with this,
  // we can re-introduce dynamic message loading.
  return {
    messages: {
      "placeholder": "This is a placeholder to ensure the file is not empty."
    }
  };
});