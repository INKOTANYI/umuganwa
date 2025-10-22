import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const dictionaries = {
  en: {
    brand: { name: 'Ishakiro Job Solution' },
    nav: { dashboard: 'Dashboard', profile: 'Profile', browse: 'Browse Jobs', applications: 'My Applications' },
    footer: { privacy: 'Privacy', terms: 'Terms', contact: 'Contact' },
    notifications: {
      title: 'Notifications',
      button: 'Your notifications',
      mark_all: 'Mark all read',
      empty: 'No notifications',
      description: 'Updates about your applications and job matches.',
    },
    support: { get_support: 'Get support' },
    profile: {
      complete_title: 'Complete your profile',
      identity_title: 'Identity & Contact',
      personal_title: 'Personal & Education',
      personal_hint: 'Give us a brief overview and education background to match you to better jobs.',
      location_title: 'Location',
      location_hint: 'Choose where you live and the department you belong to.',
      documents_title: 'Documents',
      documents_hint: 'Upload clear files (max 5MB each). Accepted: PDF, DOC, DOCX, JPG, PNG.',
      first_name: 'First name',
      last_name: 'Last name',
      email: 'Email',
      phone: 'Phone',
      dob: 'Date of birth',
      gender: 'Gender',
      male: 'Male', female: 'Female', other: 'Other',
      education_level: 'Education level',
      department: 'Department',
      graduation_date: 'Graduation date',
      experience_years: 'Experience (years)',
      languages: 'Languages',
      short_bio: 'Short bio',
      province: 'Province',
      district: 'District',
      sector: 'Sector',
      save: 'Save profile',
      edit: 'Edit', lock: 'Lock',
    },
    dashboard: {
      completion_title: 'Profile completion',
      completion_button_view: 'View Profile',
      completion_button_complete: 'Complete Profile',
      completion_button_register: 'Complete Registration',
      completion_button_continue: 'Continue Profile',
      completion_button_update: 'Update Profile',
      cards: {
        profile: { title: 'Profile', desc: 'Update your personal information and security.' },
        browse: { title: 'Browse Jobs', desc: 'Explore open positions and apply quickly.' },
        applications: { title: 'My Applications', desc: 'Track the status of your job applications.' },
        post: { title: 'Post a Job', desc: 'Create a new job posting (coming soon).' },
      },
      support: {
        title: 'Contact Support',
        full_name: 'Full name',
        email: 'Email',
        phone: 'Phone',
        subject_optional: 'Subject (optional)',
        describe: 'Describe your issue',
        attachments_optional: 'Attachments (optional)',
        cancel: 'Cancel',
        send: 'Send',
      },
    },
  },
  fr: {
    brand: { name: 'Ishakiro Job Solution' },
    nav: { dashboard: 'Tableau de bord', profile: 'Profil', browse: 'Parcourir les offres', applications: 'Mes candidatures' },
    footer: { privacy: 'Confidentialité', terms: 'Conditions', contact: 'Contact' },
    notifications: {
      title: 'Notifications',
      button: 'Vos notifications',
      mark_all: 'Tout marquer comme lu',
      empty: 'Aucune notification',
      description: 'Mises à jour sur vos candidatures et offres correspondant à votre profil.',
    },
    support: { get_support: 'Obtenir de l\'aide' },
    profile: {
      complete_title: 'Complétez votre profil',
      identity_title: 'Identité et contact',
      personal_title: 'Personnel et éducation',
      personal_hint: "Donnez un bref aperçu et votre parcours d'éducation pour mieux vous proposer des emplois.",
      location_title: 'Localisation',
      location_hint: 'Choisissez où vous habitez et votre département.',
      documents_title: 'Documents',
      documents_hint: 'Téléchargez des fichiers clairs (max 5 Mo). Acceptés: PDF, DOC, DOCX, JPG, PNG.',
      first_name: 'Prénom',
      last_name: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      dob: 'Date de naissance',
      gender: 'Genre',
      male: 'Homme', female: 'Femme', other: 'Autre',
      education_level: "Niveau d'éducation",
      department: 'Département',
      graduation_date: 'Date de diplomation',
      experience_years: 'Expérience (années)',
      languages: 'Langues',
      short_bio: 'Courte bio',
      province: 'Province',
      district: 'District',
      sector: 'Secteur',
      save: 'Enregistrer le profil',
      edit: 'Modifier', lock: 'Verrouiller',
    },
    dashboard: {
      completion_title: 'Achèvement du profil',
      completion_button_view: 'Voir le profil',
      completion_button_complete: 'Compléter le profil',
      completion_button_register: 'Compléter l’inscription',
      completion_button_continue: 'Continuer le profil',
      completion_button_update: 'Mettre à jour le profil',
      cards: {
        profile: { title: 'Profil', desc: 'Mettez à jour vos informations personnelles et la sécurité.' },
        browse: { title: 'Parcourir les offres', desc: 'Explorez les postes et postulez rapidement.' },
        applications: { title: 'Mes candidatures', desc: 'Suivez l’état de vos candidatures.' },
        post: { title: 'Publier une offre', desc: 'Créer une nouvelle offre (bientôt).' },
      },
      support: {
        title: 'Contacter le support',
        full_name: 'Nom complet',
        email: 'Email',
        phone: 'Téléphone',
        subject_optional: 'Sujet (optionnel)',
        describe: 'Décrivez votre problème',
        attachments_optional: 'Pièces jointes (optionnel)',
        cancel: 'Annuler',
        send: 'Envoyer',
      },
    },
  },
  rw: {
    brand: { name: 'Ishakiro Job Solution' },
    nav: { dashboard: 'Dashibora', profile: 'Umwirondoro', browse: 'Shakisha Imirimo', applications: 'Amasabano Yanjye' },
    footer: { privacy: 'Ubujyanama bw’ibanga', terms: 'Amasezerano', contact: 'Twandikire' },
    notifications: {
      title: 'Amatangazo',
      button: 'Amatangazo yawe',
      mark_all: 'Mereke byose ko byasomwe',
      empty: 'Nta tangazo',
      description: 'Amakuru mashya ku masaba yawe n’imirimo ihuye n’umwirondoro.',
    },
    support: { get_support: 'Bona ubufasha' },
    profile: {
      complete_title: 'Zuza umwirondoro wawe',
      identity_title: 'Amakuru yawe n’itumanaho',
      personal_title: 'Umwirondoro n’amashuri',
      personal_hint: 'Tugezeho ishusho rusange n’amateka y’amashuri kugira ngo tubone imirimo ibakwiye.',
      location_title: 'Aho utuye',
      location_hint: 'Hitamo aho utuye n’ishami ujyamo.',
      documents_title: 'Inyandiko',
      documents_hint: 'Ohereza dosiye zisomeka (kinini 5MB). Zemerewe: PDF, DOC, DOCX, JPG, PNG.',
      first_name: 'Izina ribanza',
      last_name: 'Izina rikurikira',
      email: 'Imeyili',
      phone: 'Telefone',
      dob: 'Itariki y’amavuko',
      gender: 'Igitsina',
      male: 'Gabo', female: 'Gore', other: 'Ikindi',
      education_level: 'Urwego rw’amashuri',
      department: 'Ishami',
      graduation_date: 'Itariki warangije',
      experience_years: 'Uburambe (imyaka)',
      languages: 'Indimi',
      short_bio: 'Ibisobanuro bigufi',
      province: 'Intara',
      district: 'Akarere',
      sector: 'Umurenge',
      save: 'Bika umwirondoro',
      edit: 'Hindura', lock: 'Funga',
    },
    dashboard: {
      completion_title: 'Uzuza umwirondoro',
      completion_button_view: 'Reba Umwirondoro',
      completion_button_complete: 'Zuza Umwirondoro',
      completion_button_register: 'Rangiza kwiyandikisha',
      completion_button_continue: 'Komeza umwirondoro',
      completion_button_update: 'Hindura umwirondoro',
      cards: {
        profile: { title: 'Umwirondoro', desc: 'Hindura amakuru yawe n’umutekano.' },
        browse: { title: 'Shakisha Imirimo', desc: 'Reba akazi kariho maze usabe vuba.' },
        applications: { title: 'Amasabano Yanjye', desc: 'Kurikira uko ubusabe bwawe buhagaze.' },
        post: { title: 'Tangaza Akazi', desc: 'Kora itangazo rishya (vuba).' },
      },
    },
  },
};

const I18nContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved && dictionaries[saved]) setLang(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('lang', lang); } catch {}
  }, [lang]);

  const t = useMemo(() => {
    const dict = dictionaries[lang] || dictionaries.en;
    return (key, fallback) => {
      const parts = (key || '').split('.');
      let cur = dict;
      for (const p of parts) {
        if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
        else return fallback ?? key;
      }
      return typeof cur === 'string' ? cur : fallback ?? key;
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
