import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContexts";

const PreferencesContext = createContext(null);
let originalToLocaleDateString;
let originalToLocaleString;
let originalToLocaleTimeString;

export const PREFERENCES_STORAGE_KEY = "assetmach-preferences";

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English", locale: "en-US" },
  // { value: "hi", label: "Hindi", locale: "hi-IN" },
];

export const TIMEZONE_OPTIONS = [
  // { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "America/New_York", label: "Eastern Time (EST)" },
  // { value: "UTC", label: "UTC" },
  // { value: "Europe/London", label: "London (GMT/BST)" },
  // { value: "America/Los_Angeles", label: "Pacific Time (PST)" },
];

export const DATE_FORMAT_OPTIONS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" }, 
  // { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  // { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  // { value: "MMM DD, YYYY", label: "MMM DD, YYYY" },
];

export const DEFAULT_PREFERENCES = {
  language: "en",
  timezone: "America/New_York",
  dateFormat: "DD/MM/YYYY",
};

let activePreferences = DEFAULT_PREFERENCES;
let translationObserver;
let isTranslatingDom = false;
const originalTextByNode = new WeakMap();
const originalAttributesByElement = new WeakMap();

const HINDI_TRANSLATIONS = {
  "Settings": "सेटिंग्स",
  "Manage your account settings and preferences": "अपने खाते की सेटिंग्स और प्राथमिकताएं प्रबंधित करें",
  "Security": "सुरक्षा",
  "Security Settings": "सुरक्षा सेटिंग्स",
  "Manage your account security": "अपने खाते की सुरक्षा प्रबंधित करें",
  "Preferences": "प्राथमिकताएं",
  "Customize your experience": "अपना अनुभव अनुकूलित करें",
  "Appearance": "रूप-रंग",
  "Language": "भाषा",
  "Hindi": "हिंदी",
  "English": "अंग्रेजी",
  "Timezone": "समय क्षेत्र",
  "Date Format": "दिनांक प्रारूप",
  "Save All Changes": "सभी बदलाव सहेजें",
  "Saving...": "सहेजा जा रहा है...",
  "Reset to Defaults": "डिफॉल्ट पर रीसेट करें",
  "Preferences applied across the app.": "प्राथमिकताएं पूरे ऐप में लागू हो गई हैं।",
  "Theme": "थीम",
  "Light": "हल्का",
  "Dark": "गहरा",
  "Auto": "स्वचालित",
  "Dashboard": "डैशबोर्ड",
  "Admin Management": "एडमिन प्रबंधन",
  "Customer Management": "ग्राहक प्रबंधन",
  "Operations": "संचालन",
  "Team Management": "टीम प्रबंधन",
  "Checklists Builder": "चेकलिस्ट बिल्डर",
  "Checklist Builder": "चेकलिस्ट बिल्डर",
  "Checklist Assignment": "चेकलिस्ट असाइनमेंट",
  "Checklist Recycle Bin": "चेकलिस्ट रीसायकल बिन",
  "Assigned Checklist": "असाइन की गई चेकलिस्ट",
  "Assets Management": "एसेट प्रबंधन",
  "Raise Ticket": "टिकट बनाएं",
  "Tickets": "टिकट",
  "Reports": "रिपोर्ट",
  "Audit Logs": "ऑडिट लॉग",
  "Enquiries": "पूछताछ",
  "Recycle Bin": "रीसायकल बिन",
  "Logout": "लॉगआउट",
  "Add Team Member": "टीम सदस्य जोड़ें",
  "Manage Roles": "भूमिकाएं प्रबंधित करें",
  "Manage Departments": "विभाग प्रबंधित करें",
  "Total Members": "कुल सदस्य",
  "Active Members": "सक्रिय सदस्य",
  "On Leave": "छुट्टी पर",
  "Inactive Members": "निष्क्रिय सदस्य",
  "Search by name, email, role, or department...": "नाम, ईमेल, भूमिका या विभाग से खोजें...",
  "Filters": "फिल्टर",
  "Member": "सदस्य",
  "Role": "भूमिका",
  "Assigned": "असाइन",
  "Completed": "पूर्ण",
  "Performance": "प्रदर्शन",
  "Status": "स्थिति",
  "Actions": "कार्रवाई",
  "Active": "सक्रिय",
  "Inactive": "निष्क्रिय",
  "Notifications": "सूचनाएं",
  "Refresh": "रीफ्रेश",
  "Mark all as read": "सभी को पढ़ा हुआ करें",
  "Mark all read": "सभी पढ़े गए",
  "You're all caught up!": "आप पूरी तरह अपडेट हैं!",
  "No new notifications right now.": "अभी कोई नई सूचना नहीं है।",
  "Upgrade": "अपग्रेड",
  "Assign to Team": "टीम को असाइन करें",
  "Select Checklists (Required)": "चेकलिस्ट चुनें (आवश्यक)",
  "Select Team Members (Required)": "टीम सदस्य चुनें (आवश्यक)",
  "Select Assets (Optional)": "एसेट चुनें (वैकल्पिक)",
  "Due Date *": "नियत तारीख *",
  "Notes": "नोट्स",
  "Cancel": "रद्द करें",
  "Assign": "असाइन करें",
  "Priority *": "प्राथमिकता *",
  "Assignment Summary": "असाइनमेंट सारांश",
  "Low": "कम",
  "Medium": "मध्यम",
  "High": "उच्च",
  "Critical": "गंभीर",
  "Current Password": "वर्तमान पासवर्ड",
  "Enter current password": "वर्तमान पासवर्ड दर्ज करें",
  "New Password": "नया पासवर्ड",
  "Enter new password": "नया पासवर्ड दर्ज करें",
  "Confirm New Password": "नए पासवर्ड की पुष्टि करें",
  "Confirm new password": "नए पासवर्ड की पुष्टि करें",
  "Password Requirements": "पासवर्ड आवश्यकताएं",
  "Minimum 8 characters": "न्यूनतम 8 अक्षर",
  "Use uppercase and lowercase letters": "बड़े और छोटे अक्षरों का उपयोग करें",
  "Include a number and special character": "एक संख्या और विशेष अक्षर शामिल करें",
  "Client Management": "क्लाइंट प्रबंधन",
  "Client Details": "क्लाइंट विवरण",
  "Create": "बनाएं",
  "Edit": "संपादित करें",
  "Delete": "हटाएं",
  "View": "देखें",
  "Update": "अपडेट करें",
  "Submit": "सबमिट करें",
  "Search": "खोजें",
  "Name": "नाम",
  "Email": "ईमेल",
  "Phone": "फोन",
  "Address": "पता",
  "Department": "विभाग",
  "Location": "स्थान",
  "Created": "बनाया गया",
  "Updated": "अपडेट किया गया",
  "Submitted": "सबमिट किया गया",
  "Approved": "स्वीकृत",
  "Rejected": "अस्वीकृत",
  "Pending": "लंबित",
  "Open": "खुला",
  "Closed": "बंद",
  "Save": "सहेजें",
  "Close": "बंद करें",
  "Back": "वापस",
  "Next": "अगला",
  "Previous": "पिछला",
  "Upload": "अपलोड करें",
  "Download": "डाउनलोड करें",
  "Export": "निर्यात करें",
  "Import": "आयात करें",
  "Search dashboard": "डैशबोर्ड खोजें",
  "Today": "आज",
  "Week": "सप्ताह",
  "Monthly": "मासिक",
  "Yearly": "वार्षिक",
  "Custom": "कस्टम",
  "Customer & Asset": "ग्राहक और एसेट",
  "Plan & Subscriptions": "प्लान और सब्सक्रिप्शन",
  "Security Alerts": "सुरक्षा अलर्ट",
  "Customer Support": "ग्राहक सहायता",
  "User Activity": "उपयोगकर्ता गतिविधि",
  "Checklists & Assignments": "चेकलिस्ट और असाइनमेंट",
  "Today Customers": "आज के ग्राहक",
  "Today Renewals": "आज के नवीनीकरण",
  "Today Support": "आज की सहायता",
  "Today Checklists & Assignments": "आज की चेकलिस्ट और असाइनमेंट",
  "Active vs Inactive": "सक्रिय बनाम निष्क्रिय",
  "Resolved Today": "आज समाधान हुआ",
  "Monthly Active Users": "मासिक सक्रिय उपयोगकर्ता",
  "Today Checklist Builder": "आज का चेकलिस्ट बिल्डर",
  "Today Assignments": "आज के असाइनमेंट",
  "Assignments": "असाइनमेंट",
  "Revenue trend": "राजस्व प्रवृत्ति",
  "Monthly recurring revenue over period": "अवधि के दौरान मासिक आवर्ती राजस्व",
  "Clients by plan": "प्लान के अनुसार क्लाइंट",
  "Assignment overview": "असाइनमेंट अवलोकन",
  "Requests by urgency": "तात्कालिकता के अनुसार अनुरोध",
  "Team Members": "टीम सदस्य",
  "Today Team Members": "आज के टीम सदस्य",
  "Total Assets": "कुल एसेट",
  "Today Assets": "आज के एसेट",
  "Checklists": "चेकलिस्ट",
  "Today Checklists": "आज की चेकलिस्ट",
  "Submissions": "सबमिशन",
  "Today Submissions": "आज के सबमिशन",
  "Weekly activity": "साप्ताहिक गतिविधि",
  "Completed vs pending • last 7 days": "पूर्ण बनाम लंबित • पिछले 7 दिन",
  "active": "सक्रिय",
  "inactive": "निष्क्रिय",
  "pending": "लंबित",
  "submitted": "सबमिट",
  "published": "प्रकाशित",
  "published today": "आज प्रकाशित",
  "pending today": "आज लंबित",
  "submitted today": "आज सबमिट",
  "pending approval": "स्वीकृति लंबित",
  "pending approval total": "कुल स्वीकृति लंबित",
  "active subscriptions total": "कुल सक्रिय सब्सक्रिप्शन",
  "renewing": "नवीनीकरण",
  "expiring soon": "जल्द समाप्त",
  "active sessions": "सक्रिय सत्र",
  "resolved today": "आज समाधान हुआ",
  "monthly active users": "मासिक सक्रिय उपयोगकर्ता",
  "pending review": "समीक्षा लंबित",
  "pending review today": "आज समीक्षा लंबित",
  "need attention": "ध्यान चाहिए",
  "parent": "पैरेंट",
  "child": "चाइल्ड",
  "trial": "ट्रायल",
  "onboarding": "ऑनबोर्डिंग",
  "Subscriptions expiring shortly": "सब्सक्रिप्शन जल्द समाप्त हो रहे हैं",
  "premium": "प्रीमियम",
  "standard": "स्टैंडर्ड",
  "low": "कम",
  "overdue": "अतिदेय",
  "Overdue": "अतिदेय",
  "Recent Activities": "हाल की गतिविधियां",
  "Action": "क्रिया",
  "Description": "विवरण",
  "User": "उपयोगकर्ता",
  "When": "कब",
  "Plan Upgrade Requested": "प्लान अपग्रेड अनुरोध",
  "New Client Registered": "नया क्लाइंट पंजीकृत",
  "unread": "अपठित",
  "Urgent": "तत्काल",
  "Total customers": "कुल ग्राहक",
  "TOTAL customers": "कुल ग्राहक",
  "Active customers": "सक्रिय ग्राहक",
  "Inactive customers": "निष्क्रिय ग्राहक",
  "Trial vs onboarding": "ट्रायल बनाम ऑनबोर्डिंग",
  "Expired customers": "समाप्त ग्राहक",
  "Risky renewal customers": "जोखिम वाले नवीनीकरण ग्राहक",
  "Add Customer": "ग्राहक जोड़ें",
  "Manage customer accounts and memberships": "ग्राहक खाते और सदस्यताएं प्रबंधित करें",
  "Search customers...": "ग्राहक खोजें...",
  "All Status": "सभी स्थिति",
  "All Memberships": "सभी सदस्यताएं",
  "Showing": "दिखा रहे हैं",
  "customers": "ग्राहक",
  "membership": "सदस्यता",
  "Duration": "अवधि",
  "Usage": "उपयोग",
  "days left": "दिन शेष",
  "free": "फ्री",
  "Premium": "प्रीमियम",
  "Free": "फ्री",
  "Checklist Management": "चेकलिस्ट प्रबंधन",
  "Build, manage, and assign inspection checklists for your team": "अपनी टीम के लिए निरीक्षण चेकलिस्ट बनाएं, प्रबंधित करें और असाइन करें",
  "Clone": "क्लोन",
  "Request": "अनुरोध",
  "Published": "प्रकाशित",
  "TOTAL checklist": "कुल चेकलिस्ट",
  "TOTAL fields": "कुल फ़ील्ड",
  "All types": "सभी प्रकार",
  "Currently active": "वर्तमान में सक्रिय",
  "Across all lists": "सभी सूचियों में",
  "Requests": "अनुरोध",
  "Search checklists...": "चेकलिस्ट खोजें...",
  "Type": "प्रकार",
  "Category": "श्रेणी",
  "Fields": "फ़ील्ड",
  "Version": "संस्करण",
  "Created At": "बनाया गया",
  "results": "परिणाम",
  "form": "फॉर्म",
  "safety": "सुरक्षा",
  "Safety & Compliance": "सुरक्षा और अनुपालन",
  "Assignment Management": "असाइनमेंट प्रबंधन",
  "Assign checklists to admins and track progress": "एडमिन को चेकलिस्ट असाइन करें और प्रगति ट्रैक करें",
  "Assign to Admin": "एडमिन को असाइन करें",
  "Total assignments": "कुल असाइनमेंट",
  "Pending assignments": "लंबित असाइनमेंट",
  "Approved pending assignments": "स्वीकृत लंबित असाइनमेंट",
  "Submitted assignments": "सबमिट किए गए असाइनमेंट",
  "Overdue assignments": "अतिदेय असाइनमेंट",
  "Awaiting action": "कार्रवाई प्रतीक्षित",
  "Waiting for approval": "स्वीकृति प्रतीक्षित",
  "Sent for review": "समीक्षा के लिए भेजा गया",
  "Past due date": "नियत तारीख पार",
  "Search by checklist or assignee...": "चेकलिस्ट या असाइनी से खोजें...",
  "All Priority": "सभी प्राथमिकता",
  "Due From": "नियत तारीख से",
  "Due To": "नियत तारीख तक",
  "Checklist": "चेकलिस्ट",
  "Assigned To": "असाइन किया गया",
  "Due Date": "नियत तारीख",
  "Priority": "प्राथमिकता",
  "Progress": "प्रगति",
  "Ticket Raised": "टिकट बनाए गए",
  "Tickets escalated by admins for Super Admin action": "सुपर एडमिन कार्रवाई के लिए एडमिन द्वारा एस्केलेट किए गए टिकट",
  "Total tickets": "कुल टिकट",
  "Open tickets": "खुले टिकट",
  "Raised tickets": "बनाए गए टिकट",
  "Resolved tickets": "हल किए गए टिकट",
  "All Categories": "सभी श्रेणियां",
  "From": "से",
  "To": "तक",
  "Resolve": "हल करें",
  "RESOLVE": "हल करें",
  "Resolved": "हल हो गया",
  "Raised": "बनाया गया",
  "Raised by": "द्वारा बनाया गया",
  "Resolution Message": "समाधान संदेश",
  "Technical": "तकनीकी",
  "Raised to Super Admin": "सुपर एडमिन को भेजा गया",
};

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const translateValue = (value) => {
  const raw = String(value || "");
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (HINDI_TRANSLATIONS[trimmed]) return HINDI_TRANSLATIONS[trimmed];

  let translated = trimmed;
  Object.entries(HINDI_TRANSLATIONS)
    .sort(([a], [b]) => b.length - a.length)
    .forEach(([english, hindi]) => {
      translated = translated.replace(new RegExp(escapeRegExp(english), "gi"), hindi);
    });

  return translated !== trimmed ? translated : null;
};
const getTranslation = (value) => translateValue(value);
const ENGLISH_TRANSLATIONS = Object.fromEntries(
  Object.entries(HINDI_TRANSLATIONS).map(([english, hindi]) => [hindi, english]),
);
const getEnglishTranslation = (value) => ENGLISH_TRANSLATIONS[String(value || "").trim()];

