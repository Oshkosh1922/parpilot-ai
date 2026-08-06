/**
 * Adapter contracts keep ParPilot independent from any one POS, supplier,
 * accounting platform or AI provider. Production adapters should normalize
 * external data into these shapes before the decision engine uses it.
 */

export class PosAdapter {
  async connect() { throw new Error("Not implemented"); }
  async getOrders(_range) { throw new Error("Not implemented"); }
  async getCatalog() { throw new Error("Not implemented"); }
  async getInventory() { throw new Error("Not implemented"); }
}

export class SupplierAdapter {
  async getInvoices(_range) { throw new Error("Not implemented"); }
  async submitPurchaseOrder(_order) { throw new Error("Not implemented"); }
  async requestCredit(_claim) { throw new Error("Not implemented"); }
}

export class MarketingAdapter {
  async publish(_campaign) { throw new Error("Not implemented"); }
  async getPerformance(_campaignId) { throw new Error("Not implemented"); }
}

export class IntelligenceProvider {
  async explain(_structuredRecommendation) { throw new Error("Not implemented"); }
  async extractInvoice(_document) { throw new Error("Not implemented"); }
  async proposeRecipeMappings(_context) { throw new Error("Not implemented"); }
}
