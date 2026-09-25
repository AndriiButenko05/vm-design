const FORMSPREE_ID = String(import.meta.env.PUBLIC_FORMSPREE_ID ?? '').trim();

if (import.meta.env.PROD && !FORMSPREE_ID) {
  console.warn(
    '[contact] PUBLIC_FORMSPREE_ID не задано — форма зібрана, але листів не надсилатиме.',
  );
}

export const SITE = {
  name: 'VM Design',
  designer: 'Maryna Vashchenko',
  role: 'Architect & interior designer',

  email: 'vmdesignproject@gmail.com',

  phone: '+39 329 5559043',
  phoneHref: 'tel:+393295559043',

  instagram: '@vm_design__studio',
  instagramUrl: 'https://www.instagram.com/vm_design__studio/',

  regions: ['French Riviera', 'Monaco', 'Italy'],

  facts: {
    experienceYears: 15,
    based: 'Nice, France',
    languages: ['English', 'French', 'Italian', 'Ukrainian', 'Russian'],
    internationalExperience: [
      'France',
      'Italy',
      'Monaco',
      'Germany',
      'Poland',
      'Ukraine',
      'United States',
      'Hong Kong',
    ],
  },

  formspreeId: FORMSPREE_ID,
  get formAction() {
    return this.formspreeId ? `https://formspree.io/f/${this.formspreeId}` : '';
  },
} as const;