const preserveWhitespace = (source, translated) => {
  const prefix = source.match(/^\s*/)?.[0] || "";
  const suffix = source.match(/\s*$/)?.[0] || "";
  return `${prefix}${translated}${suffix}`;
};

const translateTextNode = (node, language) => {
  if (!node?.nodeValue || !node.nodeValue.trim()) return;

  if (language !== "hi") {
    const restored = originalTextByNode.get(node) || getEnglishTranslation(node.nodeValue);
    if (restored && node.nodeValue !== restored) {
      node.nodeValue = preserveWhitespace(node.nodeValue, restored);
    }
    return;
  }

  if (!originalTextByNode.has(node)) {
    originalTextByNode.set(node, node.nodeValue);
  }

  const original = originalTextByNode.get(node);

  const translated = getTranslation(original);
  if (translated && node.nodeValue !== preserveWhitespace(original, translated)) {
    node.nodeValue = preserveWhitespace(original, translated);
  }
};

const translateElementAttributes = (element, language) => {
  const attributeNames = ["placeholder", "title", "aria-label"];
  const originals = originalAttributesByElement.get(element) || {};

  attributeNames.forEach((name) => {
    const current = element.getAttribute?.(name);
    if (!current) return;

    if (language !== "hi") {
      const restored = originals[name] || getEnglishTranslation(current);
      if (restored && element.getAttribute(name) !== restored) {
        element.setAttribute(name, restored);
      }
      return;
    }

    if (!originals[name]) originals[name] = current;

    const translated = getTranslation(originals[name]);
    if (translated && current !== translated) {
      element.setAttribute(name, translated);
    }
  });

  if (Object.keys(originals).length > 0) {
    originalAttributesByElement.set(element, originals);
  }
};

