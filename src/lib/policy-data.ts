
export interface PolicyContent {
  title: string;
  lastUpdated: string;
  introduction: string;
  sections: Array<{
    heading: string;
    content: string | string[]; // Allow string or array of strings for paragraphs
  }>;
  conclusion?: string;
}

export const privacyPolicyData: PolicyContent = {
  title: "Privacy Policy",
  lastUpdated: "October 26, 2023",
  introduction: "Welcome to DamDoh! We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at privacy@damdoh.org.",
  sections: [
    {
      heading: "1. WHAT INFORMATION DO WE COLLECT?",
      content: [
        "In Short: We collect personal information that you provide to us.",
        "We collect personal information that you voluntarily provide to us when you register on the DamDoh platform, express an interest in obtaining information about us or our products and Services, when you participate in activities on the platform (such as posting messages in our forums or entering competitions, contests or giveaways) or otherwise when you contact us.",
        "The personal information that we collect depends on the context of your interactions with us and the platform, the choices you make and the products and features you use. The personal information we collect may include the following: names; phone numbers; email addresses; mailing addresses; job titles; contact preferences; contact or authentication data; billing addresses; and other similar information."
      ],
    },
    {
      heading: "2. HOW DO WE USE YOUR INFORMATION?",
      content: [
        "In Short: We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent.",
        "We use personal information collected via our platform for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations."
      ],
    },
    {
      heading: "3. WILL YOUR INFORMATION BE SHARED WITH ANYONE?",
      content: "In Short: We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.",
    },
    {
      heading: "4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?",
      content: "In Short: We may use cookies and other tracking technologies to collect and store your information. More details can be found in our Cookie Policy."
    },
    {
      heading: "5. HOW LONG DO WE KEEP YOUR INFORMATION?",
      content: "In Short: We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law."
    },
    {
      heading: "6. HOW DO WE KEEP YOUR INFORMATION SAFE?",
      content: "In Short: We aim to protect your personal information through a system of organizational and technical security measures."
    },
    {
      heading: "7. DO WE MAKE UPDATES TO THIS NOTICE?",
      content: "In Short: Yes, we will update this notice as necessary to stay compliant with relevant laws. We will notify you of material changes."
    }
  ],
  conclusion: "If you have questions or comments about this notice, you may email us at privacy@damdoh.org.",
};

export const termsOfServiceData: PolicyContent = {
  title: "Terms of Service",
  lastUpdated: "October 26, 2023",
  introduction: "Please read these Terms of Service ('Terms', 'Terms of Service') carefully before using the DamDoh mobile application and website (the 'Service') operated by DamDoh ('us', 'we', or 'our'). Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who wish to access or use the Service.",
  sections: [
    {
      heading: "1. Accounts",
      content: "When you create an account with us, you guarantee that you are above the age of 18, and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service.",
    },
    {
      heading: "2. Intellectual Property",
      content: "The Service and its original content, features, and functionality are and will remain the exclusive property of DamDoh and its licensors. The Service is protected by copyright, trademark, and other laws of both the [Your Country] and foreign countries.",
    },
    {
      heading: "3. User Conduct",
      content: "You agree not to use the Service to post or transmit any material which is defamatory, offensive, or of an obscene or menacing character, or which may, in our judgment, cause annoyance, inconvenience or anxiety to any person.",
    },
    {
        heading: "4. Termination",
        content: "We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms."
    }
  ],
  conclusion: "By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you do not have permission to access the Service. Contact us at legal@damdoh.org for any questions."
};

export const cookiePolicyData: PolicyContent = {
  title: "Cookie Policy",
  lastUpdated: "October 26, 2023",
  introduction: "This Cookie Policy explains what cookies are and how we use them on the DamDoh platform. You should read this policy so you can understand what type of cookies we use, or the information we collect using cookies and how that information is used.",
  sections: [
    {
      heading: "1. What are cookies?",
      content: "Cookies are small text files that are stored on your computer or mobile device when you visit a website. They allow the website to recognize your device and remember if you’ve been to the website before. Cookies are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.",
    },
    {
      heading: "2. How do we use cookies?",
      content: [
        "We use cookies for several purposes:",
        "- Essential Cookies: Some cookies are essential for you to be able to experience the full functionality of our site. They allow us to maintain user sessions and prevent any security threats.",
        "- Performance Cookies: These cookies collect information about how you use our website, like which pages you visited and which links you clicked on. None of this information can be used to identify you. It is all aggregated and, therefore, anonymized. Their sole purpose is to improve website functions.",
        "- Functionality Cookies: These cookies allow our website to remember choices you make while browsing. For instance, we may store your geographic location in a cookie to ensure we show you the website localized for your area or remember your preference for language or theme.",
        "- Marketing Cookies: These cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third party advertisers. (Note: Specify if you use these)"
      ],
    },
    {
      heading: "3. Your Choices Regarding Cookies",
      content: "If you'd prefer to avoid the use of cookies on the platform, you can disable the use of cookies in your browser and then delete the cookies saved in your browser associated with this website. You may use this option for preventing the use of cookies at any time. If you do not accept our cookies, you may experience some inconvenience in your use of the platform and some features may not function properly.",
    }
  ],
  conclusion: "If you have any questions about this Cookie Policy, please contact us: support@damdoh.org.",
};
