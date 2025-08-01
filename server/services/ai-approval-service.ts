import { storage } from "../storage";
import { aiService } from "./aiService";
import type { RegulatoryUpdate, LegalCase } from "@shared/schema";

interface ApprovalDecision {
  approved: boolean;
  confidence: number;
  reasoning: string[];
  requiredActions: string[];
  reviewLevel: 'auto' | 'senior' | 'expert' | 'board';
  riskFactors: string[];
  complianceIssues: string[];
}

interface QualityMetrics {
  contentQuality: number;
  sourceReliability: number;
  relevanceScore: number;
  timeliness: number;
  overallScore: number;
}

/**
 * AI-Powered Approval Service for Regulatory Intelligence
 * Implements intelligent content evaluation with multi-level approval workflows
 */
export class AIApprovalService {
  private readonly serviceName = "AIApprovalService";
  private readonly autoApprovalThreshold = 0.85;
  private readonly seniorReviewThreshold = 0.70;
  private readonly expertReviewThreshold = 0.50;

  /**
   * Comprehensive regulatory update approval process
   */
  async evaluateRegulatoryUpdate(update: RegulatoryUpdate): Promise<ApprovalDecision> {
    try {
      console.log(`🔍 [AI Approval] Evaluating: ${update.title}`);

      // Step 1: Content Analysis
      const contentAnalysis = await aiService.analyzeRegulatoryContent(
        `${update.title} ${update.description || ''}`
      );

      // Step 2: Quality Assessment
      const qualityMetrics = await this.assessContentQuality(update);

      // Step 3: Risk Assessment
      const riskAssessment = await this.assessContentRisk(update, contentAnalysis);

      // Step 4: Compliance Check
      const complianceCheck = await this.checkCompliance(update, contentAnalysis);

      // Step 5: Decision Making
      const decision = this.makeApprovalDecision(
        update,
        contentAnalysis,
        qualityMetrics,
        riskAssessment,
        complianceCheck
      );

      console.log(`✅ [AI Approval] Decision: ${decision.approved ? 'APPROVED' : 'REJECTED'} (${decision.confidence.toFixed(2)})`);
      return decision;

    } catch (error) {
      console.error(`❌ [AI Approval] Error evaluating update ${update.id}:`, error);
      return {
        approved: false,
        confidence: 0,
        reasoning: ['Approval system error - manual review required'],
        requiredActions: ['Technical team investigation needed'],
        reviewLevel: 'expert',
        riskFactors: ['System malfunction'],
        complianceIssues: ['Unable to verify compliance']
      };
    }
  }

  /**
   * Legal case approval evaluation
   */
  async evaluateLegalCase(legalCase: LegalCase): Promise<ApprovalDecision> {
    try {
      console.log(`⚖️ [AI Approval] Evaluating legal case: ${legalCase.title}`);

      // Analyze legal case content
      const legalAnalysis = await aiService.analyzeLegalCase({
        title: legalCase.title,
        summary: legalCase.summary,
        keyIssues: legalCase.keywords || []
      });

      // Assess precedent value and relevance
      const relevanceScore = this.assessLegalRelevance(legalCase);
      const precedentValue = legalAnalysis.precedentValue;

      // Risk assessment for legal cases
      const riskFactors = this.assessLegalRisk(legalCase, legalAnalysis);
      
      const confidence = this.calculateLegalConfidence(relevanceScore, precedentValue, legalAnalysis);

      let approved = false;
      let reviewLevel: 'auto' | 'senior' | 'expert' | 'board' = 'expert';
      
      if (confidence >= this.autoApprovalThreshold && precedentValue === 'high') {
        approved = true;
        reviewLevel = 'auto';
      } else if (confidence >= this.seniorReviewThreshold) {
        reviewLevel = 'senior';
      }

      return {
        approved,
        confidence,
        reasoning: [
          `Precedent value: ${precedentValue}`,
          `Relevance score: ${relevanceScore.toFixed(2)}`,
          `Risk assessment: ${legalAnalysis.riskAssessment}`
        ],
        requiredActions: legalAnalysis.actionItems,
        reviewLevel,
        riskFactors,
        complianceIssues: []
      };

    } catch (error) {
      console.error(`❌ [AI Approval] Error evaluating legal case:`, error);
      return {
        approved: false,
        confidence: 0,
        reasoning: ['Legal case evaluation failed'],
        requiredActions: ['Manual legal review required'],
        reviewLevel: 'board',
        riskFactors: ['Evaluation system failure'],
        complianceIssues: []
      };
    }
  }