const shouldSkipNode = (node) => {
  const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  return Boolean(element?.closest?.("script, style, textarea, [data-no-translate='true']"));
};

const translateDomTree = (root = document.body, language = activePreferences.language) => {
  if (!root || isTranslatingDom) return;
  isTranslatingDom = true;

  try {
    if (root.nodeType === Node.TEXT_NODE) {
      if (!shouldSkipNode(root)) translateTextNode(root, language);
      return;
    }

    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (shouldSkipNode(root)) return;

    if (root.nodeType === Node.ELEMENT_NODE) {
      translateElementAttributes(root, language);
    }

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode(node) {
          return shouldSkipNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    let node = walker.currentNode;
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) translateTextNode(node, language);
      if (node.nodeType === Node.ELEMENT_NODE) translateElementAttributes(node, language);
      node = walker.nextNode();
    }
  } finally {
    isTranslatingDom = false;
  }
};

const installTranslationBridge = () => {
  if (translationObserver || typeof MutationObserver === "undefined") return;

  translationObserver = new MutationObserver((mutations) => {
    if (isTranslatingDom || activePreferences.language !== "hi") return;
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => translateDomTree(node, "hi"));
      if (mutation.type === "characterData") translateDomTree(mutation.target, "hi");
    });
  });

  translationObserver.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });
};

