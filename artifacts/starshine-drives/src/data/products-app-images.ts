/* Real application photos keyed by product slug */

/* ── S Series ─────────────────────────────────────────────── */
import imgSGlass    from "@assets/R-Series-Helical-Gear-Reducer-For-Glass-Sheet-Roller-Tables_1785672843048.webp";
import imgBottling  from "@assets/S-Series-Helical-Worm-Gear-Reducer-For-Bottling-Conveyor-Sect_1785672843049.webp";
import imgSCeramic  from "@assets/S-Series-Helical-Worm-Gear-Reducer-For-Ceramic-Tile-Glazing-a_1785672843050.webp";
import imgSBelt     from "@assets/S-Series-Helical-Worm-Gear-Reducer-For-Light-Belt-Conveyor-Sy_1785672843051.webp";
import imgSRoller   from "@assets/S-Series-Helical-Worm-Gear-Reducer-For-Light-Roller-Conveyor-_1785672843051.webp";
import imgSPacking  from "@assets/S-Series-Helical-Worm-Gear-Reducer-For-Packaging-Transfer-Con_1785672843052.webp";
import imgSScrew    from "@assets/S-Series-Helical-Worm-Gear-Reducer-For-Small-Screw-Feeders_1785672843052.webp";
import imgSWood     from "@assets/S-Series-Helical-Worm-Gear-Reducer-For-Woodworking-Panel-Feed_1785672843053.webp";

/* ── K Series ─────────────────────────────────────────────── */
import imgKBottling  from "@assets/K-Series-Helical-Bevel-Gear-Reducer-For-Bottling-and-Filling-_1785681872947.webp";
import imgKCeramic   from "@assets/K-Series-Helical-Bevel-Gear-Reducer-For-Ceramic-Tile-Roller-C_1785681872947.webp";
import imgKGlass     from "@assets/K-Series-Helical-Bevel-Gear-Reducer-For-Glass-Sheet-Transfer-_1785681872947.webp";
import imgKPacking   from "@assets/K-Series-Helical-Bevel-Gear-Reducer-For-Packaging-Conveyor-Li_1785681872948.webp";
import imgKPallet    from "@assets/K-Series-Helical-Bevel-Gear-Reducer-For-Pallet-Roller-Conveyo_1785681872948.webp";
import imgKRightAngle from "@assets/K-Series-Helical-Bevel-Gear-Reducer-For-Right-Angle-Conveyor-_1785681872949.webp";
import imgKLift      from "@assets/K-Series-Helical-Bevel-Gear-Reducer-For-Vertical-Lift-Transfe_1785681872949.webp";
import imgKWood      from "@assets/K-Series-Helical-Bevel-Gear-Reducer-For-Woodworking-Panel-Fee_1785681872949.webp";

/* ── F Series ─────────────────────────────────────────────── */
import imgFBelt     from "@assets/F-Series-Parallel-Shaft-Helical-Gear-Reducer-For-Belt-Conveyo_1785681189084.webp";
import imgFBottling from "@assets/F-Series-Parallel-Shaft-Helical-Gear-Reducer-For-Bottling-and_1785681189085.webp";
import imgFCeramic  from "@assets/F-Series-Parallel-Shaft-Helical-Gear-Reducer-For-Ceramic-Tile_1785681189085.webp";
import imgFChain    from "@assets/F-Series-Parallel-Shaft-Helical-Gear-Reducer-For-Chain-Convey_1785681189086.webp";
import imgFGlass    from "@assets/F-Series-Parallel-Shaft-Helical-Gear-Reducer-For-Glass-Sheet-_1785681189086.webp";
import imgFPacking  from "@assets/F-Series-Parallel-Shaft-Helical-Gear-Reducer-For-Packaging-Co_1785681189086.webp";
import imgFPallet   from "@assets/F-Series-Parallel-Shaft-Helical-Gear-Reducer-For-Pallet-Rolle_1785681189086.webp";
import imgFScrew    from "@assets/F-Series-Parallel-Shaft-Helical-Gear-Reducer-For-Screw-Convey_1785681189087.webp";

