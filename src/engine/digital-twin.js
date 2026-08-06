export function buildRestaurantGraph({ menuItems = 46, ingredients = 128, suppliers = 7, employees = 31, equipment = 24 }) {
  const relationships = menuItems * 4.2 + ingredients * 1.4 + suppliers * 6 + employees * 2.5 + equipment * 3;
  return {
    entities: menuItems + ingredients + suppliers + employees + equipment,
    relationships: Math.round(relationships),
    confidence: 82,
    coverage: {
      menuRecipes: 91,
      ingredientMappings: 84,
      supplierMappings: 96,
      laborSkills: 73,
      equipmentDependencies: 69,
    },
    nextVerification: [
      "Confirm portion size for Wisconsin burger sauce",
      "Verify two supplier aliases for boneless chicken",
      "Map fryer certification for three employees",
    ],
  };
}
