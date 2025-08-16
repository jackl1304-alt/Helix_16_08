import express from 'express';
import { perplexityService } from '../services/perplexity-service';

const router = express.Router();

/**
 * Intelligente Suche für regulatorische Updates
 */
router.post('/search/regulatory', async (req, res) => {
  try {
    const { query, domain } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Query parameter is required'
      });
    }

    console.log('[AI-SEARCH] Regulatory search request', { query, domain });

    const result = await perplexityService.searchRegulatoryUpdates(query, domain);

    res.json({
      success: true,
      query,
      result: {
        content: result.content,
        citations: result.citations,
        relatedQuestions: result.relatedQuestions || []
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[AI-SEARCH] Regulatory search error', { error: error.message });
    res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
});

/**
 * KI-basierte Analyse von Rechtsfällen
 */
router.post('/analyze/legal-case', async (req, res) => {
  try {
    const { caseData } = req.body;

    if (!caseData || !caseData.title) {
      return res.status(400).json({
        error: 'Case data with title is required'
      });
    }

    console.log('[AI-SEARCH] Legal case analysis request', { caseId: caseData.id });

    const analysis = await perplexityService.analyzeLegalCase(caseData);

    res.json({
      success: true,
      caseId: caseData.id,
      analysis: {
        summary: analysis.summary,
        riskAssessment: analysis.riskAssessment,
        precedentAnalysis: analysis.precedentAnalysis,
        recommendations: analysis.recommendations,
        citations: analysis.citations
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[AI-SEARCH] Legal case analysis error', { error: error.message });
    res.status(500).json({
      error: 'Legal case analysis failed',
      message: error.message
    });
  }
});

/**
 * Content-Qualitätsbewertung mit KI
 */
router.post('/evaluate/content', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.title) {
      return res.status(400).json({
        error: 'Content with title is required'
      });
    }

    logger.info('[AI-SEARCH] Content evaluation request', { contentId: content.id });

    const evaluation = await perplexityService.evaluateContent(content);

    res.json({
      success: true,
      contentId: content.id,
      evaluation: {
        scores: {
          quality: evaluation.qualityScore,
          relevance: evaluation.relevanceScore,
          compliance: evaluation.complianceScore,
          overall: Math.round((evaluation.qualityScore + evaluation.relevanceScore + evaluation.complianceScore) / 3)
        },
        recommendations: evaluation.recommendations,
        suggestedTags: evaluation.suggestedTags
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('[AI-SEARCH] Content evaluation error', { error: error.message });
    res.status(500).json({
      error: 'Content evaluation failed',
      message: error.message
    });
  }
});

/**
 * Trend-Analyse für Dashboard
 */
router.get('/trends/:timeframe?', async (req, res) => {
  try {
    const timeframe = req.params.timeframe || 'month';

    if (!['week', 'month', 'quarter'].includes(timeframe)) {
      return res.status(400).json({
        error: 'Invalid timeframe. Use: week, month, or quarter'
      });
    }

    logger.info('[AI-SEARCH] Trend analysis request', { timeframe });

    const trends = await perplexityService.analyzeTrends(timeframe);

    res.json({
      success: true,
      timeframe,
      trends: {
        emergingTopics: trends.emergingTopics,
        riskAlerts: trends.riskAlerts,
        complianceUpdates: trends.complianceUpdates,
        marketInsights: trends.marketInsights
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('[AI-SEARCH] Trend analysis error', { error: error.message });
    res.status(500).json({
      error: 'Trend analysis failed',
      message: error.message
    });
  }
});

/**
 * Bulk Content-Analyse für Admin-Dashboard
 */
router.post('/bulk/analyze', async (req, res) => {
  try {
    const { contentItems, analysisType } = req.body;

    if (!contentItems || !Array.isArray(contentItems)) {
      return res.status(400).json({
        error: 'Content items array is required'
      });
    }

    logger.info('[AI-SEARCH] Bulk analysis request', { 
      itemCount: contentItems.length, 
      analysisType 
    });

    const results = [];

    // Process items in batches to avoid rate limits
    for (const item of contentItems.slice(0, 5)) { // Limit for demo
      try {
        if (analysisType === 'legal') {
          const analysis = await perplexityService.analyzeLegalCase(item);
          results.push({
            id: item.id,
            success: true,
            analysis
          });
        } else {
          const evaluation = await perplexityService.evaluateContent(item);
          results.push({
            id: item.id,
            success: true,
            evaluation
          });
        }
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        results.push({
          id: item.id,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      processed: results.length,
      total: contentItems.length,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('[AI-SEARCH] Bulk analysis error', { error: error.message });
    res.status(500).json({
      error: 'Bulk analysis failed',
      message: error.message
    });
  }
});

/**
 * Smart Content-Erstellung basierend auf Trends
 */
router.post('/generate/content-suggestions', async (req, res) => {
  try {
    const { category, keywords, targetAudience } = req.body;

    logger.info('[AI-SEARCH] Content suggestion request', { category, keywords });

    // Use trend analysis to generate content suggestions
    const trends = await perplexityService.analyzeTrends('month');
    
    // Combine trends with user requirements for suggestions
    const suggestions = {
      topicSuggestions: trends.emergingTopics.slice(0, 3),
      keywordRecommendations: [
        ...trends.complianceUpdates.slice(0, 2),
        ...(keywords || [])
      ],
      contentTypes: [
        'Regulatory Update Analysis',
        'Compliance Guide',
        'Market Trend Report',
        'Risk Assessment'
      ],
      urgencyFlags: trends.riskAlerts.slice(0, 2)
    };

    res.json({
      success: true,
      category,
      targetAudience,
      suggestions,
      basedOnTrends: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('[AI-SEARCH] Content suggestions error', { error: error.message });
    res.status(500).json({
      error: 'Content suggestions failed',
      message: error.message
    });
  }
});

export default router;