const getStoredPreferences = () => {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const normalizePreferences = (value = {}) => {
  const normalized = {
    ...DEFAULT_PREFERENCES,
    ...value,
  };

  if (normalized.language === "en-IN") normalized.language = "en";
  return normalized;
};

const getLocale = (language) =>
  LANGUAGE_OPTIONS.find((option) => option.value === language)?.locale || "en-US";

const getDateOrder = (format) => {
  if (format === "DD/MM/YYYY") return ["day", "month", "year"];
  if (format === "YYYY-MM-DD") return ["year", "month", "day"];
  return ["month", "day", "year"];
};

const getDatePartMap = (date, preferences) => {
  const formatter = new Intl.DateTimeFormat(getLocale(preferences.language), {
    timeZone: preferences.timezone,
    year: "numeric",
    month: preferences.dateFormat === "MMM DD, YYYY" ? "short" : "2-digit",
    day: "2-digit",
  });

  return Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
};

export const formatDateWithPreferences = (value, preferences = DEFAULT_PREFERENCES) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const normalized = normalizePreferences(preferences);
  const parts = getDatePartMap(date, normalized);

  if (normalized.dateFormat === "MMM DD, YYYY") {
    return `${parts.month} ${parts.day}, ${parts.year}`;
  }

  const separator = normalized.dateFormat === "YYYY-MM-DD" ? "-" : "/";
  return getDateOrder(normalized.dateFormat).map((part) => parts[part]).join(separator);
};

