const SymbolsAnalytics = {
  IMetricsRepository: Symbol.for('IMetricsRepository'),
  IAnalyticsService: Symbol.for('IAnalyticsService'),
  // Owned by analytics (product + user head counts), not a port to the product
  // aggregate, so it gets its own token instead of shadowing SymbolsProduct.
  ICatalogueRepository: Symbol.for('IAnalyticsCatalogueRepository'),
};

export default SymbolsAnalytics;
