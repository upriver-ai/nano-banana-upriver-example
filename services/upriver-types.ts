export interface BrandResearchOptions {
  auto?: string | null;
  brand_url?: string | null;
  brand_name?: string | null;
  response_format?: "json" | "text";
  effort?: "auto" | "low" | "mid" | "high";
}

export interface BrandIdentity {
  mission: string;
  mission_reason: string;
  values: string[];
  values_reason: string;
  tagline: string;
  tagline_reason: string;
  language: {
    tone: string;
    tone_reason: string;
    key_phrases: string[];
    key_phrases_reason: string;
  };
}

export interface BrandV2Brand {
  name: string;
  url: string;
  voice: string;
  values: string[];
  tagline: string;
  mission: string;
  industry: string;
  target_audience: string;
  target_audience_reason: string;
  identity: BrandIdentity;
  colors: Record<string, unknown>;
  name_reason: string;
  url_reason: string;
  industry_reason: string;
  note?: string;
}

export interface BrandV2Audience {
  description: string;
  reason: string;
}

export interface BrandResearchResponse {
  brand: BrandV2Brand;
  industries: string[] | null;
  industry: string | null;
  audience: BrandV2Audience;
  metadata: Record<string, unknown>;
  effort: "auto" | "low" | "mid" | "high";
}

export interface ProductsOptions {
  auto?: string | null;
  brand_url?: string | null;
  brand_name?: string | null;
  response_format?: "json" | "text";
  cursor?: string | null;
  effort?: "auto" | "low" | "mid" | "high";
}

export interface ProductInfo {
  name: string;
  category: string;
  description: string;
  url: string;
}

export interface ProductsResponse {
  brand_name: string;
  brand_url: string;
  products: ProductInfo[];
  next_cursor: string | null;
  has_more: boolean | null;
  effort: "auto" | "low" | "mid" | "high";
}

export interface AudienceInsightsBrand {
  voice?: string;
  values?: string[];
}

export interface AudienceInsightsProduct {
  category?: string;
  price_tier?: string;
}

export interface AudienceInsightsAudience {
  age_range?: string;
  description?: string;
}

export interface AudienceInsightsOptions {
  brief?: string;
  industries?: string[];
  brand?: AudienceInsightsBrand;
  product?: AudienceInsightsProduct;
  audience?: AudienceInsightsAudience;
  citations_mode?: "async" | "sync" | "none";
  continuation_token?: string | null;
  source_filters?: {
    platforms?: string[];
    source_names?: string[];
    source_urls?: string[];
    restriction?: string;
  };
}

export interface PersonalityTrait {
  trait: string;
  justification: string;
}

export interface Psychology {
  motivations: string[];
  barriers: string[];
  triggers: string[];
}

export interface LanguagePatterns {
  common_phrases: string[];
  stylistic_features: string[];
  tone_descriptors: string[];
}

export interface RedditPost {
  title: string;
  summary: string;
  url: string;
  justification: string;
  subreddit: string;
}

export interface Citation {
  title: string;
  text: string;
  relevance_score: number;
  reason: string;
  url: string;
  subreddit?: string;
  source: string;
}

export interface SupportingEvidence {
  reddit_posts: RedditPost[];
}

export interface Persona {
  label: string;
  description: string;
  personality_traits: PersonalityTrait[];
  psychology: Psychology;
  language_patterns: LanguagePatterns;
  supporting_evidence: SupportingEvidence;
  citations?: Citation[];
  behaviors_demonstrated: string[];
}

export interface AudienceInsightsResponse {
  meta?: {
    generated_at?: string;
    continuation_token?: string | null;
  };
  personas: Persona[];
  rollup_summary: string;
  continuation_token?: string | null;
  citations?: Citation[];
}

export interface InsightCitationsOptions {
  continuation_token: string;
}

export interface InsightCitationsResponse {
  citations: Citation[];
  continuation_token: string | null;
}

