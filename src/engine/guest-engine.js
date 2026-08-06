const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export function buildGuestExperience(input = {}) {
  const quotedWait = Math.max(0, Number(input.quotedWait || 18));
  const currentWait = Math.max(0, Number(input.currentWait || 14));
  const kitchenLoad = clamp(Number(input.kitchenLoad || 72), 0, 130);
  const delta = currentWait - quotedWait;
  const recoveryActive = delta >= 8 || kitchenLoad >= 95;
  return {
    guest: { firstName: String(input.firstName || "Taylor"), partySize: Math.max(1, Number(input.partySize || 4)), visitCount: Math.max(0, Number(input.visitCount || 3)), dietary: String(input.dietary || "vegetarian") },
    wait: { quoted: quotedWait, current: currentWait, range: `${Math.max(0, currentWait - 3)}–${currentWait + 3} minutes`, status: recoveryActive ? "attention" : currentWait <= quotedWait ? "on-track" : "watch" },
    availability: [
      { name: "Friday fish fry", status: kitchenLoad > 90 ? "limited" : "available", note: kitchenLoad > 90 ? "Limited ordering window" : "Available today" },
      { name: "Wisconsin cheese curds", status: "available", note: "Best local match" },
      { name: "Wild mushroom sandwich", status: "available", note: "Vegetarian favorite" },
    ],
    recovery: recoveryActive ? { active: true, title: "Protect the promise now", message: "The original wait promise may be missed. Update the guest before they have to ask and offer a manager-approved recovery choice.", choices: ["Honest update and new promise", "Complimentary non-alcoholic beverage", "Priority manager check-in"] } : { active: false, title: "Promise protected", message: "Current timing remains within the quoted range.", choices: [] },
    privateFeedback: { question: "How is the experience feeling right now?", options: ["Great", "Good", "Something needs attention"] },
  };
}
