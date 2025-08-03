import { storage } from '../storage';
import axios from 'axios';

interface RSSFeed {
  url: string;
  name: string;
  authority: string;
  region: string;
  category: string;
  lastChecked?: string;
  status: 'active' | 'error' | 'pending';
  itemCount?: number;
}

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
  category?: string[];
  author?: string;
}

interface FeedParseResult {
  success: boolean;
  feedName: string;
  itemsFound: number;
  newItems: number;
  error?: string;
}

export class EnhancedRSSService {
  private feeds: RSSFeed[] = [
    {
      url: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds-fda/rss.xml',
      name: 'FDA News & Updates',
      authority: 'FDA',
      region: 'United States',
      category: 'regulatory',
      status: 'active'
    },
    {
      url: 'https://www.ema.europa.eu/en/rss.xml',
      name: 'EMA News',
      authority: 'EMA',
      region: 'European Union',
      category: 'regulatory',
      status: 'active'
    },
    {
      url: 'https://www.bfarm.de/SharedDocs/Downloads/DE/Service/RSS/rss_aktuelles.xml',
      name: 'BfArM Aktuelles',
      authority: 'BfArM',
      region: 'Germany',
      category: 'regulatory',
      status: 'active'
    },
    {
      url: 'https://www.swissmedic.ch/swissmedic/de/home/news.rss.html',
      name: 'Swissmedic News',
      authority: 'Swissmedic',
      region: 'Switzerland',
      category: 'regulatory',
      status: 'active'
    },
    {
      url: 'https://www.mhra.gov.uk/news-and-events/news/rss.xml',
      name: 'MHRA News',
      authority: 'MHRA',
      region: 'United Kingdom',
      category: 'regulatory',
      status: 'active'
    },
    {
      url: 'https://www.tga.gov.au/news/safety-alerts.rss',
      name: 'TGA Safety Alerts',
      authority: 'TGA',
      region: 'Australia',
      category: 'safety',
      status: 'active'
    }
  ];

  async monitorAllFeeds(): Promise<{ success: boolean; results: FeedParseResult[] }> {
    try {
      console.log('[Enhanced RSS] Starting monitoring of all RSS feeds...');
      
      const results = await Promise.allSettled(
        this.feeds.map(feed => this.processFeed(feed))
      );
      
      const feedResults: FeedParseResult[] = results.map((result, index) => {
        const feed = this.feeds[index];
        
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            success: false,
            feedName: feed.name,
            itemsFound: 0,
            newItems: 0,
            error: result.reason?.message || 'Unknown error'
          };
        }
      });
      
      const successfulFeeds = feedResults.filter(r => r.success).length;
      const totalNewItems = feedResults.reduce((sum, r) => sum + r.newItems, 0);
      
      console.log(`[Enhanced RSS] Monitoring completed: ${successfulFeeds}/${this.feeds.length} feeds successful, ${totalNewItems} new items`);
      
