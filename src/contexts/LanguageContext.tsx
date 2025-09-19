import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';

// Translation interfaces
interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  availableLanguages: { code: string; name: string; nativeName: string }[];
}

// Available languages
export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' }
];

// Translation data
const translations: Translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.map': 'Interactive Map',
    'nav.reports': 'Citizen Reports',
    'nav.reportForm': 'Report Hazard',
    'nav.reportsMap': 'Reports Map',
    'nav.alerts': 'Alert Management',
    'nav.validation': 'Validation Queue',
    'nav.predictions': 'AI Predictions',
    'nav.social': 'Social Monitor',
    'nav.resources': 'Emergency Resources',
    'nav.settings': 'Settings',
    
    // Page titles
    'page.dashboard.title': 'Dashboard Overview',
    'page.dashboard.subtitle': 'Real-time monitoring and system overview',
    'page.map.title': 'Interactive Map',
    'page.map.subtitle': 'Interactive coastal hazard visualization',
    'page.reports.title': 'Citizen Reports',
    'page.reports.subtitle': 'Citizen-submitted hazard reports and validation',
    'page.reportForm.title': 'Report Ocean Hazard',
    'page.reportForm.subtitle': 'Submit a new ocean hazard report with location and media',
    'page.reportsMap.title': 'Reports Map View',
    'page.reportsMap.subtitle': 'View all submitted reports on an interactive map',
    'page.alerts.title': 'Alert Management',
    'page.alerts.subtitle': 'Create and manage emergency alerts',
    'page.validation.title': 'Validation Queue',
    'page.validation.subtitle': 'Review and verify pending reports',
    'page.predictions.title': 'AI Predictions',
    'page.predictions.subtitle': 'AI-generated hazard predictions and forecasts',
    'page.social.title': 'Social Media Monitor',
    'page.social.subtitle': 'Social media sentiment and keyword analysis',
    'page.resources.title': 'Emergency Resources',
    'page.resources.subtitle': 'Emergency resources and shelter locations',
    'page.settings.title': 'Settings',
    'page.settings.subtitle': 'Manage your account and preferences',
    
    // Dashboard
    'dashboard.title': 'Dashboard Overview',
    'dashboard.subtitle': 'Real-time monitoring and system overview',
    'dashboard.welcome': 'Welcome back',
    'dashboard.totalReports': 'Total Reports',
    'dashboard.activeAlerts': 'Active Alerts',
    'dashboard.verifiedReports': 'Verified Reports',
    'dashboard.pendingReports': 'Pending Reports',
    
    // Settings
    'settings.title': 'Settings',
    'settings.userProfile': 'User Profile',
    'settings.security': 'Security',
    'settings.notifications': 'Notifications',
    'settings.appearance': 'Appearance',
    'settings.account': 'Account',
    'settings.fullName': 'Full Name',
    'settings.email': 'Email Address',
    'settings.phone': 'Phone Number',
    'settings.organization': 'Organization',
    'settings.saveChanges': 'Save Changes',
    'settings.saving': 'Saving...',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.profilePicture': 'Profile Picture',
    'settings.uploadPhoto': 'Upload Photo',
    'settings.removePhoto': 'Remove',
    'settings.photoRecommendation': 'Recommended: Square image, max 5MB',
    
    // Security
    'security.title': 'Security Settings',
    'security.currentPassword': 'Current Password',
    'security.newPassword': 'New Password',
    'security.confirmPassword': 'Confirm New Password',
    'security.updatePassword': 'Update Password',
    'security.updating': 'Updating...',
    'security.passwordRequirements': 'Password Requirements:',
    'security.minLength': 'At least 8 characters',
    'security.uppercase': 'Uppercase letter',
    'security.lowercase': 'Lowercase letter',
    'security.number': 'Number',
    'security.specialChar': 'Special character (recommended)',
    'security.passwordsMatch': '✓ Passwords match',
    'security.passwordsDontMatch': '✗ Passwords do not match',
    
    // Notifications
    'notifications.title': 'Notification Preferences',
    'notifications.emergencyAlerts': 'Emergency Alerts',
    'notifications.emergencyAlertsDesc': 'Get notified about emergency alerts and warnings',
    'notifications.reportUpdates': 'Report Updates',
    'notifications.reportUpdatesDesc': 'Get notified when your reports are verified or updated',
    'notifications.socialSummaries': 'Social Media Summaries',
    'notifications.socialSummariesDesc': 'Get weekly summaries of social media mentions',
    'notifications.aiPredictions': 'AI Predictions',
    'notifications.aiPredictionsDesc': 'Get notified about new hazard predictions in your area',
    'notifications.systemUpdates': 'System Updates',
    'notifications.systemUpdatesDesc': 'Get notified about system maintenance and updates',
    'notifications.savePreferences': 'Save Preferences',
    
    // Account
    'account.title': 'Account Management',
    'account.deleteAccount': 'Delete Account',
    'account.deleteAccountDesc': 'Permanently delete your account and all associated data. This action cannot be undone. All your reports, settings, and profile information will be permanently removed.',
    'account.deleting': 'Deleting...',
    'account.accountInfo': 'Account Information',
    'account.userId': 'User ID:',
    'account.accountCreated': 'Account Created:',
    'account.role': 'Role:',
    
    // Report Form
    'reportForm.title': 'Report Ocean Hazard',
    'reportForm.subtitle': 'Help keep our coastal communities safe by reporting hazards and unusual ocean activities',
    'reportForm.hazardType': 'Hazard Type',
    'reportForm.hazardTitle': 'Report Title',
    'reportForm.hazardTitlePlaceholder': 'Brief description of the hazard (e.g., "Large waves approaching shore")',
    'reportForm.description': 'Detailed Description',
    'reportForm.descriptionPlaceholder': 'Provide detailed information about what you observed, including timing, intensity, and any immediate dangers...',
    'reportForm.urgencyLevel': 'Urgency Level',
    'reportForm.location': 'Location',
    'reportForm.currentLocation': 'Use Current Location',
    'reportForm.gettingLocation': 'Getting your location...',
    'reportForm.locationRequired': 'Location Required to Submit',
    'reportForm.enableLocation': 'Enable Location Access',
    'reportForm.manualLocation': 'Enter Location Manually',
    'reportForm.addPhotos': 'Add Photos',
    'reportForm.addVideos': 'Add Videos',
    'reportForm.submitReport': 'Submit Report',
    'reportForm.submittingReport': 'Submitting Report...',
    'reportForm.uploadingMedia': 'Uploading Media...',
    'reportForm.databaseNotConfigured': 'Database Not Configured',
    'reportForm.permissionDenied': 'Location permission was denied. Please enable location services in your browser settings to use this feature.',
    'reportForm.permissionBlocked': 'Location access is blocked. Please enable location services and refresh the page.',
    'reportForm.locationNotSupported': 'Location services are not supported by your browser.',
    'reportForm.locationTimeout': 'Location request timed out. Please try again or enter location manually.',
    'reportForm.locationError': 'Unable to get your location. Please try again or enter location manually.',
    
    // Hazard Types
    'hazard.cyclone': 'Cyclone/Hurricane',
    'hazard.tsunami': 'Tsunami',
    'hazard.stormSurge': 'Storm Surge',
    'hazard.coastalErosion': 'Coastal Erosion',
    'hazard.flooding': 'Flooding',
    'hazard.other': 'Other Ocean Hazard',
    
    // Urgency Levels
    'urgency.1': 'Low - No immediate danger',
    'urgency.2': 'Moderate - Monitor situation',
    'urgency.3': 'High - Take precautions',
    'urgency.4': 'Very High - Evacuate if necessary',
    'urgency.5': 'Critical - Immediate evacuation',
    
    // Reports
    'reports.allStatus': 'All Status',
    'reports.pending': 'Pending',
    'reports.pendingVerification': 'Pending Verification',
    'reports.verified': 'Verified',
    'reports.dismissed': 'Dismissed',
    'reports.allHazards': 'All Hazards',
    'reports.searchPlaceholder': 'Search reports...',
    'reports.noReports': 'No reports found',
    'reports.loadingReports': 'Loading reports...',
    'reports.viewOnMap': 'View on Map',
    'reports.reportedBy': 'Reported by',
    'reports.reportedAt': 'Reported at',
    'reports.location': 'Location',
    'reports.urgency': 'Urgency',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.warning': 'Warning',
    'common.info': 'Info',
    'common.signOut': 'Sign Out',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.reset': 'Reset',
    'common.refresh': 'Refresh'
  },
  
  hi: {
    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.map': 'इंटरैक्टिव मैप',
    'nav.reports': 'नागरिक रिपोर्ट',
    'nav.reportForm': 'खतरा रिपोर्ट करें',
    'nav.reportsMap': 'रिपोर्ट मैप',
    'nav.alerts': 'अलर्ट प्रबंधन',
    'nav.validation': 'सत्यापन कतार',
    'nav.predictions': 'AI भविष्यवाणी',
    'nav.social': 'सामाजिक मॉनिटर',
    'nav.resources': 'आपातकालीन संसाधन',
    'nav.settings': 'सेटिंग्स',
    
    // Page titles
    'page.dashboard.title': 'डैशबोर्ड अवलोकन',
    'page.dashboard.subtitle': 'रियल-टाइम निगरानी और सिस्टम अवलोकन',
    'page.map.title': 'इंटरैक्टिव मैप',
    'page.map.subtitle': 'इंटरैक्टिव तटीय खतरा दृश्यावलोकन',
    'page.reports.title': 'नागरिक रिपोर्ट',
    'page.reports.subtitle': 'नागरिक-प्रस्तुत खतरा रिपोर्ट और सत्यापन',
    'page.reportForm.title': 'समुद्री खतरा रिपोर्ट करें',
    'page.reportForm.subtitle': 'स्थान और मीडिया के साथ नया समुद्री खतरा रिपोर्ट जमा करें',
    'page.reportsMap.title': 'रिपोर्ट मैप दृश्य',
    'page.reportsMap.subtitle': 'इंटरैक्टिव मैप पर सभी प्रस्तुत रिपोर्ट देखें',
    'page.alerts.title': 'अलर्ट प्रबंधन',
    'page.alerts.subtitle': 'आपातकालीन अलर्ट बनाएं और प्रबंधित करें',
    'page.validation.title': 'सत्यापन कतार',
    'page.validation.subtitle': 'लंबित रिपोर्टों की समीक्षा और सत्यापन करें',
    'page.predictions.title': 'AI भविष्यवाणी',
    'page.predictions.subtitle': 'AI-जनरेटेड खतरा भविष्यवाणी और पूर्वानुमान',
    'page.social.title': 'सामाजिक मीडिया मॉनिटर',
    'page.social.subtitle': 'सामाजिक मीडिया भावना और कीवर्ड विश्लेषण',
    'page.resources.title': 'आपातकालीन संसाधन',
    'page.resources.subtitle': 'आपातकालीन संसाधन और आश्रय स्थान',
    'page.settings.title': 'सेटिंग्स',
    'page.settings.subtitle': 'अपना खाता और प्राथमिकताएं प्रबंधित करें',
    
    // Dashboard
    'dashboard.title': 'डैशबोर्ड अवलोकन',
    'dashboard.subtitle': 'रियल-टाइम निगरानी और सिस्टम अवलोकन',
    'dashboard.welcome': 'वापसी पर स्वागत है',
    'dashboard.totalReports': 'कुल रिपोर्ट',
    'dashboard.activeAlerts': 'सक्रिय अलर्ट',
    'dashboard.verifiedReports': 'सत्यापित रिपोर्ट',
    'dashboard.pendingReports': 'लंबित रिपोर्ट',
    
    // Settings
    'settings.title': 'सेटिंग्स',
    'settings.userProfile': 'उपयोगकर्ता प्रोफाइल',
    'settings.security': 'सुरक्षा',
    'settings.notifications': 'सूचनाएं',
    'settings.appearance': 'दिखावट',
    'settings.account': 'खाता',
    'settings.fullName': 'पूरा नाम',
    'settings.email': 'ईमेल पता',
    'settings.phone': 'फोन नंबर',
    'settings.organization': 'संगठन',
    'settings.saveChanges': 'बदलाव सेव करें',
    'settings.saving': 'सेव हो रहा है...',
    'settings.theme': 'थीम',
    'settings.language': 'भाषा',
    'settings.light': 'लाइट',
    'settings.dark': 'डार्क',
    'settings.profilePicture': 'प्रोफाइल चित्र',
    'settings.uploadPhoto': 'फोटो अपलोड करें',
    'settings.removePhoto': 'हटाएं',
    'settings.photoRecommendation': 'सुझाव: वर्गाकार छवि, अधिकतम 5MB',
    
    // Security
    'security.title': 'सुरक्षा सेटिंग्स',
    'security.currentPassword': 'मौजूदा पासवर्ड',
    'security.newPassword': 'नया पासवर्ड',
    'security.confirmPassword': 'नया पासवर्ड की पुष्टि करें',
    'security.updatePassword': 'पासवर्ड अपडेट करें',
    'security.updating': 'अपडेट हो रहा है...',
    'security.passwordRequirements': 'पासवर्ड आवश्यकताएं:',
    'security.minLength': 'कम से कम 8 अक्षर',
    'security.uppercase': 'बड़ा अक्षर',
    'security.lowercase': 'छोटा अक्षर',
    'security.number': 'संख्या',
    'security.specialChar': 'विशेष अक्षर (सुझावित)',
    'security.passwordsMatch': '✓ पासवर्ड मेल खाते हैं',
    'security.passwordsDontMatch': '✗ पासवर्ड मेल नहीं खाते',
    
    // Report Form
    'reportForm.title': 'समुद्री खतरा रिपोर्ट करें',
    'reportForm.subtitle': 'खतरों और असामान्य समुद्री गतिविधियों की रिपोर्ट करके हमारे तटीय समुदायों को सुरक्षित रखने में मदद करें',
    'reportForm.hazardType': 'खतरे का प्रकार',
    'reportForm.hazardTitle': 'रिपोर्ट शीर्षक',
    'reportForm.hazardTitlePlaceholder': 'खतरे का संक्षिप्त विवरण (जैसे "तट के पास बड़ी लहरें आ रही हैं")',
    'reportForm.description': 'विस्तृत विवरण',
    'reportForm.descriptionPlaceholder': 'आपने जो देखा उसकी विस्तृत जानकारी प्रदान करें, समय, तीव्रता और तत्काल खतरे सहित...',
    'reportForm.urgencyLevel': 'तात्कालिकता स्तर',
    'reportForm.location': 'स्थान',
    'reportForm.currentLocation': 'वर्तमान स्थान का उपयोग करें',
    'reportForm.gettingLocation': 'आपका स्थान प्राप्त कर रहे हैं...',
    'reportForm.locationRequired': 'जमा करने के लिए स्थान आवश्यक',
    'reportForm.enableLocation': 'स्थान पहुंच सक्षम करें',
    'reportForm.manualLocation': 'स्थान मैन्युअल रूप से दर्ज करें',
    'reportForm.addPhotos': 'फोटो जोड़ें',
    'reportForm.addVideos': 'वीडियो जोड़ें',
    'reportForm.submitReport': 'रिपोर्ट जमा करें',
    'reportForm.submittingReport': 'रिपोर्ट जमा कर रहे हैं...',
    'reportForm.uploadingMedia': 'मीडिया अपलोड कर रहे हैं...',
    'reportForm.databaseNotConfigured': 'डेटाबेस कॉन्फ़िगर नहीं है',
    'reportForm.permissionDenied': 'स्थान अनुमति से इनकार कर दिया गया। कृपया इस सुविधा का उपयोग करने के लिए अपनी ब्राउज़र सेटिंग्स में स्थान सेवाएं सक्षम करें।',
    'reportForm.permissionBlocked': 'स्थान पहुंच अवरुद्ध है। कृपया स्थान सेवाएं सक्षम करें और पृष्ठ को रीफ्रेश करें।',
    'reportForm.locationNotSupported': 'आपके ब्राउज़र द्वारा स्थान सेवाएं समर्थित नहीं हैं।',
    'reportForm.locationTimeout': 'स्थान अनुरोध समय समाप्त। कृपया फिर से कोशिश करें या मैन्युअल रूप से स्थान दर्ज करें।',
    'reportForm.locationError': 'आपका स्थान प्राप्त करने में असमर्थ। कृपया फिर से कोशिश करें या मैन्युअल रूप से स्थान दर्ज करें।',
    
    // Hazard Types
    'hazard.cyclone': 'चक्रवात/तूफान',
    'hazard.tsunami': 'सुनामी',
    'hazard.stormSurge': 'तूफानी लहर',
    'hazard.coastalErosion': 'तटीय कटाव',
    'hazard.flooding': 'बाढ़',
    'hazard.other': 'अन्य समुद्री खतरा',
    
    // Urgency Levels
    'urgency.1': 'कम - कोई तत्काल खतरा नहीं',
    'urgency.2': 'मध्यम - स्थिति पर नजर रखें',
    'urgency.3': 'उच्च - एहतियात बरतें',
    'urgency.4': 'बहुत उच्च - आवश्यक हो तो निकासी करें',
    'urgency.5': 'गंभीर - तत्काल निकासी',
    
    // Reports
    'reports.allStatus': 'सभी स्थिति',
    'reports.pending': 'लंबित',
    'reports.pendingVerification': 'सत्यापन लंबित',
    'reports.verified': 'सत्यापित',
    'reports.dismissed': 'खारिज',
    'reports.allHazards': 'सभी खतरे',
    'reports.searchPlaceholder': 'रिपोर्ट खोजें...',
    'reports.noReports': 'कोई रिपोर्ट नहीं मिली',
    'reports.loadingReports': 'रिपोर्ट लोड हो रही हैं...',
    'reports.viewOnMap': 'मैप पर देखें',
    'reports.reportedBy': 'रिपोर्ट किया गया',
    'reports.reportedAt': 'रिपोर्ट समय',
    'reports.location': 'स्थान',
    'reports.urgency': 'तात्कालिकता',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.save': 'सेव करें',
    'common.cancel': 'रद्द करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.view': 'देखें',
    'common.success': 'सफलता',
    'common.error': 'त्रुटि',
    'common.warning': 'चेतावनी',
    'common.info': 'जानकारी',
    'common.signOut': 'साइन आउट',
    'common.search': 'खोजें',
    'common.filter': 'फिल्टर',
    'common.clear': 'साफ करें',
    'common.close': 'बंद करें',
    'common.back': 'वापस',
    'common.next': 'अगला',
    'common.previous': 'पिछला',
    'common.submit': 'जमा करें',
    'common.reset': 'रीसेट',
    'common.refresh': 'रीफ्रेश'
  },
  
  bn: {
    // Navigation
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.map': 'ইন্টারেক্টিভ ম্যাপ',
    'nav.reports': 'নাগরিক রিপোর্ট',
    'nav.reportForm': 'বিপদ রিপোর্ট করুন',
    'nav.reportsMap': 'রিপোর্ট ম্যাপ',
    'nav.alerts': 'সতর্কতা ব্যবস্থাপনা',
    'nav.validation': 'যাচাইকরণ সারি',
    'nav.predictions': 'AI ভবিষ্যদ্বাণী',
    'nav.social': 'সামাজিক মনিটর',
    'nav.resources': 'জরুরি সম্পদ',
    'nav.settings': 'সেটিংস',
    
    // Settings
    'settings.title': 'সেটিংস',
    'settings.userProfile': 'ব্যবহারকারী প্রোফাইল',
    'settings.security': 'নিরাপত্তা',
    'settings.notifications': 'বিজ্ঞপ্তি',
    'settings.appearance': 'চেহারা',
    'settings.account': 'অ্যাকাউন্ট',
    'settings.fullName': 'পূর্ণ নাম',
    'settings.email': 'ইমেইল ঠিকানা',
    'settings.phone': 'ফোন নম্বর',
    'settings.organization': 'সংগঠন',
    'settings.saveChanges': 'পরিবর্তন সংরক্ষণ করুন',
    'settings.saving': 'সংরক্ষণ করা হচ্ছে...',
    'settings.theme': 'থিম',
    'settings.language': 'ভাষা',
    'settings.light': 'হালকা',
    'settings.dark': 'অন্ধকার',
    'settings.profilePicture': 'প্রোফাইল ছবি',
    'settings.uploadPhoto': 'ছবি আপলোড করুন',
    'settings.removePhoto': 'মুছে ফেলুন',
    'settings.photoRecommendation': 'সুপারিশ: বর্গাকার চিত্র, সর্বোচ্চ 5MB',
    
    // Common
    'common.loading': 'লোড হচ্ছে...',
    'common.save': 'সংরক্ষণ করুন',
    'common.cancel': 'বাতিল করুন',
    'common.delete': 'মুছে ফেলুন',
    'common.edit': 'সম্পাদনা করুন',
    'common.view': 'দেখুন',
    'common.success': 'সফল',
    'common.error': 'ত্রুটি',
    'common.warning': 'সতর্কতা',
    'common.info': 'তথ্য',
    'common.signOut': 'সাইন আউট',
    'common.search': 'অনুসন্ধান',
    'common.filter': 'ফিল্টার',
    'common.clear': 'পরিষ্কার করুন',
    'common.close': 'বন্ধ করুন',
    'common.back': 'পিছনে',
    'common.next': 'পরবর্তী',
    'common.previous': 'পূর্ববর্তী',
    'common.submit': 'জমা দিন',
    'common.reset': 'রিসেট',
    'common.refresh': 'রিফ্রেশ'
  },
  
  te: {
    // Navigation
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.map': 'ఇంటరాక్టివ్ మ్యాప్',
    'nav.reports': 'పౌర రిపోర్టులు',
    'nav.reportForm': 'ప్రమాదం రిపోర్ట్ చేయండి',
    'nav.reportsMap': 'రిపోర్టుల మ్యాప్',
    'nav.alerts': 'అలర్ట్ మేనేజ్‌మెంట్',
    'nav.validation': 'వాలిడేషన్ క్యూ',
    'nav.predictions': 'AI అంచనాలు',
    'nav.social': 'సామాజిక మానిటర్',
    'nav.resources': 'అత్యవసర వనరులు',
    'nav.settings': 'సెట్టింగ్‌లు',
    
    // Settings
    'settings.title': 'సెట్టింగ్‌లు',
    'settings.userProfile': 'వినియోగదారు ప్రొఫైల్',
    'settings.security': 'భద్రత',
    'settings.notifications': 'నోటిఫికేషన్‌లు',
    'settings.appearance': 'రూపాన్ని',
    'settings.account': 'ఖాతా',
    'settings.fullName': 'పూర్తి పేరు',
    'settings.email': 'ఇమెయిల్ చిరునామా',
    'settings.phone': 'ఫోన్ నంబర్',
    'settings.organization': 'సంస్థ',
    'settings.saveChanges': 'మార్పులను సేవ్ చేయండి',
    'settings.saving': 'సేవ్ చేస్తోంది...',
    'settings.theme': 'థీమ్',
    'settings.language': 'భాష',
    'settings.light': 'లైట్',
    'settings.dark': 'డార్క్',
    'settings.profilePicture': 'ప్రొఫైల్ చిత్రం',
    'settings.uploadPhoto': 'ఫోటో అప్‌లోడ్ చేయండి',
    'settings.removePhoto': 'తొలగించండి',
    'settings.photoRecommendation': 'సిఫార్సు: చతురస్రాకార చిత్రం, గరిష్టంగా 5MB',
    
    // Common
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.save': 'సేవ్ చేయండి',
    'common.cancel': 'రద్దు చేయండి',
    'common.delete': 'తొలగించండి',
    'common.edit': 'సవరించండి',
    'common.view': 'చూడండి',
    'common.success': 'విజయం',
    'common.error': 'లోపం',
    'common.warning': 'హెచ్చరిక',
    'common.info': 'సమాచారం',
    'common.signOut': 'సైన్ అవుట్',
    'common.search': 'వెతకండి',
    'common.filter': 'ఫిల్టర్',
    'common.clear': 'క్లియర్ చేయండి',
    'common.close': 'మూసివేయండి',
    'common.back': 'వెనుకకు',
    'common.next': 'తదుపరి',
    'common.previous': 'మునుపటి',
    'common.submit': 'సమర్పించండి',
    'common.reset': 'రీసెట్',
    'common.refresh': 'రిఫ్రెష్'
  },
  
  ta: {
    // Navigation
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.map': 'ஊடாடும் வரைபடம்',
    'nav.reports': 'குடிமக்கள் அறிக்கைகள்',
    'nav.reportForm': 'ஆபத்தை அறிவிக்கவும்',
    'nav.reportsMap': 'அறிக்கைகள் வரைபடம்',
    'nav.alerts': 'எச்சரிக்கை நிர்வாகம்',
    'nav.validation': 'சரிபார்ப்பு வரிசை',
    'nav.predictions': 'AI கணிப்புகள்',
    'nav.social': 'சமூக கண்காணிப்பு',
    'nav.resources': 'அவசர வளங்கள்',
    'nav.settings': 'அமைப்புகள்',
    
    // Settings
    'settings.title': 'அமைப்புகள்',
    'settings.userProfile': 'பயனர் சுயவிவரம்',
    'settings.security': 'பாதுகாப்பு',
    'settings.notifications': 'அறிவிப்புகள்',
    'settings.appearance': 'தோற்றம்',
    'settings.account': 'கணக்கு',
    'settings.fullName': 'முழு பெயர்',
    'settings.email': 'மின்னஞ்சல் முகவரி',
    'settings.phone': 'தொலைபேசி எண்',
    'settings.organization': 'அமைப்பு',
    'settings.saveChanges': 'மாற்றங்களை சேமிக்கவும்',
    'settings.saving': 'சேமிக்கிறது...',
    'settings.theme': 'தீம்',
    'settings.language': 'மொழி',
    'settings.light': 'வெளிச்சம்',
    'settings.dark': 'இருட்டு',
    'settings.profilePicture': 'சுயவிவர படம்',
    'settings.uploadPhoto': 'புகைப்படம் பதிவேற்றவும்',
    'settings.removePhoto': 'அகற்று',
    'settings.photoRecommendation': 'பரிந்துரை: சதுர படம், அதிகபட்சம் 5MB',
    
    // Common
    'common.loading': 'ஏற்றுகிறது...',
    'common.save': 'சேமிக்கவும்',
    'common.cancel': 'ரத்து செய்',
    'common.delete': 'நீக்கு',
    'common.edit': 'திருத்து',
    'common.view': 'பார்',
    'common.success': 'வெற்றி',
    'common.error': 'பிழை',
    'common.warning': 'எச்சரிக்கை',
    'common.info': 'தகவல்',
    'common.signOut': 'வெளியேறு',
    'common.search': 'தேடு',
    'common.filter': 'வடிகட்டி',
    'common.clear': 'அழிக்கு',
    'common.close': 'மூடு',
    'common.back': 'பின்',
    'common.next': 'அடுத்து',
    'common.previous': 'முந்தைய',
    'common.submit': 'சமர்ப்பிக்கவும்',
    'common.reset': 'மீட்டமை',
    'common.refresh': 'புதுப்பிக்கவும்'
  }
  
  // More languages can be added here...
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [localLanguage, setLocalLanguage] = useState('en');
  
  // Try to get settings from SettingsProvider, but handle case where it's not available
  let settingsContext;
  try {
    settingsContext = useSettings();
  } catch {
    // SettingsProvider not available, use local state
    settingsContext = null;
  }

  // Use settings context language if available, otherwise use local state
  const language = settingsContext?.previewSettings.language || localLanguage;

  // Force re-render when settings context language changes
  useEffect(() => {
    if (settingsContext?.previewSettings.language && settingsContext.previewSettings.language !== localLanguage) {
      setLocalLanguage(settingsContext.previewSettings.language);
    }
  }, [settingsContext?.previewSettings.language, localLanguage]);

  // Load language from localStorage on mount (fallback when no settings context)
  useEffect(() => {
    if (!settingsContext) {
      const savedLanguage = localStorage.getItem('coastalytics_language') || 'en';
      setLocalLanguage(savedLanguage);
    }
  }, [settingsContext]);

  const setLanguage = (lang: string) => {
    if (settingsContext) {
      // Use settings context if available - this will update preview settings
      settingsContext.setPreviewSetting('language', lang);
    } else {
      // Fallback to local state
      setLocalLanguage(lang);
      localStorage.setItem('coastalytics_language', lang);
    }
  };

  const t = (key: string): string => {
    const languageTranslations = translations[language] || translations['en'];
    return languageTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        availableLanguages: AVAILABLE_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
