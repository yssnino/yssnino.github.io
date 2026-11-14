/*
 * Nino Travel — site configuration
 * --------------------------------------
 * Paste your partner/affiliate IDs below once each program approves you.
 * Every search link still works while a value is blank (it just won't be tracked
 * for commission yet). Nothing else in the site needs editing.
 */
window.NV_CONFIG = {
  siteName: "Nino Travel",
  siteUrl: "https://yssnino.github.io/",

  // Contact shown on policy pages and used for "Email us" links. Leave blank to
  // show the social-DM fallback instead.
  contactEmail: "",
  socialHandle: "@yssn_nino1",
  socialUrl: "https://www.tiktok.com/@yssn_nino1",

  affiliates: {
    // Travelpayouts partner ID ("marker") — used on Aviasales flight searches.
    // Find it in Travelpayouts > Profile. Example: "123456"
    travelpayoutsMarker: "",

    // Booking.com affiliate ID ("aid"). Example: "1234567"
    bookingAid: "",

    // Expedia Group Travel Creator Program (Partnerize) camref. Example: "1011lxyz"
    // When set, Expedia links are wrapped as https://prf.hn/click/camref:<camref>/destination:<url>
    expediaCamref: "",

    // GetYourGuide partner ID. Example: "ABCD1234"
    getyourguidePartnerId: "",

    // Viator partner ID (pid) and campaign ID (mcid). Example: "P00012345", "42383"
    viatorPid: "",
    viatorMcid: "",

    // Discover Cars affiliate ID (a_aid). Example: "yssnnino"
    discoverCarsAid: "",

    // Airalo tracking link from Impact (full URL). If set, eSIM searches send users
    // through this link. Example: "https://airalo.pxf.io/abc123"
    airaloTrackingUrl: ""
  },

  // Deal-alert signup endpoint. Leave blank until connected.
  // Works with any service that accepts a form POST with an "email" field,
  // e.g. a Formspree form URL, a Buttondown/ConvertKit/Mailchimp form action, or a Google Apps Script web app.
  newsletterEndpoint: "",

  // Stripe Payment Links for paid services and digital products.
  stripe: {
    premiumItinerary: "",
    customTripPlan: "",
    familyTripPlan: "",
    flightHacksGuide: "",
    familyPackingKit: "",
    cityGuides: "",
    kidsActivityPack: "",
    delaySurvivalKit: "",
    guideBundle: ""
  }
};
