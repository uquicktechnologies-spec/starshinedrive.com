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
        name: "NMRV Special Input Configuration",
        features: ["Special Input Arrangement", "Compact Right-Angle Drive", "Drawing Confirmation Required"],
      },
      {
        name: "NRV Shaft-Input Worm Reducer",
        features: ["Shaft Input Design", "Flexible Motor Matching", "Compact Right-Angle Layout"],
      },
      {
        name: "NRV Special Input Configuration",
        features: ["Flexible Shaft Input", "Compact Right-Angle Drive", "Drawing Confirmation Required"],
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
        ],
      },
      {
        name: "RF Flange-Mounted Helical Reducer",
        features: [
          "Direct Flange Mounting",
          "Inline Helical Transmission",
          "Flexible Motor Options",
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
          "R Series uses an inline helical layout. F Series uses a parallel-shaft helical layout. Use R when the motor and output shaft stay in a straight transmission path. Use F when the machine layout needs a parallel shaft or side-mounted arrangement.",
      },
      {
        question: "What is the difference between R Series and K Series?",
        answer:
          "R Series is inline. K Series is right-angle helical-bevel. Use K when the machine requires 90-degree output and higher-efficiency bevel gear transmission.",
      },
      {
        question: "What is the difference between R Series and NMRV worm reducer?",
        answer:
          "R Series is an inline helical reducer. NMRV / RV is a compact right-angle worm gear reducer. Use R when the output remains inline; use NMRV when compact 90-degree worm gear reduction is required.",
      },
      {
        question: "Can R Series be supplied with a motor?",
        answer:
          "Yes. R Series can be supplied as a geared motor package. Motor options may include standard motor, brake motor, variable-frequency motor, multi-speed motor, and other confirmed motor configurations.",
      },
      {
        question: "Can R Series be used with a frequency converter?",
        answer:
          "A variable-frequency motor or inverter-compatible motor package should be reviewed when speed control is required. SV200 frequency converter and YVF motor options can be checked as part of the drive package.",
      },
      {
        question: "What information is needed before quotation?",
        answer:
          "Send motor power, input speed, required output speed, ratio, output torque, mounting form, input form, output shaft requirement, service factor, duty cycle, and working environment. For replacement, include the old nameplate and installation drawing.",
      },
      {
        question: "Can Starshine provide drawings and CAD files?",
        answer:
          "2D drawings and 3D CAD files can be requested after the reducer size, ratio, mounting form, output shaft, motor option, and installation direction are confirmed.",
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
        question: "Can F Series be used with a frequency converter?",
        answer:
          "A variable-frequency motor or inverter-compatible motor package should be reviewed when speed control is required. SV200 frequency converter and YVF motor options can be checked as part of the drive package.",
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
        question: "Can K Series be used with a frequency converter?",
        answer:
          "A variable-frequency motor or inverter-compatible motor package should be reviewed when speed control is required. SV200 frequency converter and YVF motor options can be checked as part of the drive package.",
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
    mountingVariants: [
      {
        name: "S Series Helical-Worm Reducer",
        features: [
          "Compact Right-Angle Layout",
          "Smooth Low-Speed Drive",
          "Economical Drive Solution",
        ],
      },
    ],
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
    inputTypes: ["Direct Motor Input", "Shaft Input", "Flange Input", "IEC Motor Adapter", "Right-Angle Worm Drive", "Heavy-Duty Cast Iron"],
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
        question: "Is NMRV the same as RV?",
        answer:
          "NMRV and RV are commonly used naming directions for compact worm gear reducers. NMRV / RV refers to the same compact right-angle worm reducer product family. Old references such as SNW and SVF should be checked by model and drawing before replacement.",
      },
      {
        question: "What is the ratio range of NMRV / RV worm gear reducers?",
        answer:
          "The standard ratio range is commonly listed as 7.5–100, while older material also includes 5–100. Final ratio availability should be confirmed by reducer size and datasheet.",
      },
      {
        question: "What is the difference between NMRV and NRV?",
        answer:
          "NMRV usually refers to motor-input worm reducer configurations. NRV is used when shaft input is required. The correct input form should be confirmed according to motor interface or machine-side input connection.",
      },
      {
        question: "Can NMRV / RV be used with an electric motor?",
        answer:
          "Yes. NMRV / RV can be configured with IEC motor input, compact motor input, square flange, or other supported motor interface options. Motor frame, power, voltage, speed, and flange size should be confirmed.",
      },
      {
        question: "Can NMRV / RV be used for adjustable speed?",
        answer:
          "A standalone NMRV / RV reducer is a fixed-ratio reducer. For mechanical speed adjustment, review JWB+NMRV. For electronic speed control, review SV200 with a suitable motor and reducer combination.",
      },
      {
        question: "What information is needed for replacement?",
        answer:
          "Send the existing model code, nameplate photo, ratio, output shaft diameter, flange size, mounting hole dimensions, output direction, and installation photos.",
      },
      {
        question: "Can Starshine provide CAD or drawings?",
        answer:
          "2D drawings and 3D CAD files can be requested after the model, ratio, output shaft, flange, torque arm, and mounting position are confirmed.",
      },
      {
        question: "When should SCK be considered instead of NMRV?",
        answer:
          "SCK should be reviewed when the application needs an RV-compatible right-angle reducer path with helical-hypoid transmission and higher-efficiency direction. Exact replacement should still be checked by mounting and shaft dimensions.",
      },
    ],
  },

  "compact-geared-motors": {
    inputTypes: ["Direct Motor Input", "Shaft Input", "Flange Input", "IEC Motor Adapter", "Brake Motor", "VFD Motor Option"],
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
        question: "Is NCJ the same as SNR?",
        answer:
          "NCJ and SNR are used as related compact helical gearmotor naming directions in the available product materials. NCJ should be treated as the main product name, while SNR can be retained as a related naming reference when needed for replacement or old-document communication.",
      },
      {
        question: "What is the difference between NCJF and NCJT?",
        answer:
          "NCJF is handled as a flange-mounted NCJ configuration. NCJT is handled as a foot-mounted NCJ configuration. Both belong to the NCJ compact helical gearmotor family and should be confirmed by drawing.",
      },
      {
        question: "Can NCJ be used for variable-speed operation?",
        answer:
          "Yes, NCJ can be reviewed with a wide-frequency motor and frequency control. Product data refers to 20–60 Hz full-load operation under specified operating conditions. The inverter, motor type, torque, cooling, and duty cycle should be checked together.",
      },
      {
        question: "Can NCJ be used with a servo motor?",
        answer:
          "AQA servo input is listed as an available input direction. Servo motor frame, flange size, shaft diameter, input speed, torque requirement, and control condition should be confirmed before drawing release.",
      },
      {
        question: "When should RFKS be selected instead of NCJ?",
        answer:
          "RFKS should be reviewed when the application needs a larger modular reducer platform, higher torque range, more shaft arrangement options, or inline / parallel-shaft / right-angle configurations beyond compact NCJ gearmotor coverage.",
      },
      {
        question: "When should SNKG be selected instead of NCJ?",
        answer:
          "SNKG should be reviewed when the application is ceramic glazing equipment or a ceramic line drive position requiring a dedicated bevel-helical geared motor structure.",
      },
      {
        question: "What information is needed before quotation?",
        answer:
          "Send output speed, torque, motor power, ratio, mounting form, input form, output shaft requirement, installation position, terminal box position, and working environment. For replacement, send the old model and nameplate photo.",
      },
      {
        question: "Can Starshine provide drawings and CAD files?",
        answer:
          "2D drawings and 3D CAD files can be requested after model, ratio, mounting form, motor option, shaft form, and installation position are confirmed.",
      },
    ],
  },

  "sck-helical-hypoid-gear-unit": {
    inputTypes: ["Direct Motor Input", "Flange Input", "Square Flange Input", "Right-Angle Hypoid Output", "RV-Compatible Mounting", "Multi-Position Mounting"],
    mountingVariants: [
      {
        name: "SCK75-AQA Servo-Input Gear Unit",
        features: [
          "Servo Motor Connection",
          "Efficient Hypoid Transmission",
          "Compact Right-Angle Layout",
        ],
      },
      {
        name: "SCK Round-Flange Configuration",
        features: [
          "Direct Flange Mounting",
          "Compact Machine Interface",
          "Flexible Mounting Positions",
        ],
      },
      {
        name: "SCK200 Larger-Frame Configuration",
        features: [
          "Extended Frame Option",
          "Compact Right-Angle Drive",
          "Engineering Review Required",
        ],
      },
      {
        name: "SCK200-SMT Motor Configuration",
        features: [
          "Integrated Motor Package",
          "Compact Right-Angle Drive",
          "Motor Matching Required",
        ],
      },
    ],
    faqs: [
      {
        question: "Is SCK the same as an RV worm gear reducer?",
        answer:
          "No. SCK is a helical-hypoid right-angle gear unit. RV / NMRV is a worm gear reducer family. SCK is relevant when the customer wants an RV-compatible mounting direction with a helical-hypoid transmission structure.",
      },
      {
        question: "Can SCK replace an RV worm gear reducer?",
        answer:
          "SCK can be reviewed for RV replacement or upgrade projects, but replacement should be confirmed by size, ratio, shaft diameter, flange dimensions, mounting hole position, output direction, and installation drawing.",
      },
      {
        question: "What is the main advantage of SCK compared with NMRV / RV?",
        answer:
          "SCK provides a helical-hypoid transmission direction for customers who want to review higher efficiency and smoother right-angle transmission than a standard worm reducer layout. NMRV / RV remains suitable when a standard economical worm reducer is the priority.",
      },
      {
        question: "What is the difference between SCK and K Series?",
        answer:
          "SCK is a compact RV-compatible helical-hypoid gear unit for small and medium drive positions. K Series is a larger modular helical-bevel right-angle reducer for broader torque and power coverage.",
      },
      {
        question: "What is the difference between SCK and S Series?",
        answer:
          "SCK uses a helical-hypoid structure and is positioned around RV upgrade and compact right-angle transmission. S Series belongs to the RFKS family and uses a helical-worm structure.",
      },
      {
        question: "Can SCK be supplied with a motor?",
        answer:
          "Yes. SCK can be reviewed with direct AC motor input and other motor interface configurations. When supplied as a motor-reducer package, motor frame, flange, shaft, voltage, speed, terminal box position, and drawing should be confirmed.",
      },
      {
        question: "What does AQA mean on SCK configurations?",
        answer:
          "AQA should be treated as a servo adapter or flange-input direction. The exact flange dimensions, servo motor interface, input speed, and torque requirement should be confirmed by drawing.",
      },
      {
        question: "Can SCK200 or SCK200-SMT be published as fixed models?",
        answer:
          "Current reliable project data supports SCK50–90 as the confirmed SCK range. SCK200 and SCK200-SMT should remain engineering-confirmation items until factory datasheets, drawings, and motor-reducer combination data are available.",
      },
      {
        question: "Can Starshine provide drawings and CAD files?",
        answer:
          "2D drawings and 3D CAD files can be requested after the SCK size, ratio, input form, output shaft, mounting position, and motor interface are confirmed.",
      },
    ],
  },

  "sp-precision-planetary-gearbox": {
    inputTypes: ["Servo Motor Input", "Low Backlash", "Planetary Gear Stage", "High Precision Output", "Compact Inline Design", "Ratio Options"],
    mountingVariants: [],
    faqs: [
      {
        question: "Is SP Precision Planetary Gearbox the same as SPC Industrial Planetary Gearbox?",
        answer:
          "No. SP is for servo precision and low-backlash positioning. SPC is for heavy-duty industrial torque transmission.",
      },
      {
        question: "When should I choose SP instead of R Series?",
        answer:
          "Choose SP when backlash, positioning accuracy, servo matching, and repeatable motion matter. Choose R Series for standard inline industrial speed reduction.",
      },
      {
        question: "When should I choose SP instead of SWD?",
        answer:
          "Choose SP for planetary servo axes with higher rigidity and precision positioning. Choose SWD when a low-backlash right-angle worm gearbox is preferred.",
      },
      {
        question: "What does backlash mean?",
        answer:
          "Backlash is the small angular clearance inside the gearbox. Lower backlash helps improve positioning repeatability and motion accuracy.",
      },
      {
        question: "What is the difference between P0, P1, and P2?",
        answer:
          "P0 is the highest precision direction in this range. P1 is suitable for many precision servo axes. P2 is suitable for general precision motion where ultra-low backlash is not required.",
      },
      {
        question: "Can SP be used with a servo motor?",
        answer:
          "Yes. Servo motor matching should confirm flange, shaft diameter, shaft length, rated speed, rated torque, peak torque, brake, encoder, inertia, and adapter dimensions.",
      },
      {
        question: "Can SP be used with a stepper motor?",
        answer:
          "Yes, if the frame, shaft, torque, speed, and control requirements are confirmed.",
      },
      {
        question: "What information is needed before quotation?",
        answer:
          "Send servo motor brand and model, motor power, rated speed, peak torque, required ratio, backlash class, output torque, load inertia, radial load, axial load, mounting direction, output form, duty cycle, working environment, and machine drawing.",
      },
    ],
  },

  "cycloidal-gear-reducer": {
    inputTypes: ["Direct Motor Input", "Shaft Input", "Flange Input", "Cycloidal Pinwheel Structure", "Shock Load Resistance", "Large Ratio / Low Speed"],
    mountingVariants: [
      {
        name: "BWD Cycloidal Gear Reducer",
        features: [
          "Large Reduction Ratio",
          "Strong Shock Resistance",
          "Frequent Start-Stop Duty",
        ],
      },
      {
        name: "BLY1 Cycloidal Gear Reducer",
        features: [
          "Compact Coaxial Layout",
          "Large Reduction Ratio",
          "Frequent Start-Stop Duty",
        ],
      },
    ],
    faqs: [
      {
        question: "What is a cycloidal gear reducer used for?",
        answer:
          "A cycloidal gear reducer is used for industrial low-speed transmission where large reduction ratio, compact coaxial structure, shock-load resistance, frequent start-stop operation, and reversing duty are important.",
      },
      {
        question: "What is the difference between cycloidal reducer and helical reducer?",
        answer:
          "Cycloidal reducers use cycloidal pinwheel transmission and multi-tooth meshing. Helical reducers use involute helical gear stages. Cycloidal reducers are often reviewed for high-ratio, shock-load, and dynamic-duty applications, while helical reducers are often selected for efficient modular geared motor packages.",
      },
      {
        question: "What is the difference between cycloidal reducer and NMRV worm reducer?",
        answer:
          "Cycloidal reducers are coaxial reducers. NMRV / RV worm reducers are compact right-angle reducers. Use cycloidal reducers when the input and output need to stay aligned; use NMRV / RV when the machine requires 90-degree transmission.",
      },
      {
        question: "What ratio range is available?",
        answer:
          "The available product data lists single-stage ratio 1/9–1/87 and double-stage ratio 1/99–1/7569. Final ratio availability should be confirmed by model size and datasheet.",
      },
      {
        question: "Can this reducer handle frequent start-stop and reversing?",
        answer:
          "Yes, the cycloidal reducer product direction is suitable for frequent start-stop and reversing operation when the model is selected correctly for torque, service factor, duty cycle, and shock load.",
      },
      {
        question: "What mounting forms are available?",
        answer:
          "Available mounting directions include foot-mounted, flange-mounted, and vertical F-flange configurations. Final mounting dimensions and shaft direction should be confirmed by drawing.",
      },
      {
        question: "What information is needed before quotation?",
        answer:
          "Send motor power, input speed, required output speed, ratio, output torque, mounting form, input form, output shaft direction, duty cycle, starts per hour, working environment, and any existing nameplate or drawing.",
      },
      {
        question: "Can Starshine provide drawings and CAD files?",
        answer:
          "2D drawings and 3D CAD files can be requested after model, ratio, stage configuration, mounting form, output shaft direction, and input form are confirmed.",
      },
    ],
  },
};