export const formatTimeWithPreferences = (value, preferences = DEFAULT_PREFERENCES) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const normalized = normalizePreferences(preferences);
  return new Intl.DateTimeFormat(getLocale(normalized.language), {
    timeZone: normalized.timezone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatDateTimeWithPreferences = (value, preferences = DEFAULT_PREFERENCES) => {
  const date = formatDateWithPreferences(value, preferences);
  const time = formatTimeWithPreferences(value, preferences);
  if (date === "—") return date;
  return time ? `${date}, ${time}` : date;
};

const installDatePreferenceBridge = () => {
  if (originalToLocaleDateString) return;

  originalToLocaleDateString = Date.prototype.toLocaleDateString;
  originalToLocaleString = Date.prototype.toLocaleString;
  originalToLocaleTimeString = Date.prototype.toLocaleTimeString;

  Date.prototype.toLocaleDateString = function toLocaleDateStringWithPreferences(locales, options = {}) {
    const mergedOptions = { ...options, timeZone: options?.timeZone || activePreferences.timezone };
    if (Object.keys(options || {}).length > 0) {
      return originalToLocaleDateString.call(this, getLocale(activePreferences.language), mergedOptions);
    }
    return formatDateWithPreferences(this, activePreferences);
  };

  Date.prototype.toLocaleString = function toLocaleStringWithPreferences(locales, options = {}) {
    const mergedOptions = { ...options, timeZone: options?.timeZone || activePreferences.timezone };
    if (Object.keys(options || {}).length > 0) {
      return originalToLocaleString.call(this, getLocale(activePreferences.language), mergedOptions);
    }
    return formatDateTimeWithPreferences(this, activePreferences);
  };

  Date.prototype.toLocaleTimeString = function toLocaleTimeStringWithPreferences(locales, options = {}) {
    const mergedOptions = { ...options, timeZone: options?.timeZone || activePreferences.timezone };
    if (Object.keys(options || {}).length > 0) {
      return originalToLocaleTimeString.call(this, getLocale(activePreferences.language), mergedOptions);
    }
    return formatTimeWithPreferences(this, activePreferences);
  };
};

export function PreferencesProvider({ children }) {
  const { user, patch, updateCurrentUser } = useAuth();
  const [preferences, setPreferencesState] = useState(() =>
    normalizePreferences(getStoredPreferences()),
  );

  useEffect(() => {
    if (user?.preferences) {
      setPreferencesState(normalizePreferences(user.preferences));
    }
  }, [user?.preferences]);

  useEffect(() => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    activePreferences = preferences;
    installDatePreferenceBridge();
    installTranslationBridge();
    window.requestAnimationFrame(() => translateDomTree(document.body, preferences.language));
    document.documentElement.lang = preferences.language || "en";
    window.dispatchEvent(new CustomEvent("assetmach-preferences-change", { detail: preferences }));
  }, [preferences]);

  const setPreferences = useCallback((nextPreferences) => {
    setPreferencesState((current) => normalizePreferences({ ...current, ...nextPreferences }));
  }, []);

  const savePreferences = useCallback(
    async (nextPreferences) => {
      const normalized = normalizePreferences(nextPreferences);
      setPreferencesState(normalized);
      updateCurrentUser?.({ preferences: normalized });

      try {
        const response = await patch("/auth/preferences", { preferences: normalized });
        const saved = normalizePreferences(response?.preferences || response?.user?.preferences || normalized);
        setPreferencesState(saved);
        updateCurrentUser?.({ preferences: saved });
        return { success: true, preferences: saved };
      } catch (error) {
        return {
          success: false,
          error:
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            "Preferences saved locally, but could not sync to the server.",
        };
      }
    },
    [patch, updateCurrentUser],
  );

  const value = useMemo(
    () => ({
      preferences,
      setPreferences,
      savePreferences,
      formatDate: (valueToFormat) => formatDateWithPreferences(valueToFormat, preferences),
      formatTime: (valueToFormat) => formatTimeWithPreferences(valueToFormat, preferences),
      formatDateTime: (valueToFormat) => formatDateTimeWithPreferences(valueToFormat, preferences),
    }),
    [preferences, setPreferences, savePreferences],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};
