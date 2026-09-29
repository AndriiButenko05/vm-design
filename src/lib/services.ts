import svcFullService from '../assets/services/svc-01-full-service.jpg';
import svcDesignProject from '../assets/services/svc-02-design-project.jpg';
import svcSupervision from '../assets/services/svc-03-supervision.jpg';
import svcSelection from '../assets/services/svc-04-selection.jpg';
import svcRentalSetup from '../assets/services/svc-05-rental-setup.jpg';
import svcConsultation from '../assets/services/svc-06-consultation.jpg';
import boatWake from '../assets/services/000-fullsizerender-tall.jpg';
import monacoBay from '../assets/services/005-img-2356.jpg';

export const CONTACT_BACKDROP = {
  wide: monacoBay,
  tall: boatWake,
} as const;

export type Service = {
  slug: string;
  title: string;
  short: string;
  includes: string[];
  image: ImageMetadata;
  featured: boolean;
};

export const SERVICES: Service[] = [
  {
    slug: 'full-service',
    title: 'Full-Service Interior Architecture & Design',
    short:
      'A complete interior design service, from the initial brief and site measurements to technical design, furnishing, implementation and final styling.',
    includes: [
      'First meeting and detailed brief',
      'Site visit and measurements',
      'Measured survey drawing with notes',
      'Space planning options',
      'Design concept',
      'Stylistic direction',
      '3D visualisations',
      'Complete set of technical drawings',
      'Design of fitted and bespoke furniture',
      'Selection of materials, sanitaryware and finishes',
      'Selection of furniture, lighting, textiles and decor',
      'Work with factories and suppliers',
      'Specifications and cost requests',
      'Coordination of contractors',
      'Design supervision',
      'Final installation and styling',
    ],
    image: svcFullService,
    featured: true,
  },
  {
    slug: 'design-project',
    title: 'Interior Design Project',
    short:
      'A complete design package combining spatial planning, visual concepts, 3D visualisations and detailed technical drawings for implementation.',
    includes: [
      'Brief and analysis of requirements',
      'Measurements, or work from supplied documentation',
      'Several layout options',
      'Approved design concept',
      'Colour and stylistic scheme',
      '3D visualisations',
      'Technical drawings',
      'Lighting and electrical layouts',
      'Finishes plans',
      'Drawings for fitted furniture',
      'Preliminary selection of materials, furniture and lighting',
      'Specifications',
    ],
    image: svcDesignProject,
    featured: true,
  },
  {
    slug: 'supervision',
    title: 'Project Coordination & Design Supervision',
    short:
      'Personal design supervision and coordination to ensure that every detail of the completed interior remains faithful to the approved concept.',
    includes: [
      'Communication with the construction team',
      'Explanation of drawings and design decisions',
      'Regular site visits',
      'Checking that the work matches the design',
      'Approval of samples and paint tests',
      'Answering contractors’ questions',
      'Making the necessary design adjustments',
      'Control of finishes, materials and detailing',
      'Coordination of suppliers and furniture makers',
      'Inspection of the final result',
    ],
    image: svcSupervision,
    featured: true,
  },
  {
    slug: 'selection',
    title: 'Furniture, Lighting & Material Selection',
    short:
      'A carefully curated selection of furniture, lighting, finishes and materials, tailored to the interior, the client’s lifestyle and the project budget.',
    includes: [
      'Furniture selection',
      'Decorative and technical lighting',
      'Finishing materials',
      'Sanitaryware',
      'Textiles and rugs',
      'Art and accessories',
      'Colour and texture combinations',
      'Work with furniture factories and showrooms',
      'Requests for supplier quotations',
      'Access to trade terms and designer discounts where available',
      'Help with orders and delivery scheduling',
    ],
    image: svcSelection,
    featured: true,
  },
  {
    slug: 'rental-setup',
    title: 'Property Styling & Rental Setup',
    short:
      'Complete furnishing and styling for rental properties, combining visual appeal, comfort, durability and a carefully managed budget.',
    includes: [
      'Assessment of the existing space',
      'Defining the target tenant',
      'Furnishing plan',
      'Selection of durable, attractive materials',
      'Furniture, lighting, textiles and decor',
      'A workable furnishing budget',
      'Purchasing and delivery',
      'Final installation',
      'Preparing the interior for photography and occupancy',
    ],
    image: svcRentalSetup,
    featured: true,
  },
  {
    slug: 'consultation',
    title: 'Interior Consultation & Space Planning',
    short:
      'Professional guidance for clients who need expert advice on layout, design direction, materials or the potential of a property before beginning a complete project.',
    includes: [
      'Assessing a property before purchase',
      'Checking what can be reconfigured',
      'Improving an existing layout',
      'A professional assessment of an interior',
      'Defining the style and direction of a future project',
      'Choosing materials or furniture',
      'Understanding the likely scope of work',
    ],
    image: svcConsultation,
    featured: true,
  },
];
