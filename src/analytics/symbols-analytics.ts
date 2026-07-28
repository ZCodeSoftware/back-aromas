const SymbolsAnalytics = {
  IMetricsRepository: Symbol.for('IMetricsRepository'),
  IAnalyticsService: Symbol.for('IAnalyticsService'),
  // Owned by analytics (product + user head counts), not a port to the product
  // aggregate, so it gets its own token instead of shadowing SymbolsProduct.
  ICatalogueRepository: Symbol.for('IAnalyticsCatalogueRepository'),
  // Same reasoning: analytics-owned read adapters, not ports into the product or
  // cart modules.
  IInventoryRepository: Symbol.for('IAnalyticsInventoryRepository'),
  ICartRepository: Symbol.for('IAnalyticsCartRepository'),
};

export default SymbolsAnalytics;
