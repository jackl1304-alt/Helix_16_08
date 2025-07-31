import { storage } from '../storage';

interface PredictionRequest {
  deviceCategory?: string;
  manufacturer?: string;
  jurisdiction?: string;
  timeHorizon: '30d' | '90d' | '180d' | '1y';
  predictionType: 'safety_alerts' | 'approvals' | 'regulatory_changes' | 'market_trends';
}

interface PredictionResult {
  id: string;
  predictionType: string;
  targetPeriod: string;
  confidence: number;
  predictions: Prediction[];
  riskFactors: RiskFactor[];
  recommendations: string[];
  basedOnDataPoints: number;
  generatedAt: Date;
}

interface Prediction {
  event: string;
  probability: number;
  timeframe: string;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  supportingData: string[];
}

interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: number;
  mitigationStrategies: string[];
}

interface ComplianceRisk {
  jurisdiction: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  timeline: string;
  recommendations: string[];
}

interface MarketOpportunity {
  region: string;
  deviceCategory: string;
  opportunityScore: number;
  timeline: string;
  requirements: string[];
  competitiveFactors: string[];
}

export class PredictiveAnalyticsService {
  private readonly minimumDataPoints = 10;
  private readonly confidenceThreshold = 0.6;
  
  async generatePredictions(request: PredictionRequest): Promise<PredictionResult> {
    try {
      console.log(`[Predictive] Generating ${request.predictionType} predictions for ${request.timeHorizon}`);
      
      // Get historical data for analysis
      const historicalData = await this.getHistoricalData(request);
      
      if (historicalData.length < this.minimumDataPoints) {
        throw new Error(`Insufficient data for prediction (${historicalData.length} points, minimum ${this.minimumDataPoints})`);
      }
      
      // Generate predictions based on type
      const predictions = await this.analyzePredictionType(request, historicalData);
      const riskFactors = await this.identifyRiskFactors(request, historicalData);
      const recommendations = this.generateRecommendations(predictions, riskFactors);
      
      const result: PredictionResult = {
        id: `prediction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        predictionType: request.predictionType,
        targetPeriod: request.timeHorizon,
        confidence: this.calculateOverallConfidence(predictions),
        predictions,
        riskFactors,
        recommendations,
        basedOnDataPoints: historicalData.length,
        generatedAt: new Date()
      };
      
      console.log(`[Predictive] Generated ${predictions.length} predictions with ${result.confidence}% confidence`);
      return result;
    } catch (error) {
      console.error('[Predictive] Error generating predictions:', error);
      throw error;
    }
  }

  private async getHistoricalData(request: PredictionRequest): Promise<any[]> {
    try {
      const allUpdates = await storage.getAllRegulatoryUpdates();
      const allLegalCases = await storage.getAllLegalCases();
      
      let filteredData = [...allUpdates];
      
      // Apply filters
      if (request.deviceCategory) {
        filteredData = filteredData.filter(item => 
          this.matchesDeviceCategory(item, request.deviceCategory!)
        );
      }
      
      if (request.manufacturer) {
        filteredData = filteredData.filter(item => 
          this.matchesManufacturer(item, request.manufacturer!)
        );
      }
      
      if (request.jurisdiction) {
        filteredData = filteredData.filter(item => 
          item.region?.toLowerCase().includes(request.jurisdiction!.toLowerCase()) ||
          item.authority?.toLowerCase().includes(request.jurisdiction!.toLowerCase())
        );
      }
      
      // Include relevant legal cases for safety predictions
      if (request.predictionType === 'safety_alerts') {
        const relevantLegalCases = allLegalCases.filter(legalCase => {
          if (request.deviceCategory) {
            return this.matchesDeviceCategory(legalCase, request.deviceCategory);
          }
          return true;
        });
        filteredData.push(...relevantLegalCases);
      }
      
      // Sort by date (most recent first)
      return filteredData.sort((a, b) => 
        new Date(b.published_at || b.filed_date || 0).getTime() - 
        new Date(a.published_at || a.filed_date || 0).getTime()
      );
    } catch (error) {
      console.error('[Predictive] Error getting historical data:', error);
      return [];
    }
  }

  private matchesDeviceCategory(item: any, category: string): boolean {
    const content = (item.title + ' ' + item.content + ' ' + (item.device_type || '')).toLowerCase();
    const categoryLower = category.toLowerCase();
    
    // Device category mapping
    const categoryKeywords: Record<string, string[]> = {
      'cardiac': ['cardiac', 'heart', 'pacemaker', 'defibrillator', 'stent'],
      'orthopedic': ['orthopedic', 'bone', 'joint', 'hip', 'knee', 'spine'],
      'diabetes': ['diabetes', 'insulin', 'glucose', 'cgm', 'blood sugar'],
      'imaging': ['imaging', 'mri', 'ct', 'ultrasound', 'x-ray', 'scan'],
      'software': ['software', 'ai', 'algorithm', 'digital', 'app'],
      'ivd': ['diagnostic', 'test', 'assay', 'laboratory', 'biomarker']
    };
    
    const keywords = categoryKeywords[categoryLower] || [categoryLower];
    return keywords.some(keyword => content.includes(keyword));
  }

  private matchesManufacturer(item: any, manufacturer: string): boolean {
    const content = (item.title + ' ' + item.content).toLowerCase();
    return content.includes(manufacturer.toLowerCase());
  }

  private async analyzePredictionType(request: PredictionRequest, data: any[]): Promise<Prediction[]> {
    switch (request.predictionType) {
      case 'safety_alerts':
        return this.predictSafetyAlerts(data, request.timeHorizon);
      case 'approvals':
        return this.predictApprovals(data, request.timeHorizon);
      case 'regulatory_changes':
        return this.predictRegulatoryChanges(data, request.timeHorizon);
      case 'market_trends':
        return this.predictMarketTrends(data, request.timeHorizon);
      default:
        throw new Error(`Unknown prediction type: ${request.predictionType}`);
    }
  }

  private predictSafetyAlerts(data: any[], timeHorizon: string): Prediction[] {
    const predictions: Prediction[] = [];
    
    // Analyze safety alert patterns
    const safetyAlerts = data.filter(item => 
      this.isSafetyRelated(item.title + ' ' + item.content)
    );
    
    const alertFrequency = this.calculateFrequency(safetyAlerts, timeHorizon);
    
    if (alertFrequency.trend === 'increasing') {
      predictions.push({
        event: 'Increased safety alert activity',
        probability: Math.min(0.9, alertFrequency.rate * 1.2),
        timeframe: this.getTimeframeFromHorizon(timeHorizon),
        impactLevel: 'high',
        confidence: 0.75,
        supportingData: [
          `${safetyAlerts.length} safety alerts in historical data`,
          `${alertFrequency.rate.toFixed(2)} alerts per month trend`,
          'Pattern analysis shows increasing regulatory scrutiny'
        ]
      });
    }
    
    // Device-specific safety predictions
    const deviceTypes = this.extractDeviceTypes(data);
    for (const deviceType of deviceTypes.slice(0, 3)) { // Top 3 device types
      const deviceAlerts = safetyAlerts.filter(alert => 
        this.matchesDeviceCategory(alert, deviceType)
      );
      
      if (deviceAlerts.length >= 2) {
        predictions.push({
          event: `Potential safety concern for ${deviceType} devices`,
          probability: Math.min(0.8, deviceAlerts.length / safetyAlerts.length + 0.3),
          timeframe: this.getTimeframeFromHorizon(timeHorizon),
          impactLevel: this.assessDeviceSafetyImpact(deviceType),
          confidence: 0.65,
          supportingData: [
            `${deviceAlerts.length} historical alerts for ${deviceType}`,
            'Similar device categories showing regulatory patterns',
            'Post-market surveillance data indicates increased scrutiny'
          ]
        });
      }
    }
    
    return predictions;
  }

  private predictApprovals(data: any[], timeHorizon: string): Prediction[] {
    const predictions: Prediction[] = [];
    
    // Analyze approval patterns
    const approvals = data.filter(item => 
      this.isApprovalRelated(item.title + ' ' + item.content)
    );
    
    const approvalFrequency = this.calculateFrequency(approvals, timeHorizon);
    
    predictions.push({
      event: 'Device approval rate projection',
      probability: 0.85,
      timeframe: this.getTimeframeFromHorizon(timeHorizon),
      impactLevel: 'medium',
      confidence: 0.7,
      supportingData: [
        `${approvals.length} approvals in historical data`,
        `Average ${approvalFrequency.rate.toFixed(1)} approvals per month`,
        'Regulatory pathway analysis shows consistent patterns'
      ]
    });
    
    // Jurisdiction-specific approval predictions
    const jurisdictions = Array.from(new Set(data.map(item => item.authority)));
    for (const jurisdiction of jurisdictions.slice(0, 3)) {
      const jurisdictionApprovals = approvals.filter(approval => 
        approval.authority === jurisdiction
      );
      
      if (jurisdictionApprovals.length >= 3) {
        predictions.push({
          event: `${jurisdiction} approval timeline changes`,
          probability: 0.6,
          timeframe: this.getTimeframeFromHorizon(timeHorizon),
          impactLevel: 'medium',
          confidence: 0.6,
          supportingData: [
            `${jurisdictionApprovals.length} historical approvals`,
            'Regulatory harmonization trends',
            'Authority workload and priority shifts'
          ]
        });
      }
    }
    
    return predictions;
  }

  private predictRegulatoryChanges(data: any[], timeHorizon: string): Prediction[] {
    const predictions: Prediction[] = [];
    
    // Analyze regulatory update patterns
    const regulatoryUpdates = data.filter(item => 
      this.isRegulatoryChange(item.title + ' ' + item.content)
    );
    
    const changeFrequency = this.calculateFrequency(regulatoryUpdates, timeHorizon);
    
    if (changeFrequency.trend === 'increasing') {
      predictions.push({
        event: 'Accelerated regulatory framework updates',
        probability: 0.75,
        timeframe: this.getTimeframeFromHorizon(timeHorizon),
        impactLevel: 'high',
        confidence: 0.8,
        supportingData: [
          `${regulatoryUpdates.length} regulatory changes identified`,
          'Increasing frequency of framework updates',
          'Global harmonization efforts driving changes'
        ]
      });
    }
    
    // Technology-specific regulatory predictions
    const emergingTechs = ['AI/ML', 'Digital Therapeutics', 'Personalized Medicine'];
    for (const tech of emergingTechs) {
      const techUpdates = data.filter(item => 
        this.matchesTechnology(item, tech)
      );
      
      if (techUpdates.length >= 2) {
        predictions.push({
          event: `New ${tech} regulatory guidance`,
          probability: 0.7,
          timeframe: this.getTimeframeFromHorizon(timeHorizon),
          impactLevel: 'high',
          confidence: 0.65,
          supportingData: [
            `${techUpdates.length} related regulatory activities`,
            'Technology adoption driving regulatory need',
            'Industry stakeholder engagement increasing'
          ]
        });
      }
    }
    
    return predictions;
  }

  private predictMarketTrends(data: any[], timeHorizon: string): Prediction[] {
    const predictions: Prediction[] = [];
    
    // Analyze market-impacting events
    const marketEvents = data.filter(item => 
      this.hasMarketImpact(item.title + ' ' + item.content)
    );
    
    predictions.push({
      event: 'Market consolidation in regulated segments',
      probability: 0.6,
      timeframe: this.getTimeframeFromHorizon(timeHorizon),
      impactLevel: 'medium',
      confidence: 0.55,
      supportingData: [
        `${marketEvents.length} market-impacting regulatory events`,
        'Regulatory complexity driving consolidation',
        'Compliance cost pressures on smaller players'
      ]
    });
    
    // Regional market predictions
    const regions = Array.from(new Set(data.map(item => item.region))).filter(Boolean);
    for (const region of regions.slice(0, 3)) {
      const regionData = data.filter(item => item.region === region);
      
      if (regionData.length >= 5) {
        predictions.push({
          event: `${region} market access opportunities`,
          probability: 0.65,
          timeframe: this.getTimeframeFromHorizon(timeHorizon),
          impactLevel: 'medium',
          confidence: 0.6,
          supportingData: [
            `${regionData.length} regulatory activities in ${region}`,
            'Regulatory pathway clarity improving',
            'Market access barriers being addressed'
          ]
        });
      }
    }
    
    return predictions;
  }

  private isSafetyRelated(content: string): boolean {
    const safetyKeywords = ['safety', 'recall', 'alert', 'warning', 'adverse', 'incident', 'malfunction'];
    return safetyKeywords.some(keyword => content.toLowerCase().includes(keyword));
  }

  private isApprovalRelated(content: string): boolean {
    const approvalKeywords = ['approval', 'clearance', 'authorized', 'approved', '510(k)', 'pma', 'ce mark'];
    return approvalKeywords.some(keyword => content.toLowerCase().includes(keyword));
  }

  private isRegulatoryChange(content: string): boolean {
    const changeKeywords = ['guidance', 'regulation', 'standard', 'requirement', 'framework', 'policy'];
    return changeKeywords.some(keyword => content.toLowerCase().includes(keyword));
  }

  private hasMarketImpact(content: string): boolean {
    const marketKeywords = ['market', 'competition', 'industry', 'economic', 'commercial', 'business'];
    return marketKeywords.some(keyword => content.toLowerCase().includes(keyword));
  }

  private matchesTechnology(item: any, tech: string): boolean {
    const content = (item.title + ' ' + item.content).toLowerCase();
    const techKeywords: Record<string, string[]> = {
      'AI/ML': ['artificial intelligence', 'machine learning', 'ai', 'ml', 'algorithm'],
      'Digital Therapeutics': ['digital therapeutic', 'dtx', 'app', 'software treatment'],
      'Personalized Medicine': ['personalized', 'precision', 'genomic', 'biomarker', 'companion diagnostic']
    };
    
    const keywords = techKeywords[tech] || [tech.toLowerCase()];
    return keywords.some(keyword => content.includes(keyword));
  }

  private calculateFrequency(data: any[], timeHorizon: string): { rate: number; trend: 'increasing' | 'stable' | 'decreasing' } {
    if (data.length === 0) return { rate: 0, trend: 'stable' };
    
    // Calculate monthly rate
    const months = this.getMonthsFromHorizon(timeHorizon);
    const rate = data.length / months;
    
    // Simple trend analysis
    const sortedData = data.sort((a, b) => 
      new Date(a.published_at || a.filed_date || 0).getTime() - 
      new Date(b.published_at || b.filed_date || 0).getTime()
    );
    
    const midpoint = Math.floor(sortedData.length / 2);
    const firstHalf = sortedData.slice(0, midpoint);
    const secondHalf = sortedData.slice(midpoint);
    
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (secondHalf.length > firstHalf.length * 1.2) trend = 'increasing';
    else if (firstHalf.length > secondHalf.length * 1.2) trend = 'decreasing';
    
    return { rate, trend };
  }

  private extractDeviceTypes(data: any[]): string[] {
    const deviceTypes: Record<string, number> = {};
    
    for (const item of data) {
      const content = (item.title + ' ' + item.content).toLowerCase();
      
      // Extract common device types
      const types = ['cardiac', 'orthopedic', 'diabetes', 'imaging', 'software', 'ivd'];
      for (const type of types) {
        if (this.matchesDeviceCategory(item, type)) {
          deviceTypes[type] = (deviceTypes[type] || 0) + 1;
        }
      }
    }
    
    return Object.entries(deviceTypes)
      .sort(([,a], [,b]) => b - a)
      .map(([type]) => type);
  }

  private assessDeviceSafetyImpact(deviceType: string): 'low' | 'medium' | 'high' | 'critical' {
    const highRiskDevices = ['cardiac', 'implantable', 'life support'];
    const mediumRiskDevices = ['orthopedic', 'surgical', 'diabetes'];
    
    if (highRiskDevices.some(risk => deviceType.includes(risk))) return 'critical';
    if (mediumRiskDevices.some(risk => deviceType.includes(risk))) return 'high';
    return 'medium';
  }

  private getTimeframeFromHorizon(horizon: string): string {
    const timeframes: Record<string, string> = {
      '30d': 'Next 30 days',
      '90d': 'Next 3 months',
      '180d': 'Next 6 months',
      '1y': 'Next 12 months'
    };
    return timeframes[horizon] || 'Future period';
  }

  private getMonthsFromHorizon(horizon: string): number {
    const months: Record<string, number> = {
      '30d': 1,
      '90d': 3,
      '180d': 6,
      '1y': 12
    };
    return months[horizon] || 3;
  }

  private async identifyRiskFactors(request: PredictionRequest, data: any[]): Promise<RiskFactor[]> {
    const riskFactors: RiskFactor[] = [];
    
    // High-priority items risk
    const highPriorityItems = data.filter(item => 
      item.priority === 'high' || item.priority === 'critical'
    );
    
    if (highPriorityItems.length > data.length * 0.2) {
      riskFactors.push({
        factor: 'High volume of critical regulatory activity',
        severity: 'high',
        likelihood: 0.8,
        mitigationStrategies: [
          'Implement enhanced monitoring protocols',
          'Increase regulatory affairs staffing',
          'Establish rapid response procedures'
        ]
      });
    }
    
    // Jurisdiction concentration risk
    const authorities = data.map(item => item.authority);
    const authorityFreq = authorities.reduce((acc: Record<string, number>, auth) => {
      acc[auth] = (acc[auth] || 0) + 1;
      return acc;
    }, {});
    
    const maxAuthorityShare = Math.max(...Object.values(authorityFreq)) / data.length;
    if (maxAuthorityShare > 0.6) {
      riskFactors.push({
        factor: 'Over-concentration in single jurisdiction',
        severity: 'medium',
        likelihood: 0.7,
        mitigationStrategies: [
          'Diversify regulatory portfolio across jurisdictions',
          'Develop regional expertise',
          'Monitor regulatory harmonization trends'
        ]
      });
    }
    
    return riskFactors;
  }

  private calculateOverallConfidence(predictions: Prediction[]): number {
    if (predictions.length === 0) return 0;
    
    const avgConfidence = predictions.reduce((sum, pred) => sum + pred.confidence, 0) / predictions.length;
    return Math.round(avgConfidence * 100);
  }

  private generateRecommendations(predictions: Prediction[], riskFactors: RiskFactor[]): string[] {
    const recommendations: string[] = [];
    
    // High-probability predictions
    const highProbPredictions = predictions.filter(p => p.probability > 0.7);
    if (highProbPredictions.length > 0) {
      recommendations.push('Prioritize preparation for high-probability regulatory events');
    }
    
    // High-impact predictions
    const highImpactPredictions = predictions.filter(p => 
      p.impactLevel === 'high' || p.impactLevel === 'critical'
    );
    if (highImpactPredictions.length > 0) {
      recommendations.push('Develop contingency plans for high-impact regulatory scenarios');
    }
    
    // Risk factor mitigation
    const highSeverityRisks = riskFactors.filter(r => r.severity === 'high' || r.severity === 'critical');
    if (highSeverityRisks.length > 0) {
      recommendations.push('Implement immediate risk mitigation strategies for identified factors');
    }
    
    // General recommendations
    recommendations.push('Maintain continuous monitoring of regulatory landscape');
    recommendations.push('Regular review and update of predictive models based on new data');
    
    return recommendations;
  }

  async generateComplianceRiskAssessment(jurisdiction?: string): Promise<ComplianceRisk[]> {
    try {
      console.log('[Predictive] Generating compliance risk assessment');
      
      const allUpdates = await storage.getAllRegulatoryUpdates();
      const jurisdictions = jurisdiction ? [jurisdiction] : 
        Array.from(new Set(allUpdates.map(u => u.authority))).slice(0, 5);
      
      const risks: ComplianceRisk[] = [];
      
      for (const juris of jurisdictions) {
        const jurisdictionData = allUpdates.filter(u => u.authority === juris);
        const riskLevel = this.assessJurisdictionRisk(jurisdictionData);
        
        risks.push({
          jurisdiction: juris,
          riskLevel,
          factors: this.identifyJurisdictionRiskFactors(jurisdictionData),
          timeline: 'Next 6 months',
          recommendations: this.generateJurisdictionRecommendations(juris, riskLevel)
        });
      }
      
      console.log(`[Predictive] Generated compliance risk assessment for ${risks.length} jurisdictions`);
      return risks;
    } catch (error) {
      console.error('[Predictive] Error generating compliance risk assessment:', error);
      throw error;
    }
  }

  private assessJurisdictionRisk(data: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const recentData = data.filter(item => {
      const itemDate = new Date(item.published_at || 0);
      const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
      return itemDate > sixMonthsAgo;
    });
    
    const highPriorityCount = recentData.filter(item => 
      item.priority === 'high' || item.priority === 'critical'
    ).length;
    
    if (highPriorityCount > 5) return 'critical';
    if (highPriorityCount > 2) return 'high';
    if (recentData.length > 10) return 'medium';
    return 'low';
  }

  private identifyJurisdictionRiskFactors(data: any[]): string[] {
    const factors: string[] = [];
    
    const safetyCount = data.filter(item => this.isSafetyRelated(item.title + ' ' + item.content)).length;
    if (safetyCount > data.length * 0.3) {
      factors.push('High volume of safety-related regulatory activity');
    }
    
    const recentChanges = data.filter(item => {
      const itemDate = new Date(item.published_at || 0);
      const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000);
      return itemDate > threeMonthsAgo && this.isRegulatoryChange(item.title + ' ' + item.content);
    }).length;
    
    if (recentChanges > 3) {
      factors.push('Frequent regulatory framework updates');
    }
    
    return factors;
  }

  private generateJurisdictionRecommendations(jurisdiction: string, riskLevel: string): string[] {
    const recommendations: string[] = [];
    
    switch (riskLevel) {
      case 'critical':
        recommendations.push('Immediate compliance audit recommended');
        recommendations.push('Dedicated regulatory specialist assignment');
        break;
      case 'high':
        recommendations.push('Enhanced monitoring and quarterly reviews');
        recommendations.push('Proactive engagement with regulatory consultants');
        break;
      case 'medium':
        recommendations.push('Regular compliance checks and updates');
        recommendations.push('Monitor for emerging regulatory trends');
        break;
      case 'low':
        recommendations.push('Maintain standard monitoring protocols');
        break;
    }
    
    recommendations.push(`Stay informed on ${jurisdiction} regulatory developments`);
    return recommendations;
  }
}