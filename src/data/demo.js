export const restaurant = {
  id: "fox-river-kitchen",
  name: "Fox River Kitchen",
  city: "Menasha",
  region: "WI",
  timezone: "America/Chicago",
  concept: "Wisconsin neighborhood grill",
  seats: 84,
  locations: 1,
};

export const dailyForecast = [
  { day: "Mon", revenue: 4210, margin: 28 },
  { day: "Tue", revenue: 4480, margin: 29 },
  { day: "Wed", revenue: 4760, margin: 31 },
  { day: "Thu", revenue: 5120, margin: 32 },
  { day: "Fri", revenue: 8410, margin: 35 },
  { day: "Sat", revenue: 9230, margin: 36 },
  { day: "Sun", revenue: 6170, margin: 33 },
];

export const baseActions = [
  {
    id: "reduce-chicken-order",
    category: "purchase",
    title: "Reduce tomorrow’s chicken order by one case",
    reason: "Current stock plus the scheduled delivery exceeds the seven-day demand range by 18–24 lb.",
    impact: 74,
    confidence: 91,
    risk: "Low",
    status: "pending",
    due: "Before 2:00 PM",
    icon: "package-minus",
  },
  {
    id: "curd-capacity-campaign",
    category: "growth",
    title: "Run a Sunday cheese-curd family bundle",
    reason: "Sunday 2–5 PM has unused kitchen capacity, excess curd inventory, and historically strong local attachment rates.",
    impact: 218,
    confidence: 84,
    risk: "Low",
    status: "pending",
    due: "Approve by Friday",
    icon: "megaphone",
  },
  {
    id: "shift-prep-labor",
    category: "labor",
    title: "Move two prep hours earlier on Friday",
    reason: "A nearby event is expected to shift the dinner rush forward by 45 minutes.",
    impact: 126,
    confidence: 78,
    risk: "Medium",
    status: "pending",
    due: "Before schedule publishes",
    icon: "users",
  },
];

export const ledger = [
  {
    date: "Aug 5",
    action: "Reduced Tuesday tomato prep by 12 lb",
    predicted: 38,
    realized: 34,
    result: "No stockout",
    state: "verified",
  },
  {
    date: "Aug 4",
    action: "Recovered missing produce credit",
    predicted: 146,
    realized: 146,
    result: "Credit approved",
    state: "verified",
  },
  {
    date: "Aug 2",
    action: "Paused fish-fry promotion at capacity",
    predicted: 96,
    realized: 112,
    result: "Ticket time held under 18 min",
    state: "verified",
  },
  {
    date: "Jul 31",
    action: "Moved one cook from 2–4 PM",
    predicted: 51,
    realized: 48,
    result: "Service level maintained",
    state: "verified",
  },
];

export const integrations = [
  { name: "Square POS", category: "Point of sale", status: "connected", detail: "Orders, catalog and sales" },
  { name: "7shifts", category: "Labor", status: "connected", detail: "Schedules and time punches" },
  { name: "QuickBooks", category: "Accounting", status: "ready", detail: "P&L and cash position" },
  { name: "Meta", category: "Marketing", status: "ready", detail: "Facebook and Instagram" },
  { name: "Google Business", category: "Marketing", status: "ready", detail: "Offers and local presence" },
  { name: "Supplier Inbox", category: "Procurement", status: "connected", detail: "Invoices and order confirmations" },
  { name: "Toast", category: "Point of sale", status: "planned", detail: "Partner access required" },
  { name: "Clover", category: "Point of sale", status: "planned", detail: "Orders and inventory" },
];

export const graphNodes = [
  { id: "menu", label: "Menu", count: 46, type: "core" },
  { id: "ingredients", label: "Ingredients", count: 128, type: "inventory" },
  { id: "suppliers", label: "Suppliers", count: 7, type: "supply" },
  { id: "labor", label: "Labor skills", count: 19, type: "people" },
  { id: "equipment", label: "Equipment", count: 24, type: "equipment" },
  { id: "channels", label: "Sales channels", count: 5, type: "channel" },
];

export const launchChecklist = [
  { label: "Concept and market fit", state: "complete" },
  { label: "Menu architecture", state: "complete" },
  { label: "Break-even model", state: "complete" },
  { label: "Licensing and permits", state: "active" },
  { label: "Vendor onboarding", state: "active" },
  { label: "Staff hiring and training", state: "upcoming" },
  { label: "Soft opening", state: "upcoming" },
];
