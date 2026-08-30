export interface MountingVariant {
  name: string;
  features: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ProductConfig {
  plainBackground?: boolean;
  inputTypes: string[];
  mountingVariants: MountingVariant[];
  faqs: FAQ[];
  /** Per-product overrides for config icon images (keyed by inputType label) */
  inputTypeImages?: Record<string, string>;
}

export const PRODUCT_CONFIGS: Record<string, ProductConfig> = {
  "nmrv-worm-gear-reducers": {
    inputTypes: ["Direct Motor Input", "Shaft Input", "Flange Input", "IEC Motor Adapter", "Right-Angle Worm Drive", "Double-Stage Option"],
    mountingVariants: [
      {
        name: "NMRV Worm Gear Reducer",
        features: ["Compact Right-Angle Drive", "Wide Ratio Options", "Flexible Mounting Forms"],
      },
      {
        name: "Double-Stage NMRV Reducer",
        features: ["Higher Reduction Range", "Compact Two-Stage Layout", "Low-Speed Drive Applications"],
      },
      {
        name: "NRV Shaft-Input Worm Reducer",
        features: ["Shaft Input Design", "Flexible Motor Matching", "Compact Right-Angle Layout"],
      },
    ],
    faqs: [
      { question: "Is NMRV the same as RV?", answer: "NMRV and RV are commonly used naming directions for compact worm gear reducers. NMRV / RV refers to the same compact right-angle worm reducer product family. Old references such as SNW and SVF should be checked by model and drawing before replacement." },
      { question: "What is the ratio range of NMRV / RV worm gear reducers?", answer: "The standard ratio range is commonly listed as 7.5–100, while older material also includes 5–100. Final ratio availability should be confirmed by reducer size and datasheet." },
      { question: "What is the difference between NMRV and NRV?", answer: "NMRV usually refers to motor-input worm reducer configurations. NRV is used when shaft input is required. The correct input form should be confirmed according to motor interface or machine-side input connection." },
      { question: "Can NMRV / RV be used with an electric motor?", answer: "Yes. NMRV / RV can be configured with IEC motor input, compact motor input, square flange, or other supported motor interface options. Motor frame, power, voltage, speed, and flange size should be confirmed." },
      { question: "Can NMRV / RV be used for adjustable speed?", answer: "A standalone NMRV / RV reducer is a fixed-ratio reducer. For mechanical speed adjustment, review JWB+NMRV. For electronic speed control, review SV200 with a suitable motor and reducer combination." },
      { question: "What information is needed for replacement?", answer: "Send the existing model code, nameplate photo, ratio, output shaft diameter, flange size, mounting hole dimensions, output direction, and installation photos." },
      { question: "Can Starshine provide CAD or drawings?", answer: "2D drawings and 3D CAD files can be requested after the model, ratio, output shaft, flange, torque arm, and mounting position are confirmed." },
      { question: "When should SCK be considered instead of NMRV?", answer: "SCK should be reviewed when the application needs an RV-compatible right-angle reducer path with helical-hypoid transmission and higher-efficiency direction. Exact replacement should still be checked by mounting and shaft dimensions." },
    ],
  },
  "r-series-helical-gear-reducer": {
    inputTypes: ["Direct Motor Input", "Shaft Input", "Flange Input"],
    mountingVariants: [
      {
        name: "R Foot-Mounted Reducer",
        features: [
          "Inline Helical Transmission",
          "High Torque Capacity",
          "Flexible Motor Options",
          "Robust Cast Iron Housing",
        ],
      },
    ],
    faqs: [
      {
        question: "Is R Series the same as RF Series?",
        answer:
          "RF is best treated as a flange-mounted configuration under the R Series inline helical reducer direction. R is the main inline helical product, while RF is used when flange mounting is required.",
      },
      {
        question: "What is the difference between R Series and F Series?",
        answer:
          "The R Series is an inline (coaxial) helical reducer where the input and output shafts share the same axis. The F Series is a parallel-shaft helical reducer where the input and output shafts run parallel but offset, making it more compact in height for applications requiring a lower profile.",
      },
      {
        question: "What is the difference between R Series and K Series?",
        answer:
          "The R Series uses inline helical gears for high-efficiency, quiet, coaxial power transmission. The K Series is a helical-bevel gear reducer with a 90° shaft angle, suitable for applications requiring a right-angle drive with high torque density.",
      },
      {
        question: "What is the difference between R Series and NMRV worm reducer?",
        answer:
          "The R Series helical gear reducer offers significantly higher efficiency (up to 98% per stage) and handles higher power and torque ranges. NMRV worm reducers are more compact and cost-effective for lower-power, lower-speed applications but have lower efficiency due to sliding contact in the worm gear set.",
      },
      {
        question: "Can R Series be supplied with a motor?",
        answer:
          "Yes. Starshine can supply the R Series as a complete gearmotor unit with an IEC-standard electric motor (standard, brake, or VFD-rated). Motor power from 0.12 kW to 160 kW is available. Please specify the required output speed, torque, and motor voltage when enquiring.",
      },
      {
        question: "Can R Series be used with a frequency converter?",
        answer:
          "Yes. The R Series is fully compatible with variable frequency drives (VFDs/inverters). For continuous operation below 25 Hz, forced cooling or an independent fan motor is recommended to maintain adequate cooling. Please specify VFD operation when ordering so the correct motor insulation class is selected.",
      },
      {
        question: "What information is needed before quotation?",
        answer:
          "To prepare an accurate quotation, please provide: required output speed (r/min) or gear ratio, output torque (N·m) or motor power (kW), mounting position (foot, flange, or shaft-mounted), input configuration (direct motor, shaft, or flange), operating environment (temperature, humidity, duty cycle), and any special requirements such as IP rating, oil type, or output shaft dimensions.",
      },
      {
        question: "Can Starshine provide drawings and CAD files?",
        answer:
          "Yes. 2D dimensional drawings (PDF/DWG) and 3D CAD models (STEP/IGES) are available for all standard R Series sizes. Please contact our technical team with the model number and required format. Custom CAD files for modified or special units are provided after order confirmation.",
      },
    ],
  },

  "f-series-parallel-shaft-helical-gear-reducer": {
    inputTypes: ["Direct Motor Input", "Shaft Input", "Flange Input", "IEC Motor Adapter", "Brake Motor", "VFD Motor Option"],
    mountingVariants: [
      {
        name: "F Series Parallel-Shaft Helical Gear Reducer",
        features: [
          "Parallel shaft (coaxial) design for space-saving installation",
          "Up to 3 helical gear stages",
          "Solid or hollow output shaft options",
        ],
      },
    ],
    faqs: [
      {
        question: "Is FAF a separate product from F Series?",
        answer:
          "FAF is best treated as a hollow-shaft / flange-mounted configuration under the F Series parallel shaft helical reducer direction. F is the main product series; FAF is a configuration path that requires shaft and flange drawing confirmation.",
      },
      {
        question: "What is the difference between F Series and R Series?",
        answer:
          "F Series uses a parallel shaft layout. R Series uses an inline helical layout. Use F when the motor and driven shaft need to be parallel or when the machine requires a compact side-mounted drive. Use R when the drive path remains straight.",
      },
      {
        question: "What is the difference between F Series and K Series?",
        answer:
          "F Series is parallel shaft. K Series is right-angle helical-bevel. Use K when the machine needs 90-degree output and stronger right-angle transmission.",
      },
      {
        question: "What is the difference between F Series and NMRV worm reducer?",
        answer:
          "F Series is a parallel shaft helical reducer. NMRV / RV is a compact right-angle worm gear reducer. Use F for parallel-shaft side-mounted layouts, and use NMRV when compact 90-degree worm reduction is required.",
      },
      {
        question: "Can F Series be supplied with a hollow shaft?",
        answer:
          "Yes. F Series can be reviewed with hollow shaft, shrink disc, splined hollow shaft, flange, and torque arm configurations according to the selected model and drawing.",
      },
      {
        question: "Can F Series be supplied with a motor?",
        answer:
          "Yes. F Series can be supplied as a geared motor package. Motor options may include standard motor, brake motor, variable-frequency motor, multi-speed motor, and other confirmed configurations.",
      },
      {
        question: "What information is needed before quotation?",
        answer:
          "Send motor power, input speed, required output speed, ratio, output torque, mounting form, shaft form, hollow shaft bore if required, torque arm requirement, duty cycle, and working environment. For replacement, include the old nameplate and installation drawing.",
      },
      {
        question: "Can Starshine provide drawings and CAD files?",
        answer:
          "2D drawings and 3D CAD files can be requested after reducer size, ratio, mounting form, output shaft, motor option, flange requirement, and installation direction are confirmed.",
      },
    ],
  },

  "k-series-helical-bevel-gear-reducer": {
    inputTypes: ["Direct Motor Input", "Shaft Input", "Flange Input", "IEC Motor Adapter", "Brake Motor", "VFD Motor Option"],
    mountingVariants: [
      {
        name: "K Series Helical-Bevel Reducer",
        features: [
          "Efficient Right-Angle Drive",
          "High Torque Capacity",
          "Heavy Conveyor Applications",
        ],
      },
    ],
    faqs: [
      {
        question: "Is KF a separate product from K Series?",
        answer:
          "KF is best treated as a flange-mounted or mounting-variant configuration under the K Series helical-bevel reducer direction. K is the main product series; KF is a configuration path that requires flange and mounting drawing confirmation.",
      },
      {
        question: "What is the difference between K Series and R Series?",
        answer:
          "K Series uses a right-angle helical-bevel layout. R Series uses an inline helical layout. Use K when the motor and driven shaft need a 90-degree arrangement. Use R when the drive path remains straight.",
      },
      {
        question: "What is the difference between K Series and F Series?",
        answer:
          "K Series is right-angle helical-bevel. F Series is parallel shaft helical. Use K when the machine needs 90-degree output. Use F when the motor and driven shaft need to stay parallel.",
      },
      {
        question: "What is the difference between K Series and S Series?",
        answer:
          "K Series uses helical-bevel transmission and is better suited for higher-efficiency and stronger right-angle drive requirements. S Series uses helical-worm transmission and is more compact and economical for some lower-torque right-angle applications.",
      },
      {
        question: "What is the difference between K Series and NMRV worm reducer?",
        answer:
          "K Series is a modular helical-bevel right-angle reducer with stronger torque and efficiency direction. NMRV / RV is a compact worm gear reducer for cost-sensitive small and medium right-angle drive positions.",
      },
      {
        question: "Can K Series be supplied with a hollow shaft?",
        answer:
          "Yes. K Series can be reviewed with hollow shaft, shrink disc, splined hollow shaft, flange, and torque arm configurations according to the selected model and drawing.",
      },
      {
        question: "Can K Series be supplied with a motor?",
        answer:
          "Yes. K Series can be supplied as a geared motor package. Motor options may include standard motor, brake motor, variable-frequency motor, multi-speed motor, and other confirmed configurations.",
      },
      {
        question: "What information is needed before quotation?",
        answer:
          "Send motor power, input speed, required output speed, ratio, output torque, mounting form, shaft form, hollow shaft bore if required, torque arm requirement, duty cycle, and working environment. For replacement, include the old nameplate and installation drawing.",
      },
      {
        question: "Can Starshine provide drawings and CAD files?",
        answer:
          "2D drawings and 3D CAD files can be requested after reducer size, ratio, mounting form, output shaft, motor option, flange requirement, and installation direction are confirmed.",
      },
    ],
  },

  "s-series-helical-worm-gear-reducer": {
    inputTypes: ["Direct Motor Input", "Shaft Input", "Flange Input", "IEC Motor Adapter", "Brake Motor", "VFD Motor Option"],
    mountingVariants: [],
    faqs: [
      {
        question: "Is S Series the same as NMRV worm reducer?",
        answer:
          "No. S Series belongs to the R/F/K/S modular gear reducer family and uses a helical-worm structure. NMRV / RV is a compact worm gear reducer family. Both can serve right-angle layouts, but they belong to different product platforms.",
      },
      {
        question: "What is the difference between S Series and K Series?",
        answer:
          "The K Series is a helical-bevel gear reducer offering higher efficiency (up to 96%) and larger torque range than the S Series. The S Series uses a helical-worm stage which provides inherent self-locking at high ratios — a feature the K Series does not offer. Choose K Series for high power and efficiency; choose S Series when self-locking or a very high ratio is needed.",
      },
      {
        question: "What is the difference between S Series and R Series?",
        answer:
          "The R Series is an inline (coaxial) helical gear reducer with parallel input and output shafts, while the S Series provides a 90° right-angle output via its worm stage. Use R Series when input and output shafts need to be in line; use S Series when a right-angle layout and self-locking capability are required.",
      },
      {
        question: "What is the difference between S Series and F Series?",
        answer:
          "The F Series is a parallel-shaft helical reducer with offset input and output shafts on the same side, suited for compact side-mounted drives. The S Series provides a right-angle output using a helical-worm combination. Choose F Series for parallel shaft arrangements; choose S Series for right-angle drives with self-locking.",
      },
      {
        question: "Can S Series be supplied with a hollow shaft?",
        answer:
          "Yes. S Series reducers are available with hollow bore output shafts for direct shaft mounting, eliminating the need for couplings and reducing installation length. Please specify hollow shaft and bore diameter when ordering.",
      },
      {
        question: "Can S Series be supplied with a motor?",
        answer:
          "Yes. Starshine can supply the S Series as a complete geared motor unit with an IEC standard motor flange-mounted directly to the reducer. Available motor types include standard AC, brake motor, inverter-duty motor, and ATEX-rated motors. Please provide required output speed, torque, and power when inquiring.",
      },
      {
        question: "Can S Series be used with a frequency converter?",
        answer:
          "Yes. The S Series is compatible with frequency converters (VFDs). For inverter-driven applications, we recommend using an inverter-duty motor with forced cooling (separate fan) to maintain torque at low speeds. Please inform us of the speed range and duty cycle when selecting the unit.",
      },
      {
        question: "What information is needed before quotation?",
        answer:
          "To provide an accurate quotation, please supply: required output torque (N·m) or power (kW), output speed (r/min) or gear ratio, mounting position (foot, flange, or shaft mount), input type (motor direct, shaft, or IEC adapter), operating environment (temperature, humidity, hazardous area), and any special requirements such as hollow shaft, brake, or IP rating.",
      },
      {
        question: "Can Starshine provide drawings and CAD files?",
        answer:
          "Yes. Starshine can provide 2D dimensional drawings (PDF/DWG) and 3D CAD models (STEP/IGES) for all standard S Series frame sizes upon request. Please contact our sales team with the exact model code or specifications and we will send the files within one business day.",
      },
    ],
  },

  "rv-cast-iron-worm-gear-reducer": {
    inputTypes: ["Direct Motor Input", "Shaft Input"],
    mountingVariants: [
      {
        name: "RV Foot-Mounted",
        features: [
          "Cast Iron Housing",
          "Heavy-Duty Construction",
          "4 Standard Mounting Positions",
          "High Shock Load Resistance",
        ],
      },
      {
        name: "RV Flange-Mounted",
        features: [
          "B5 IEC Flange Available",
          "Direct Motor Connection",
          "Solid / Hollow Output Shaft",
          "Phosphor-Bronze Worm Wheel",
        ],
      },
    ],
    faqs: [
      {
        question: "What is the key advantage of cast iron over aluminum?",
        answer:
          "Cast iron provides superior strength under shock loads, better heat dissipation at high duty cycles, and longer service life compared to aluminum housings.",
      },
      {
        question: "How many mounting positions does the RV Series support?",
        answer:
          "Four standard mounting positions: B3 (foot mount), B5 (flange), B6 (wall, shaft up), and B7 (wall, shaft down).",
      },
      {
        question: "What is the worm wheel material?",
        answer:
          "Phosphor bronze (PB2 grade) worm wheel — excellent anti-galling properties and long wear life against the hardened, ground steel worm shaft.",
      },
      {
        question: "Can the RV Series be direct-coupled to a motor?",
        answer:
          "Yes. A standard IEC flanged input adapter is available for all RV frame sizes, enabling direct motor mounting without an intermediate coupling.",
      },
    ],
  },

  "compact-geared-motors": {
    inputTypes: ["Direct Drive", "Inline Configuration"],
    mountingVariants: [
      {
        name: "Inline Geared Motor",
        features: [
          "Integrated Motor + Gearbox",
          "Plug & Play Installation",
          "Compact Axial Footprint",
          "IEC Standard Motor Frame",
        ],
      },
      {
        name: "Right-Angle Geared Motor",
        features: [
          "90° Output Redirection",
          "Electromagnetic Brake Option",
          "IP54 / IP65 Protection",
          "Multiple Frame Sizes",
        ],
      },
    ],
    faqs: [
      {
        question: "What is the difference between inline and right-angle geared motors?",
        answer:
          "Inline geared motors have coaxial input/output for compact axial drives. Right-angle units redirect power 90°, ideal for space-constrained installations.",
      },
      {
        question: "Is thermal protection built in?",
        answer:
          "Yes. A PTC thermistor embedded in the motor windings will trigger a controller shutdown if the motor exceeds its thermal limit — protecting the unit from overheating.",
      },
      {
        question: "Can a brake be added?",
        answer:
          "Yes, a spring-applied electromagnetic brake is available on most frame sizes, providing parking brake and emergency stop capability without external components.",
      },
      {
        question: "What protection class is standard?",
        answer:
          "IP54 is standard. IP65 is available on request for washdown environments, outdoor use, and dusty industrial applications.",
      },
    ],
  },

  "sck-helical-hypoid-gear-unit": {
    inputTypes: ["Direct Motor Input", "Shaft Input", "Flange Input"],
    mountingVariants: [
      {
        name: "HB Foot-Mounted Unit",
        features: [
          "Hypoid Bevel Gear Stage",
          "Up to 92% Efficiency",
          "Ultra-Quiet Low Vibration",
          "Large Input Shaft Offset",
        ],
      },
      {
        name: "HB Flange-Mounted Unit",
        features: [
          "Right-Angle 90° Output",
          "IP65 Standard Protection",
          "Direct IEC Motor Mount",
          "Compact Housing Envelope",
        ],
      },
    ],
    faqs: [
      {
        question: "What is the efficiency advantage of hypoid over worm gearboxes?",
        answer:
          "Hypoid gear units achieve 88–92% efficiency vs 50–85% for worm reducers, resulting in significantly lower heat generation and reduced energy costs over time.",
      },
      {
        question: "What does 'large shaft offset' mean?",
        answer:
          "The hypoid input and output shafts do not intersect — they are offset. This allows a more compact housing and offers greater mounting flexibility vs. bevel gears.",
      },
      {
        question: "Are hypoid gears noisy?",
        answer:
          "No. The curved hypoid tooth profile provides smooth, gradual tooth engagement, resulting in very low noise and vibration — quieter than equivalent bevel or worm units.",
      },
      {
        question: "What lubrication does the hypoid unit require?",
        answer:
          "Hypoid-specific EP gear oil rated GL-5 is mandatory. Standard GL-4 or industrial gear oil is NOT suitable and will cause rapid hypoid gear wear.",
      },
    ],
  },

  "sp-precision-planetary-gearbox": {
    inputTypes: ["Servo Motor Flange", "Stepper Motor Flange", "Shaft Input"],
    mountingVariants: [
      {
        name: "PL Inline Planetary",
        features: [
          "Coaxial Input / Output",
          "Backlash < 3 arcmin (P1 Grade)",
          "Lifetime Grease Lubrication",
          "High Torsional Stiffness",
        ],
      },
      {
        name: "PL Right-Angle Planetary",
        features: [
          "Integrated Bevel Output Stage",
          "Compact Right-Angle Envelope",
          "Servo Motor Compatible",
          "Low Backlash Maintained",
        ],
      },
    ],
    faqs: [
      {
        question: "What does 'backlash < 3 arcmin' mean in practice?",
        answer:
          "The output shaft can rotate no more than 3 arc-minutes (0.05°) without input motion — critical for accurate positioning in CNC, robotics, and servo automation.",
      },
      {
        question: "How long does the lifetime lubrication last?",
        answer:
          "The grease-packed lubrication is designed for the full service life of the gearbox — typically 20,000+ hours under rated conditions — with zero maintenance required.",
      },
      {
        question: "What motor brands are compatible?",
        answer:
          "Compatible with all major servo motor brands including Siemens, Fanuc, Yaskawa, Bosch Rexroth, Beckhoff, and Mitsubishi via standard IEC/NEMA flanges. Custom adapters available.",
      },
      {
        question: "What is torsional stiffness and why does it matter?",
        answer:
          "Torsional stiffness measures resistance to twisting under load torque. High stiffness means better positioning repeatability and faster settling time in servo drive systems.",
      },
    ],
  },

  "cycloidal-gear-reducer": {
    inputTypes: ["Direct Motor Input", "Shaft Input"],
    mountingVariants: [
      {
        name: "X Series Single-Stage",
        features: [
          "Eccentric Cam Mechanism",
          "500% Shock Load Capacity",
          "Near-Zero Backlash (< 1 arcmin)",
          "High Single-Stage Ratio (6–87)",
        ],
      },
      {
        name: "X Series Double-Stage",
        features: [
          "Ultra-High Ratio up to 7,569",
          "Compact Combined Housing",
          "Continuous / Intermittent Duty",
          "Long Low-Maintenance Life",
        ],
      },
    ],
    faqs: [
      {
        question: "What is the single-stage ratio range?",
        answer:
          "A single-stage cycloidal reducer achieves ratios from 6:1 to 87:1. Double-stage units (two cycloidal sets in series) reach up to 7,569:1.",
      },
      {
        question: "How does the cycloidal reducer handle shock loads?",
        answer:
          "Multiple contact points (typically 2/3 of the pins are simultaneously engaged) distribute shock loads across the mechanism, providing up to 500% of rated torque shock capacity.",
      },
      {
        question: "Is the cycloidal reducer suitable for continuous operation?",
        answer:
          "Yes, it is rated for both continuous and intermittent duty. The rolling-contact mechanism generates far less heat than sliding-contact worm gears under sustained load.",
      },
      {
        question: "How does backlash compare to a planetary gearbox?",
        answer:
          "Cycloidal reducers typically achieve < 1 arcmin backlash — better than most standard planetary gearboxes — making them excellent for indexing and precision positioning.",
      },
    ],
  },
};
