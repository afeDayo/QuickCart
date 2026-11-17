// highlightIcons.ts client/src/utils/highlightIcons.ts
// The 3 feature cards on a product page ("Hybrid Active Noise Cancelling"...) each have a Material icon name from the
// server (products.ts, server STEP 10). This turns those names into icons, like categoryIcons.ts does for categories.

// STEP 35 (part 2): Highlight icons

import type { IconType } from "react-icons";
import {
  MdAir,
  MdBackpack,
  MdBatteryChargingFull,
  MdBluetooth,
  MdBolt,
  MdCable,
  MdChair,
  MdCheckroom,
  MdCoffee,
  MdDevices,
  MdEco,
  MdEdit,
  MdFavoriteBorder,
  MdFitnessCenter,
  MdGraphicEq,
  MdHearing,
  MdKeyboard,
  MdLightMode,
  MdLocalFireDepartment,
  MdMenuBook,
  MdOutlineVerified,
  MdPalette,
  MdRecycling,
  MdSelfImprovement,
  MdShield,
  MdSoupKitchen,
  MdSpa,
  MdStraighten,
  MdThermostat,
  MdTimer,
  MdVerified,
  MdWatch,
  MdWaterDrop,
  MdWorkspacePremium,
} from "react-icons/md";

const highlightIcons: Record<string, IconType> = {
  air: MdAir,
  backpack: MdBackpack,
  battery_charging_full: MdBatteryChargingFull,
  bluetooth: MdBluetooth,
  bolt: MdBolt,
  cable: MdCable,
  chair: MdChair,
  checkroom: MdCheckroom,
  coffee: MdCoffee,
  devices: MdDevices,
  eco: MdEco,
  edit: MdEdit,
  favorite: MdFavoriteBorder,
  fitness_center: MdFitnessCenter,
  graphic_eq: MdGraphicEq,
  hearing: MdHearing,
  keyboard: MdKeyboard,
  light_mode: MdLightMode,
  local_fire_department: MdLocalFireDepartment,
  menu_book: MdMenuBook,
  palette: MdPalette,
  recycling: MdRecycling,
  self_improvement: MdSelfImprovement,
  shield: MdShield,
  soup_kitchen: MdSoupKitchen,
  spa: MdSpa,
  straighten: MdStraighten,
  thermostat: MdThermostat,
  timer: MdTimer,
  verified: MdVerified,
  watch: MdWatch,
  water_drop: MdWaterDrop,
  workspace_premium: MdWorkspacePremium,
};

// A name we don't know (e.g. a new product from the admin, STEP 42) gets a tick
export const getHighlightIcon = (name: string): IconType =>
  highlightIcons[name] ?? MdOutlineVerified;