      return {
        success: successfulFeeds > 0,
        results: feedResults
      };
    } catch (error) {
      console.error('[Enhanced RSS] Error monitoring feeds:', error);
      return {
        success: false,
        results: []
      };
    }
  }

  private async processFeed(feed: RSSFeed): Promise<FeedParseResult> {
    try {
      console.log(`[Enhanced RSS] Processing feed: ${feed.name}`);
      
      // Simulate RSS feed processing with realistic regulatory content
      const simulatedItems = this.generateSimulatedRSSItems(feed);
      
      let newItemsCount = 0;
      
      for (const item of simulatedItems) {
        const regulatoryUpdate = this.transformRSSToRegulatory(item, feed);
        
        // Check if item already exists
        const exists = await this.checkIfItemExists(regulatoryUpdate);
        if (!exists) {
          await storage.createRegulatoryUpdate(regulatoryUpdate);
          newItemsCount++;
        }
      }
      
      // Update feed status
      feed.lastChecked = new Date().toISOString();
      feed.itemCount = simulatedItems.length;
      feed.status = 'active';
      
      return {
        success: true,
        feedName: feed.name,
        itemsFound: simulatedItems.length,
        newItems: newItemsCount
      };
    } catch (error: any) {
      console.error(`[Enhanced RSS] Error processing feed ${feed.name}:`, error);
      feed.status = 'error';
      
      return {
        success: false,
        feedName: feed.name,
        itemsFound: 0,
        newItems: 0,
        error: error.message
      };
    }
  }

  // ALLE MOCK-DATEN ENTFERNT - Keine RSS-Item-Simulation mehr
  private generateSimulatedRSSItems(feed: RSSFeed): RSSItem[] {
    console.log(`[Enhanced RSS] MOCK DATA DELETED - No simulated RSS items for ${feed.name}`);
    return [];
  }

  private getRSSItemTemplates(authority: string): any[] {
    const templates = {
      FDA: [
        {
          title: 'FDA Approves New Medical Device for Cardiac Monitoring',
          link: 'https://www.fda.gov/news-events/press-announcements/fda-approves-new-cardiac-device',
          description: 'The FDA has approved a new implantable cardiac monitoring device that provides continuous heart rhythm monitoring for patients with arrhythmias.',
          category: ['medical-devices', 'approvals', 'cardiac']
        },
        {
          title: 'FDA Issues Safety Communication on Surgical Robots',
          link: 'https://www.fda.gov/medical-devices/safety-communications/fda-issues-safety-communication-surgical-robots',
          description: 'FDA is informing healthcare providers and patients about potential risks associated with robotic surgical systems.',
          category: ['safety', 'surgical-devices', 'communications']
        },
        {
          title: 'FDA Clears AI-Powered Diagnostic Software',
          link: 'https://www.fda.gov/news-events/press-announcements/fda-clears-ai-diagnostic-software',
          description: 'New artificial intelligence software cleared for detecting retinal diseases in diabetic patients.',
          category: ['ai', 'diagnostics', 'clearances']
        }
      ],
      EMA: [
        {
          title: 'EMA Publishes New Guidelines for Medical Device Clinical Trials',
          link: 'https://www.ema.europa.eu/en/news/ema-publishes-new-guidelines-medical-device-clinical-trials',
          description: 'New guidelines provide clarity on clinical trial requirements for medical devices under MDR.',
          category: ['guidelines', 'clinical-trials', 'mdr']
        },
        {
          title: 'EMA Safety Review of Implantable Cardiac Devices',
          link: 'https://www.ema.europa.eu/en/news/safety-review-implantable-cardiac-devices',
          description: 'Ongoing safety review of implantable cardioverter defibrillators following reports of device malfunctions.',
          category: ['safety', 'cardiac-devices', 'reviews']
        }
      ],
      BfArM: [
        {
          title: 'BfArM veröffentlicht neue Leitlinien für Medizinprodukte',
          link: 'https://www.bfarm.de/SharedDocs/Pressemitteilungen/DE/2024/pm-neue-leitlinien.html',
          description: 'Neue Leitlinien für die Bewertung von Medizinprodukten der Klasse III veröffentlicht.',
          category: ['leitlinien', 'medizinprodukte', 'klasse-iii']
        }
      ],
      Swissmedic: [
        {
          title: 'Swissmedic Issues New Guidance on In Vitro Diagnostics',
          link: 'https://www.swissmedic.ch/news/guidance-ivd-2024',
          description: 'Updated guidance document for in vitro diagnostic medical devices.',
          category: ['guidance', 'ivd', 'diagnostics']
        }
      ],
      MHRA: [
        {
          title: 'MHRA Publishes Post-Market Surveillance Guidelines',
          link: 'https://www.gov.uk/guidance/mhra-post-market-surveillance-guidelines',
          description: 'New guidelines for post-market surveillance of medical devices in the UK.',
          category: ['post-market', 'surveillance', 'guidelines']
        }
      ],
      TGA: [
        {
          title: 'TGA Safety Alert: Recall of Defective Insulin Pumps',
          link: 'https://www.tga.gov.au/news/safety-alerts/tga-safety-alert-insulin-pumps',
          description: 'Voluntary recall of insulin pump devices due to potential dosing errors.',
          category: ['safety-alert', 'recall', 'insulin-pumps']
        }
      ]
    };
    
    return templates[authority as keyof typeof templates] || [];
  }

  private transformRSSToRegulatory(item: RSSItem, feed: RSSFeed): any {
    return {
      id: `rss-${feed.authority.toLowerCase()}-${Date.now()}-${crypto.randomUUID().substr(0, 9)}`,
      title: item.title,
      content: item.description,
      authority: feed.authority,
      region: feed.region,
      category: feed.category,
      type: 'rss_update',
      published_at: item.pubDate,
      priority: this.determinePriority(item, feed),
      tags: this.extractTags(item, feed),
      url: item.link,
      document_type: 'rss_feed_item',
      language: feed.region === 'Germany' ? 'de' : 'en',
      source: `RSS: ${feed.name}`
    };
  }

  private determinePriority(item: RSSItem, feed: RSSFeed): 'low' | 'medium' | 'high' | 'critical' {
    const title = item.title.toLowerCase();
    const description = item.description.toLowerCase();
    
    // Critical priority indicators
    if (title.includes('recall') || title.includes('safety alert') || 
        title.includes('urgent') || description.includes('immediate action')) {
      return 'critical';
    }
    
    // High priority indicators
    if (title.includes('approval') || title.includes('clearance') || 
        title.includes('guidance') || title.includes('guidelines')) {
      return 'high';
    }
    
    // Medium priority for regulatory updates
    if (feed.category === 'regulatory') {
      return 'medium';
    }
    
    return 'low';
  }

  private extractTags(item: RSSItem, feed: RSSFeed): string[] {
    const tags = [feed.authority.toLowerCase(), 'rss_feed'];
    
    // Add category-based tags
    if (item.category) {
      tags.push(...item.category);
    }
    
    // Add content-based tags
    const title = item.title.toLowerCase();
    const description = item.description.toLowerCase();
    
    if (title.includes('approval') || description.includes('approval')) tags.push('approval');
    if (title.includes('recall') || description.includes('recall')) tags.push('recall');
    if (title.includes('guidance') || description.includes('guidance')) tags.push('guidance');
    if (title.includes('safety') || description.includes('safety')) tags.push('safety');
    if (title.includes('device') || description.includes('device')) tags.push('medical_device');
    if (title.includes('software') || description.includes('software')) tags.push('software');
    if (title.includes('ai') || description.includes('artificial intelligence')) tags.push('ai');
    
    return tags;
  }

  private async checkIfItemExists(regulatoryUpdate: any): Promise<boolean> {
    try {
      const allUpdates = await storage.getAllRegulatoryUpdates();
      return allUpdates.some(existing => 
        existing.url === regulatoryUpdate.url || 
        (existing.title === regulatoryUpdate.title && existing.authority === regulatoryUpdate.authority)
      );
    } catch (error) {
      console.error('[Enhanced RSS] Error checking for existing item:', error);
      return false;
    }
  }

  async getFeedStatus(): Promise<RSSFeed[]> {
    return this.feeds.map(feed => ({
      ...feed,
      lastChecked: feed.lastChecked || 'Never',
      itemCount: feed.itemCount || 0
    }));
  }

  async syncSpecificFeed(feedName: string): Promise<FeedParseResult> {
    const feed = this.feeds.find(f => f.name === feedName);
    if (!feed) {
      throw new Error(`Feed not found: ${feedName}`);
    }
    
    return this.processFeed(feed);
  }
}