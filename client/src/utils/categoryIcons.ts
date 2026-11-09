// categoryIcons
// The server stores each category's icon as a Material icon name (e.g "devices")
// This list turns that name into the matching react-icons component.
// Use it like: const Icon = categoryIcons[category.icon] ?? DefaultCategoryIcon

import type { IconType } from "react-icons";
import {
  MdOutlineCategory,
  MdOutlineChair,
  MdOutlineCheckroom,
  MdOutlineDesk,
  MdOutlineDevices,
  MdOutlineFitnessCenter,
  MdOutlineMenuBook,
  MdOutlineSoupKitchen,
  MdOutlineSpa,
} from "react-icons/md";

export const categoryIcons: Record<string, IconType> = {
  devices: MdOutlineDevices,
  checkroom: MdOutlineCheckroom,
  chair: MdOutlineChair,
  spa: MdOutlineSpa,
  fitness_center: MdOutlineFitnessCenter,
  menu_book: MdOutlineMenuBook,
  desk: MdOutlineDesk,
  soup_kitchen: MdOutlineSoupKitchen,
  category: MdOutlineCategory,
};

// A general icon for any name that is not in the list
export const DefaultCategoryIcon = MdOutlineCategory;

// Order item only keep the category's name (e.g "Home & Living"), so this finds the icon by name
const iconNameByCategory: Record<string, string> = {
  Electronics: "devices",
  Fashion: "checkroom",
  "Home & Living": "chair",
  Beauty: "spa",
  Sports: "Fitness_center",
  Books: "menu_book",
  Office: "desk",
  Kitchen: "soup_kitchen",
};

export function getCategoryIconByName(name = ""): IconType {
  return categoryIcons[iconNameByCategory[name]] ?? DefaultCategoryIcon;
}