  /**
   * Assess content quality across multiple dimensions
   */
  private async assessContentQuality(update: RegulatoryUpdate): Promise<QualityMetrics> {
    const metrics: QualityMetrics = {
      contentQuality: 0,
      sourceReliability: 0,
      relevanceScore: 0,
      timeliness: 0,
      overallScore: 0
    };

    // Content Quality (40% weight)
    metrics.contentQuality = this.evaluateContentQuality(update);

    // Source Reliability (25% weight)
    metrics.sourceReliability = this.evaluateSourceReliability(update.sourceId);

    // Relevance Score (20% weight)
    metrics.relevanceScore = this.evaluateRelevance(update);

    // Timeliness (15% weight)
    metrics.timeliness = this.evaluateTimeliness(update.publishedAt);

    // Calculate overall score
    metrics.overallScore = (
      metrics.contentQuality * 0.40 +
      metrics.sourceReliability * 0.25 +
      metrics.relevanceScore * 0.20 +
      metrics.timeliness * 0.15
    );

    return metrics;
  }

  /**
   * Evaluate content quality based on length, structure, and keywords
   */
  private evaluateContentQuality(update: RegulatoryUpdate): number {
    let score = 0.5; // Base score

    // Title quality
    if (update.title && update.title.length >= 20 && update.title.length <= 200) {
      score += 0.15;
    }

    // Description quality
    if (update.description) {
      if (update.description.length >= 100) score += 0.15;
      if (update.description.length >= 300) score += 0.10;
      
      // Check for regulatory keywords
      const regKeywords = ['regulation', 'compliance', 'approval', 'standard', 'guideline'];
      const foundKeywords = regKeywords.filter(keyword => 
        update.description.toLowerCase().includes(keyword)
      );
      score += Math.min(foundKeywords.length * 0.05, 0.15);
    }

    // Categories and classification
    if (update.categories && update.categories.length > 0) {
      score += 0.10;
    }

    if (update.deviceClasses && update.deviceClasses.length > 0) {
      score += 0.05;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Evaluate source reliability based on known regulatory authorities
   */
  private evaluateSourceReliability(sourceId: string): number {
    const reliabilityMap: { [key: string]: number } = {
      'fda_510k': 0.95,
      'fda_recalls': 0.98,
      'ema_epar': 0.90,
      'bfarm_guidelines': 0.85,
      'swissmedic_guidelines': 0.85,
      'mhra_guidance': 0.80,
      'iso_standards': 0.90,
      'iec_standards': 0.85,
      'who_prequalification': 0.75,
      'pmda_japan': 0.80,
      'nmpa_china': 0.70,
      'anvisa_brazil': 0.65
    };

    return reliabilityMap[sourceId] || 0.50; // Default for unknown sources
  }

  /**
   * Evaluate content relevance to medical device regulation
   */
  private evaluateRelevance(update: RegulatoryUpdate): number {
    let score = 0.3; // Base relevance

    const highRelevanceKeywords = [
      'medical device', 'medizinprodukt', 'mdr', 'ivdr', '510k', 'pma',
      'clinical evaluation', 'post-market surveillance', 'cybersecurity'
    ];

    const mediumRelevanceKeywords = [
      'healthcare', 'health technology', 'digital health', 'telemedicine',
      'artificial intelligence', 'machine learning', 'iot device'
    ];

    const content = `${update.title} ${update.description || ''}`.toLowerCase();

    // High relevance keywords
    const highMatches = highRelevanceKeywords.filter(keyword => content.includes(keyword));
    score += Math.min(highMatches.length * 0.20, 0.60);

    // Medium relevance keywords
    const mediumMatches = mediumRelevanceKeywords.filter(keyword => content.includes(keyword));
    score += Math.min(mediumMatches.length * 0.10, 0.20);

    // Region-specific relevance
    if (['US', 'EU', 'DE', 'CH', 'UK'].includes(update.region)) {
      score += 0.10;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Evaluate timeliness based on publication date
   */
  private evaluateTimeliness(publishedAt: Date): number {
    const now = new Date();
    const ageInDays = (now.getTime() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24);

    if (ageInDays <= 7) return 1.0;      // Very fresh
    if (ageInDays <= 30) return 0.8;     // Fresh
    if (ageInDays <= 90) return 0.6;     // Recent
    if (ageInDays <= 180) return 0.4;    // Somewhat dated
    if (ageInDays <= 365) return 0.2;    // Old
    return 0.1;                          // Very old
  }

  /**
   * Assess content risk factors
   */
  private async assessContentRisk(
    update: RegulatoryUpdate, 
    analysis: any
  ): Promise<string[]> {
    const riskFactors: string[] = [];

    // High-risk device classes
    if (analysis.riskLevel === 'critical' || analysis.riskLevel === 'high') {
      riskFactors.push('High-risk device category');
    }

    // Safety-related content
    if (analysis.categories.includes('Safety Alert') || update.updateType === 'recall') {
      riskFactors.push('Safety-critical content');
    }

    // New technology risks
    if (analysis.categories.includes('AI/ML Technology')) {
      riskFactors.push('Emerging AI/ML technology');
    }

    // Regulatory complexity
    if (analysis.complianceRequirements.length > 3) {
      riskFactors.push('Complex compliance requirements');
    }

    // Timeline sensitivity
    if (analysis.timelineSensitivity === 'urgent') {
      riskFactors.push('Time-sensitive regulatory change');
    }

    return riskFactors;
  }

  /**
   * Check compliance requirements and potential issues
   */
  private async checkCompliance(
    update: RegulatoryUpdate,
    analysis: any
  ): Promise<string[]> {
    const complianceIssues: string[] = [];

    // Missing critical information
    if (!update.description || update.description.length < 50) {
      complianceIssues.push('Insufficient content detail');
    }

    // Missing categorization
    if (!update.categories || update.categories.length === 0) {
      complianceIssues.push('Missing content categorization');
    }

    // Missing device classification
    if (!update.deviceClasses || update.deviceClasses.length === 0) {
      complianceIssues.push('Missing device classification');
    }

    // Unclear priority assignment
    if (!update.priority || !['critical', 'high', 'medium', 'low'].includes(update.priority)) {
      complianceIssues.push('Invalid priority assignment');
    }

    // Regional compliance
    if (update.region === 'EU' && !analysis.categories.includes('MDR')) {
      // For EU content, check MDR relevance
      const content = `${update.title} ${update.description}`.toLowerCase();
      if (content.includes('medical device') && !content.includes('mdr')) {
        complianceIssues.push('Potential MDR compliance gap');
      }
    }

    return complianceIssues;
  }

  /**
   * Make final approval decision based on all assessments
   */
  private makeApprovalDecision(
    update: RegulatoryUpdate,
    analysis: any,
    quality: QualityMetrics,
    riskFactors: string[],
    complianceIssues: string[]
  ): ApprovalDecision {
    let confidence = quality.overallScore;
    const reasoning: string[] = [];
    const requiredActions: string[] = [];

    // Adjust confidence based on analysis
    confidence *= analysis.aiConfidenceScore;

    // Reduce confidence for risk factors
    if (riskFactors.length > 0) {
      confidence *= (1 - (riskFactors.length * 0.1));
      reasoning.push(`Risk factors identified: ${riskFactors.length}`);
    }

    // Reduce confidence for compliance issues
    if (complianceIssues.length > 0) {
      confidence *= (1 - (complianceIssues.length * 0.15));
      reasoning.push(`Compliance issues: ${complianceIssues.length}`);
      requiredActions.push('Address compliance issues before publication');
    }

    // Determine approval and review level
    let approved = false;
    let reviewLevel: 'auto' | 'senior' | 'expert' | 'board' = 'board';

    if (confidence >= this.autoApprovalThreshold && complianceIssues.length === 0) {
      approved = true;
      reviewLevel = 'auto';
      reasoning.push('High confidence, auto-approved');
    } else if (confidence >= this.seniorReviewThreshold) {
      reviewLevel = 'senior';
      reasoning.push('Medium confidence, senior review required');
      requiredActions.push('Senior reviewer approval needed');
    } else if (confidence >= this.expertReviewThreshold) {
      reviewLevel = 'expert';
      reasoning.push('Lower confidence, expert review required');
      requiredActions.push('Subject matter expert review needed');
    } else {
      reviewLevel = 'board';
      reasoning.push('Low confidence, board review required');
      requiredActions.push('Full board review and approval needed');
    }

    // Add quality score to reasoning
    reasoning.push(`Quality score: ${quality.overallScore.toFixed(2)}`);
    reasoning.push(`AI confidence: ${analysis.aiConfidenceScore.toFixed(2)}`);

    return {
      approved,
      confidence: Math.max(0, Math.min(1, confidence)),
      reasoning,
      requiredActions,
      reviewLevel,
      riskFactors,
      complianceIssues
    };
  }

  /**
   * Assess legal case relevance to medical device regulation
   */
  private assessLegalRelevance(legalCase: LegalCase): number {
    let score = 0.3;

    const content = `${legalCase.title} ${legalCase.summary}`.toLowerCase();
    
    // Medical device specific terms
    const medTechKeywords = [
      'medical device', 'implant', 'pacemaker', 'catheter', 'stent',
      'diagnostic device', 'surgical instrument', 'medical software'
    ];

    const foundMedTech = medTechKeywords.filter(keyword => content.includes(keyword));
    score += Math.min(foundMedTech.length * 0.15, 0.45);

    // Legal relevance terms
    const legalKeywords = [
      'product liability', 'fda violation', 'regulatory compliance',
      'clinical trial', 'informed consent', 'medical malpractice'
    ];

    const foundLegal = legalKeywords.filter(keyword => content.includes(keyword));
    score += Math.min(foundLegal.length * 0.10, 0.30);

    // Impact level consideration
    if (legalCase.impactLevel === 'high') {
      score += 0.15;
    } else if (legalCase.impactLevel === 'medium') {
      score += 0.10;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Assess legal risk factors
   */
  private assessLegalRisk(legalCase: LegalCase, analysis: any): string[] {
    const riskFactors: string[] = [];

    if (legalCase.impactLevel === 'high') {
      riskFactors.push('High-impact legal precedent');
    }

    if (analysis.precedentValue === 'high') {
      riskFactors.push('Significant legal precedent value');
    }

    if (analysis.themes.includes('Produkthaftung')) {
      riskFactors.push('Product liability implications');
    }

    if (analysis.themes.includes('Regulatorische Compliance')) {
      riskFactors.push('Regulatory compliance implications');
    }

    return riskFactors;
  }

  /**
   * Calculate confidence for legal case approval
   */
  private calculateLegalConfidence(
    relevanceScore: number,
    precedentValue: 'high' | 'medium' | 'low',
    analysis: any
  ): number {
    let confidence = relevanceScore * 0.6;

    // Precedent value weight
    const precedentWeight = {
      'high': 0.3,
      'medium': 0.2,
      'low': 0.1
    };
    confidence += precedentWeight[precedentValue];

    // Theme relevance
    const relevantThemes = ['Produkthaftung', 'Regulatorische Compliance', 'KI/ML-Geräte'];
    const foundRelevantThemes = analysis.themes.filter((theme: string) => 
      relevantThemes.includes(theme)
    );
    confidence += Math.min(foundRelevantThemes.length * 0.05, 0.15);

    return Math.min(confidence, 1.0);
  }

  /**
   * Get approval service metrics and performance data
   */
  getServiceMetrics() {
    return {
      serviceName: this.serviceName,
      thresholds: {
        autoApproval: this.autoApprovalThreshold,
        seniorReview: this.seniorReviewThreshold,
        expertReview: this.expertReviewThreshold
      },
      version: "2.0.0",
      lastUpdate: new Date()
    };
  }
}

export const aiApprovalService = new AIApprovalService();