// nigeria.ts client/src/utils/nigeria.ts
// The 36 states and the FCT, for the State dropdown at checkout and in My Account → Addresses (STEP 39).

// STEP 38 (part 1): Nigerian states

export const NIGERIAN_STATES = [
  "Abia State",
  "Adamawa State",
  "Akwa Ibom State",
  "Anambra State",
  "Bauchi State",
  "Bayelsa State",
  "Benue State",
  "Borno State",
  "Cross River State",
  "Delta State",
  "Ebonyi State",
  "Edo State",
  "Ekiti State",
  "Enugu State",
  "FCT Abuja",
  "Gombe State",
  "Imo State",
  "Jigawa State",
  "Kaduna State",
  "Kano State",
  "Katsina State",
  "Kebbi State",
  "Kogi State",
  "Kwara State",
  "Lagos State",
  "Nasarawa State",
  "Niger State",
  "Ogun State",
  "Ondo State",
  "Osun State",
  "Oyo State",
  "Plateau State",
  "Rivers State",
  "Sokoto State",
  "Taraba State",
  "Yobe State",
  "Zamfara State",
];

// Express delivery and Pay on Delivery are "Lagos Metro Only": the SAME rule as the server (isLagos, server STEP 22)
export const isLagos = (state: string) => /lagos/i.test(state);

// "+2348031234567" -> "0803 123 4567" (how people read a Nigerian number)
export const localPhone = (phone = "") => {
  const digits = phone.replace(/\D/g, "").replace(/^234/, "0");
  return digits.length === 11
    ? `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
    : phone;
};
