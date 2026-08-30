import type { ImageSourcePropType } from 'react-native';

export interface Industry {
  id: string;
  name: string;
  description: string;
  image: ImageSourcePropType;
}

/**
 * The mobile industry guide uses the same 12 application areas as the
 * Starshine Drive marketing site. Keeping the copy here makes the screen
 * usable offline and keeps the cards fast to render.
 */
export const INDUSTRIES: Industry[] = [
  {
    id: 'textile',
    name: 'Textile Machinery',
    description:
      'Keep spinning, weaving, winding, and finishing machinery running smoothly with quiet, compact drives selected around your speed and torque needs.',
    image: require('../assets/images/industries/textile.jpg'),
  },
  {
    id: 'food',
    name: 'Food Processing',
    description:
      'Keep filling, bottling, mixing, and transfer lines moving with efficient drives selected for continuous production and easy maintenance.',
    image: require('../assets/images/industries/food.jpg'),
  },
  {
    id: 'packaging',
    name: 'Packaging Lines',
    description:
      'Support form-fill-seal, cartoning, labelling, wrapping, and palletising machinery with compact drives that keep each motion repeatable.',
    image: require('../assets/images/industries/packaging.jpg'),
  },
  {
    id: 'glass',
    name: 'Glass Equipment',
    description:
      'Power glass forming, handling, inspection, and finishing equipment with dependable gearboxes built for accurate, continuous motion.',
    image: require('../assets/images/industries/glass.jpg'),
  },
  {
    id: 'crane',
    name: 'Crane Industry',
    description:
      'Move and position heavy loads with robust drive systems selected for lifting, traversing, hoisting, and demanding duty cycles.',
    image: require('../assets/images/industries/crane.jpg'),
  },
  {
    id: 'mining',
    name: 'Mining Industry',
    description:
      'Power crushers, feeders, conveyors, and bulk-handling equipment with reducers matched to shock loads, long runtimes, and harsh plant conditions.',
    image: require('../assets/images/industries/mining.jpg'),
  },
  {
    id: 'steel',
    name: 'Steel & Metallurgy',
    description:
      'Keep roller tables, coil handling, cooling beds, and transfer systems under control with drives engineered for high torque and demanding plant cycles.',
    image: require('../assets/images/industries/steel.jpg'),
  },
  {
    id: 'chemical',
    name: 'Chemical Plant',
    description:
      'Choose reliable, controllable drives for mixers, pumps, agitators, and process equipment operating through demanding production conditions.',
    image: require('../assets/images/industries/chemical.jpg'),
  },
  {
    id: 'water',
    name: 'Water Treatment',
    description:
      'Select dependable drive systems for pumps, aerators, clarifiers, sludge scrapers, and equipment that must run reliably around the clock.',
    image: require('../assets/images/industries/water.jpg'),
  },
  {
    id: 'conveyor',
    name: 'Conveyor Systems',
    description:
      'Keep material handling lines moving with efficient geared drives matched to belt speed, load, starts, stops, and available installation space.',
    image: require('../assets/images/industries/conveyor.jpg'),
  },
  {
    id: 'cement',
    name: 'Cement Industry',
    description:
      'Handle crushers, mills, feeders, and conveyors with high-torque gear solutions designed for dusty, heavy-duty production environments.',
    image: require('../assets/images/industries/cement.jpg'),
  },
  {
    id: 'port',
    name: 'Port & Logistics',
    description:
      'Support cranes, conveyors, stackers, and cargo-handling equipment with dependable drives selected for high availability and precise movement.',
    image: require('../assets/images/industries/port.jpg'),
  },
];