/* ── R Series ─────────────────────────────────────────────── */
import imgRBelt     from "@assets/R-Series-Helical-Gear-Reducer-For-Belt-Conveyor-Systems_1785678165007.webp";
import imgRCeramic  from "@assets/R-Series-Helical-Gear-Reducer-For-Ceramic-Kiln-Roller-Conveyo_1785678165007.webp";
import imgRFood     from "@assets/R-Series-Helical-Gear-Reducer-For-Food-and-Beverage-Transfer-_1785678165008.webp";
import imgRGlass    from "@assets/R-Series-Helical-Gear-Reducer-For-Glass-Sheet-Roller-Tables_1785678165008.webp";
import imgRMixer    from "@assets/R-Series-Helical-Gear-Reducer-For-Industrial-Mixers-and-Proce_1785678165009.webp";
import imgRPacking  from "@assets/R-Series-Helical-Gear-Reducer-For-Packaging-Conveyor-Modules_1785678165009.webp";
import imgRRoller   from "@assets/R-Series-Helical-Gear-Reducer-For-Roller-Conveyor-Lines_1785678165009.webp";
import imgRWood     from "@assets/R-Series-Helical-Gear-Reducer-For-Woodworking-Panel-Feed-Line_1785678165010.webp";

export type AppSlide = { img: string; label: string };

export const PRODUCT_APP_IMAGES: Record<string, AppSlide[]> = {
  "k-series-helical-bevel-gear-reducer": [
    { img: imgKRightAngle, label: "Right-Angle Conveyor Transfer Systems" },
    { img: imgKPacking,    label: "Packaging Conveyor Lines" },
    { img: imgKBottling,   label: "Bottling and Filling Lines" },
    { img: imgKCeramic,    label: "Ceramic Tile Roller Conveyor" },
    { img: imgKGlass,      label: "Glass Sheet Transfer Lines" },
    { img: imgKPallet,     label: "Pallet Roller Conveyor" },
    { img: imgKLift,       label: "Vertical Lift Transfer Units" },
    { img: imgKWood,       label: "Woodworking Panel Feed Lines" },
  ],
  "f-series-parallel-shaft-helical-gear-reducer": [
    { img: imgFPacking,  label: "Packaging Conveyor Lines" },
    { img: imgFBelt,     label: "Belt Conveyor Systems" },
    { img: imgFChain,    label: "Chain Conveyor Systems" },
    { img: imgFPallet,   label: "Pallet Roller Conveyor" },
    { img: imgFScrew,    label: "Screw Conveyor Systems" },
    { img: imgFBottling, label: "Bottling and Filling Lines" },
    { img: imgFCeramic,  label: "Ceramic Tile Production Lines" },
    { img: imgFGlass,    label: "Glass Sheet Lines" },
  ],
  "r-series-helical-gear-reducer": [
    { img: imgRBelt,    label: "Belt Conveyor Systems" },
    { img: imgRCeramic, label: "Ceramic Kiln Roller Conveyor" },
    { img: imgRFood,    label: "Food & Beverage Transfer" },
    { img: imgRGlass,   label: "Glass Sheet Roller Tables" },
    { img: imgRMixer,   label: "Industrial Mixers & Process" },
    { img: imgRPacking, label: "Packaging Conveyor Modules" },
    { img: imgRRoller,  label: "Roller Conveyor Lines" },
    { img: imgRWood,    label: "Woodworking Panel Feed Line" },
  ],
  "s-series-helical-worm-gear-reducer": [
    { img: imgSRoller,   label: "Light Roller Conveyor Modules" },
    { img: imgSPacking,  label: "Packaging Transfer Conveyors" },
    { img: imgSScrew,    label: "Small Screw Feeders" },
    { img: imgBottling,  label: "Bottling Conveyor Section" },
    { img: imgSBelt,     label: "Light Belt Conveyor Systems" },
    { img: imgSCeramic,  label: "Ceramic Tile Glazing" },
    { img: imgSWood,     label: "Woodworking Panel Feed" },
    { img: imgSGlass,    label: "Glass Sheet Roller Tables" },
  ],
};
